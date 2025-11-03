const axios = require('axios');

const API = 'http://localhost:3000/api/garden';
const token = process.env.GARDEN_TOKEN;

(async function () {
  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await axios.get(API, { headers });
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
      process.exit(1);
    } else {
      console.error('Error:', err.message);
      process.exit(1);
    }
  }
})();
