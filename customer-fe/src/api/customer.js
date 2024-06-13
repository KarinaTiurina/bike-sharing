import axios from 'axios';

const getBikes = async (token) => {
  const url = `${process.env.REACT_APP_CUSTOMER_API}/bike`;
  const headers = { 'Authorization': `Bearer ${token}` };

  const response = await axios.get(url, { headers });

  // console.log(response);
  return response;
}

const getMyBikes = async (token) => {
  const url = `${process.env.REACT_APP_CUSTOMER_API}/bike/my`;
  const headers = { 'Authorization': `Bearer ${token}` };

  const response = await axios.get(url, { headers });

  // console.log(response);
  return response;
}

const bookBikeApi = async (bikeId, token) => {
  const url = `${process.env.REACT_APP_CUSTOMER_API}/bike/${bikeId}/book`;
  const headers = { 'Authorization': `Bearer ${token}` };

  const response = await axios.post(url, {}, { headers });

  // console.log(response);
  return response;
}

const rentBikeApi = async (bikeId, token) => {
  const url = `${process.env.REACT_APP_CUSTOMER_API}/bike/${bikeId}/rent`;
  const headers = { 'Authorization': `Bearer ${token}` };

  const response = await axios.post(url, {}, { headers });

  // console.log(response);
  return response;
}

const returnBikeApi = async (bikeId, token) => {
  const url = `${process.env.REACT_APP_CUSTOMER_API}/bike/${bikeId}/return`;
  const headers = { 'Authorization': `Bearer ${token}` };

  const response = await axios.post(url, {}, { headers });

  // console.log(response);
  return response;
}

export {getBikes, bookBikeApi, rentBikeApi, getMyBikes, returnBikeApi};