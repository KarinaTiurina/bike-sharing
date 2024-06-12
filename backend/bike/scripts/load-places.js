import dotenv from 'dotenv';
dotenv.config();

import { Firestore } from '@google-cloud/firestore';
import { places } from "./common/bike-loader.js"

const firestore = new Firestore({
    projectId: process.env.GCP_PROJECT,
    databaseId: process.env.DATABASE_ID
});

const collection = firestore.collection("place")

for (const place of places) {
    console.log(`Adding place ${place.uid}`)
    await collection.doc(place.uid).set(place)
}
