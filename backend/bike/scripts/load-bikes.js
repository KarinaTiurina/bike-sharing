import dotenv from 'dotenv';
dotenv.config();

import { readFileSync } from "fs"
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore({
    projectId: process.env.PROJECT_ID,
    databaseId: process.env.DATABASE_ID
});

const veturiloResponse = JSON.parse(readFileSync("bikes.json", "utf-8"))

const bikes = veturiloResponse
    .countries
    .flatMap(countries => countries)
    .flatMap(country => country.cities)
    .flatMap(city => city.places)
    .flatMap(place => {
        let bikes = place.bike_list ?? []
        return bikes.map(bike => ({
            ...bike,
            position: {
                lat: place.lat,
                lng: place.lng,
            },
            place: {
                uid: place.uid,
                name: place.name,
                address: place.address,
                spot: place.spot,
                number: place.number,
                bike_racks: place.bike_racks,
                special_racks: place.special_racks,
                maintenance: place.maintenance,
                terminal_type: place.terminal_type
            },
            current_user: null,
            active: true,
            state: "free"
        }))
    });

const collection = firestore.collection("bikes")

for (const bike of bikes) {
    console.log(`Adding bike ${bike.number}`)
    await collection.doc(bike.number).set(bike)
}
