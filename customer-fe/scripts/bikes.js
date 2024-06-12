const axios = require('axios');

// const data = require('./New_Request-1717005494551.json');

// const pl_countries = data.countries.filter(c => c.country === 'PL').filter(c => c.available_bikes > 0)

// // for (const c in pl_countries) {
// //   console.log(c.email)
// // }

// pl_countries.forEach(c => {
//   c.cities.filter(city => city.name === 'Warszawa').forEach(city => {
//     console.log(Object.keys(city))
//     console.log(city.available_bikes)
//     console.log(city.uid)
//   })
// });

// console.log(Object.keys(pl_countries[1].cities[0]))

const fetchBikes = async () => {
  const WARSAW = 812
  const url = `https://api.nextbike.net/maps/nextbike-live.json?city=${WARSAW}`;

  const bikes = []

  const response = await axios.get(url)

  const city = response.data?.countries[0]?.cities[0]
  city.places.forEach(place => {
    const lat = place.lat;
    const lng = place.lng;
    place.bike_list.forEach(bike => {
      // console.log(bike.number)
      bikes.push({
        id: bike.number,
        lat, lng
      })
    })

  })
  console.log(bikes.length)
}

fetchBikes()
