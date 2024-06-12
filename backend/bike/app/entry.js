import Koa from 'koa';
import Router from '@koa/router';
import { Firestore } from '@google-cloud/firestore';
import session from 'koa-session';
import jwt from "koa-jwt";
import { koaJwtSecret } from "jwks-rsa"

export const entry = async () => {
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID
    });

    const app = new Koa();
    const router = new Router();

    router.post("/bike/update", async (ctx) => {
        const bikeNumber = ctx.state.user.sub;
        if (!bikeNumber) {
            ctx.status = 401;
            ctx.body = { error: "Unauthorized" };
            return;
        }

        const {
            active,
            position: { lat, lng }
        } = ctx.request.body;

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
        .use(jwt({
            secret: koaJwtSecret({
                jwksUri: process.env.JWKS_URI
            }),
            audience: process.env.AUDIENCE,
            issuer: process.env.ISSUER,
            algorithms: ['RS256']
        }))
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(process.env.PORT || 3000)
}
