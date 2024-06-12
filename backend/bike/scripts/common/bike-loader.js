import {readFileSync} from "fs"

const veturiloResponse = JSON.parse(readFileSync("bikes.json", "utf-8"))

export const bikes = veturiloResponse
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
            current_user: null,
            active: true,
            state: "free"
        }))
    });

export const places = veturiloResponse
    .countries
    .flatMap(countries => countries)
    .flatMap(country => country.cities)
    .flatMap(city => city.places)
    .map(place => ({
        uid: `${place.uid}`,
        name: place.name,
        address: place.address,
        spot: place.spot,
        number: place.number,
        bike_racks: place.bike_racks,
        special_racks: place.special_racks,
        maintenance: place.maintenance,
        terminal_type: place.terminal_type,
        position: {
            lat: place.lat,
            lng: place.lng,
        }
    }));
