import {readFileSync} from "fs"

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
            place: {
                uid: place.uid,
                lat: place.lat,
                lng: place.lng,
                name: place.name,
                address: place.address,
                spot: place.spot,
                number: place.number,
                bike_racks: place.bike_racks,
                special_racks: place.special_racks,
                maintenance: place.maintenance,
                terminal_type: place.terminal_type
            }
        }))
    });
