import axios from 'axios';

const callNextBikesApi = async () => {
  const WARSAW = 812
  const url = `https://api.nextbike.net/maps/nextbike-live.json?city=${WARSAW}`;

  const bikes = []

  const response = await axios.get(url)

  const city = response.data?.countries[0]?.cities[0]
  city.places.forEach(place => {
    const lat = place.lat;
    const lng = place.lng;
    place.bike_list.forEach(bike => {
      bikes.push({
        id: bike.number,
        lat, lng,
        type: bike.bike_type
      })
    })
    
  })
  return bikes;
}

export {callNextBikesApi};