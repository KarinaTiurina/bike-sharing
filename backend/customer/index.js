import dotenv from 'dotenv';
dotenv.config();

import { entry } from './app/entry.js';

entry()
    .then(() => {
        console.log(`Service started at port ${process.env.PORT || 3000}`);
    })
    .catch((err) => {
        console.error('Service failed to start', err);
    });
