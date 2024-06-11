import {Firestore} from "@google-cloud/firestore"

const firestore = new Firestore({
    projectId: process.env.PROJECT_ID,
    databaseId: process.env.DATABASE_ID
});

const bikeNumber = process.argv[2];
const targetLat = parseFloat(process.argv[3]);
const targetLng = parseFloat(process.argv[4]);
console.log(`Moving bike ${bikeNumber} to lat: ${targetLat}, lng: ${targetLng}`);

const bike = await firestore.collection("bikes").doc(bikeNumber).get();
const currentLat = bike.data().place.lat;
const currentLng = bike.data().place.lng;

const metersToLatLng = (meters) => meters / 111111;

// Move linearly to target over 20 steps
const steps = 20;

for (let i = 1; i <= steps; i++) {
    const lat = currentLat + (targetLat - currentLat) / steps * i;
    const lng = currentLng + (targetLng - currentLng) / steps * i;

    console.log(`Moving to lat: ${lat}, lng: ${lng}`);

    await firestore.collection("bikes").doc(bikeNumber).update({
        "place.lat": lat,
        "place.lng": lng
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
}
