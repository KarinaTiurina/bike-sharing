import Koa from 'koa';
import Router from '@koa/router';
import { Firestore } from '@google-cloud/firestore';
import { readFileSync } from 'fs';

export const entry = async () => {
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID
    });

    const app = new Koa();
    const router = new Router();

    router.get("/bike", async (ctx) => {
        const metersToLatLng = (meters) => meters / 111111;

        const latMaybe = parseFloat(ctx.query.lat);
        const lngMaybe = parseFloat(ctx.query.lng);
        const radiusMaybe = metersToLatLng(parseInt(ctx.query.radius ?? '1000'));

        console.log(`Querying bikes with lat: ${latMaybe}, lng: ${lngMaybe}, radius: ${radiusMaybe}`);

        // Query firestore with lat, lng, and radius around
        let bikesCollection = firestore.collection("bikes");
        if (latMaybe && lngMaybe) {
            bikesCollection = bikesCollection
                .where("place.lat", ">", latMaybe - radiusMaybe)
                .where("place.lat", "<", latMaybe + radiusMaybe)
                .where("place.lng", ">", lngMaybe - radiusMaybe)
                .where("place.lng", "<", lngMaybe + radiusMaybe);
        }

        const bikes = await bikesCollection.get();
        ctx.body = bikes.docs.map(doc => doc.data());
    })

    router.get("/bike/:id", async (ctx) => {
        const bike = await firestore.collection("bikes").doc(ctx.params.id).get();
        ctx.body = bike.data();
    })

    // noinspection JSUnresolvedReference
    app.use(router.routes())
        .use(router.allowedMethods())
        .listen(process.env.PORT || 3000)
}
