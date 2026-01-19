import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  //duration: '30s',
};

export default function() {
  const urlLogin = 'http://localhost:3000/api/users/login';
  const payloadLogin = JSON.stringify({
    email: 'clarice@email',
    password: '123456',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let responseLogin = http.post(urlLogin, payloadLogin, params);

  console.log('Response Body:', responseLogin.body);

  check(responseLogin, {
    'is status 200': (r) => r.status === 200,
    'response has token': (r) => JSON.parse(r.body).hasOwnProperty('token'),
  });

  const urlCheckout = 'http://localhost:3000/api/checkout';
  const payloadCheckout = JSON.stringify({
    'items': [
      {
        'productId': 0,
        'quantity': 0
      }
    ],
    'freight': 0,
    'paymentMethod': 'boleto',
    'cardData': {
      'number': 'string',
      'name': 'string',
      'expiry': 'string',
      'cvv': 'string'
    }
});
  const responseCheckout = http.post(urlCheckout, payloadCheckout, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JSON.parse(responseLogin.body).token}`,
    },
  });

  console.log('Checkout Response Body:', responseCheckout.body);

  
  sleep(1);
}
