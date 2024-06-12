import dotenv from "dotenv"
dotenv.config()

import axios from "axios"
import * as crypto from "node:crypto"
import { bikes } from "./common/bike-loader.js"

const concurrentBikeMoves = 10
const bikeMoveInterval = 1000
const backendUrl = `http://localhost:3032`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

while (true) {
    const activeBikes = bikes.filter(bike => bike.active)
    // Choose random bikes to update
    const bikesToUpdate = activeBikes
        .sort(() => Math.random() - 0.5)
        .slice(0, concurrentBikeMoves)

    await Promise
        .all(
            bikesToUpdate.map(async bike => {
                const randomLat = Math.random() * 0.0001 - 0.00005
                const randomLng = Math.random() * 0.0001 - 0.00005

                const newLat = bike.position.lat + randomLat
                const newLng = bike.position.lng + randomLng

                // 0.99 chance of bike active = true and 0.01 chance of bike active = false
                const active = Math.random() < 0.99

                // Generate HMAC signature
                const hmac = crypto.createHmac("sha256", process.env.HMAC_SECRET)
                hmac.update(bike.number)
                const signature = hmac.digest("base64")

                await axios
                    .put(
                        `${backendUrl}/bike`,
                        {
                            position: {
                                lat: newLat,
                                lng: newLng
                            },
                            active
                        },
                        {
                            headers: {
                                Authorization: `${bike.number}.${signature}`
                            }
                        }
                    )
                    .catch(console.error)

                console.log(`Bike ${bike.number} moved to ${newLat}, ${newLng} is active: ${active}`)
            })
        )
        .catch(console.error)

    await sleep(bikeMoveInterval)
}
