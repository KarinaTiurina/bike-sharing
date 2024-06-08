import axios from 'axios';

const callNearBySearch = async (lat, lng, type = 'tourist_attraction') => {
  // const WARSAW = 812
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}` +
    `&location=${lat},${lng}&radius=20000&type=${type}`;

  console.log(url)

  let places = []

  try {
    const response = await axios.get(url)

    places = response?.data.results || [];
    console.log(places)
  } catch (error) {
    console.log(error)
  }

  return places;
}

export {callNearBySearch};