import axios from 'axios';

const getBikes = async (token) => {
  const url = `${process.env.REACT_APP_CUSTOMER_API}/bike`;
  const headers = { 'Authorization': `Bearer ${token}` };

  const bikes = []

  const response = await axios.get(url, { headers });

  // console.log(response);
  return response;
}

export {getBikes};