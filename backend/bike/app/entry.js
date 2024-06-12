import Koa from 'koa';
import Router from '@koa/router';
import { Firestore } from '@google-cloud/firestore';
import session from 'koa-session';
import { bodyParser } from "@koa/bodyparser"
import * as crypto from "node:crypto"

export const entry = async () => {
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID
    });

    const app = new Koa();
    const router = new Router();

    router.put("/bike", async (ctx) => {
        const bikeNumber = ctx.state.user.sub;
        if (!bikeNumber) {
            ctx.status = 401;
            ctx.body = { error: "Unauthorized" };
            return;
        }

        if (!ctx.request.body) {
            ctx.status = 400;
            ctx.body = { error: "Invalid request" };
            return;
        }

        const position = ctx.request.body.position;
        const lat = position?.lat;
        const lng = position?.lng;

        const active = ctx.request.body.active;

        if (typeof active !== "boolean") {
            ctx.status = 400;
            ctx.body = { error: "Invalid active" };
            return;
        }

        if (typeof lat !== "number" || typeof lng !== "number") {
            ctx.status = 400;
            ctx.body = { error: "Invalid position" };
            return;
        }

        console.log(`Bike ${bikeNumber} moved to ${lat}, ${lng} is active: ${active}`);

        await firestore
            .collection("bikes")
            .doc(bikeNumber)
            .update({
                active,
                position: { lat, lng }
            });

        ctx.body = { success: true };
    })

    app.use(session(app))
        .use(async (ctx, next) => {
            // Authenticate the bike using HMAC
            const { authorization } = ctx.headers;
            if (!authorization) {
                ctx.status = 401;
                ctx.body = { error: "Unauthorized: Missing Authorization header" };
                return;
            }

            const [bikeNumber, signature] = authorization.split(".");
            if (!bikeNumber || !signature) {
                ctx.status = 401;
                ctx.body = { error: "Unauthorized: Invalid Authorization header" };
                return;
            }

            const hmac = crypto.createHmac("sha256", process.env.HMAC_SECRET);
            hmac.update(bikeNumber);
            const expectedSignature = hmac.digest("base64");

            if (signature !== expectedSignature) {
                ctx.status = 401;
                ctx.body = { error: "Unauthorized: Invalid Signature" };
                return;
            }

            ctx.state.user = { sub: bikeNumber };
            await next();
        })
        .use(bodyParser())
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(process.env.PORT || 3000)
}
