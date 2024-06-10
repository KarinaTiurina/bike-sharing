import Koa from 'koa';
import process from 'process';

export const entry = async () => {
    const app = new Koa();
    app.listen(process.env.PORT || 3000);
}
