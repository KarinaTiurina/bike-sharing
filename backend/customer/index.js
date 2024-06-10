import { entry } from './app/entry.js';

entry()
    .then(() => {
        console.log('Service started');
    })
    .catch((err) => {
        console.error('Service failed to start', err);
    });
