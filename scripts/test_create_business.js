const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/dbhandler?model=business', {
      name: 'teststore-' + Date.now(),
      ownerId: '000000000000000000000000',
      template: 'estore'
    });
    console.log('create response', res.data);
  } catch (e) {
    console.error('error', e.response ? e.response.data : e.message);
  }
})();
