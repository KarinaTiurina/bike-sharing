import dotenv from 'dotenv';
dotenv.config();

import { Firestore } from '@google-cloud/firestore';
import { bikes } from "./common/bike-loader.js"

const firestore = new Firestore({
    projectId: process.env.GCP_PROJECT,
    databaseId: process.env.DATABASE_ID
});

const collection = firestore.collection("bikes")

for (const bike of bikes) {
    console.log(`Adding bike ${bike.number}`)
    await collection.doc(bike.number).set(bike)
}
