import {applyOptional, metersToLatLng, parseNullableFloat, parseNullableInt} from "./utils.js"

import Koa from 'koa';
import Router from '@koa/router';
import {Firestore} from '@google-cloud/firestore';
import session from 'koa-session';
import jwt from "koa-jwt";
import {koaJwtSecret} from "jwks-rsa"
import {uuid} from "uuidv4"

export const entry = async () => {
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID
    });

    const app = new Koa();
    const router = new Router();

    router.get("/bike", async (ctx) => {
        const latMaybe = parseNullableFloat(ctx.query.lat);
        const lngMaybe = parseNullableFloat(ctx.query.lng);
        const radiusMaybe = applyOptional(metersToLatLng, parseNullableInt(ctx.query.radius) ?? 1000);

        console.log(`Querying bikes with lat: ${latMaybe}, lng: ${lngMaybe}, radius: ${radiusMaybe}`);

        // Query firestore with lat, lng, and radius around
        let bikesCollection = firestore.collection("bikes");
        if (latMaybe && lngMaybe) {
            bikesCollection = bikesCollection
                .where("position.lat", ">", latMaybe - radiusMaybe)
                .where("position.lat", "<", latMaybe + radiusMaybe)
                .where("position.lng", ">", lngMaybe - radiusMaybe)
                .where("position.lng", "<", lngMaybe + radiusMaybe);
        }

        bikesCollection = bikesCollection
            .where("state", "==", "free")

        const bikes = await bikesCollection.get();
        ctx.body = bikes.docs.map(doc => doc.data());
    })

    router.get("/bike/my", async (ctx) => {
        const bikes = await firestore
            .collection("bikes")
            .where("current_user", "==", ctx.state.user.email)
            .get();

        ctx.body = bikes.docs.map(doc => doc.data());
    })

    router.get("/bike/:id", async (ctx) => {
        const bike = await firestore
            .collection("bikes")
            .doc(ctx.params.id)
            .get();

        ctx.body = bike.data();
    })

    router.post("/bike/:id/book", async (ctx) => {
        const bike = await firestore
            .collection("bikes")
            .doc(ctx.params.id)
            .get();

        const bikeData = bike.data();

        // If current user is not the one who booked the bike
        if (bikeData.current_user && bikeData.current_user !== ctx.state.user.email) {
            ctx.status = 400;
            ctx.body = { error: "You can't book this bike as it's already booked by someone else" };
            return;
        }

        // If bike is already booked
        if (bikeData.state === "booked") {
            ctx.status = 400;
            ctx.body = { error: "Bike is already booked" };
            return;
        }

        // If bike is already rented
        if (bikeData.state === "rented") {
            ctx.status = 400;
            ctx.body = { error: "Bike is already rented" };
            return;
        }

        const transactionKey = uuid();

        // Update bike state to booked
        const updatedBike = {
            ...bikeData,
            state: "booked",
            current_user: ctx.state.user.email,
            current_transaction: transactionKey
        }

        await firestore.collection("bikes")
            .doc(ctx.params.id)
            .update(updatedBike);

        // Add booking to the database
        const transaction = {
            key: transactionKey,
            bike: ctx.params.id,
            user: ctx.state.user.email,
            action: "booked",
            timestamp: new Date()
        };

        await firestore.collection("bike_transactions")
            .add(transaction);

        ctx.body = {
            message: "Bike booked",
            bike: updatedBike,
            transaction: transaction
        };
    })

    router.post("/bike/:id/rent", async (ctx) => {
        const bike = await firestore
            .collection("bikes")
            .doc(ctx.params.id)
            .get();

        const bikeData = bike.data();

        // If current user is not the one who booked the bike
        if (bikeData.current_user && bikeData.current_user !== ctx.state.user.email) {
            ctx.status = 400;
            ctx.body = { error: "You can't rent this bike as it's not booked by you" };
            return;
        }

        // If bike is already rented
        if (bikeData.state === "rented") {
            ctx.status = 400;
            ctx.body = { error: "Bike is already rented" };
            return;
        }

        const transactionKey = bikeData.current_transaction ?? uuid();

        // Update bike state to rented
        const updatedBike = {
            ...bikeData,
            state: "rented",
            current_user: ctx.state.user.email
        }

        await firestore.collection("bikes")
            .doc(ctx.params.id)
            .update(updatedBike);

        // Add renting to the database
        const transaction = {
            key: transactionKey,
            bike: ctx.params.id,
            user: ctx.state.user.email,
            action: "rented",
            timestamp: new Date(),
            position: bikeData.position
        };

        await firestore.collection("bike_transactions")
            .add(transaction);

        ctx.body = {
            message: "Bike rented",
            bike: updatedBike,
            transaction: transaction
        };
    })

    router.post("/bike/:id/return", async (ctx) => {
        const bike = await firestore
            .collection("bikes")
            .doc(ctx.params.id)
            .get();

        const bikeData = bike.data();

        // If current user is not the one who rented the bike
        if (bikeData.current_user && bikeData.current_user !== ctx.state.user.email) {
            ctx.status = 400;
            ctx.body = { error: "You can't return this bike as it's not rented by you" };
            return;
        }

        // If bike is already free
        if (bikeData.state === "free") {
            ctx.status = 400;
            ctx.body = { error: "Bike is already free" };
            return;
        }

        const transactionKey = bikeData.current_transaction ?? uuid();

        // Update bike state to free
        const updatedBike = {
            ...bikeData,
            state: "free",
            current_user: null,
            current_transaction: null
        }

        await firestore.collection("bikes")
            .doc(ctx.params.id)
            .update(updatedBike);

        // Add returning to the database
        const transaction = {
            key: transactionKey,
            bike: ctx.params.id,
            user: ctx.state.user.email,
            action: "returned",
            timestamp: new Date(),
            position: bikeData.position
        };

        await firestore.collection("bike_transactions")
            .add(transaction);

        ctx.body = {
            message: "Bike returned",
            bike: updatedBike,
            transaction: transaction
        };
    })

    // noinspection JSUnresolvedReference
    app.use(session(app))
        .use(jwt({
            secret: koaJwtSecret({
                jwksUri: process.env.JWKS_URI
            }),
            audience: process.env.AUDIENCE,
            issuer: process.env.ISSUER,
            algorithms: ['RS256'],
            debug: true
        }))
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(process.env.PORT || 3000)
}
