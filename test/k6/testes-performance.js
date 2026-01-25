import http from 'k6/http';
import { sleep, check, group } from 'k6';
import {randomEmail} from './helpers/randomData.js';
import { BASE_URL } from './helpers/baseURL.js';
import { postCall } from './helpers/apiCalls.js';

export const options = {
  vus: 1,
  iterations: 1,
  //duration: '20s',
  thresholds: {
    http_req_duration: ['p(90)<=20', 'p(95)<=19'], 
    http_req_failed: ['rate<0.01'],
  }
};

export default function() {
  let user = {
    name: 'Clarice Lispector',
    email: randomEmail(),
    password: '123456',
  };

  let token = '';

  group("Registrar usuário", function () {
      let responseRegister = postCall('/api/users/register', JSON.stringify(user));
      check(responseRegister, {
        'register is status 201': (r) => r.status === 201,
        'user has name': (r) => r.json('user.name') === user.name,
      });
  });

  group("Fazendo login", function () {
    let responseLogin = postCall('/api/users/login', JSON.stringify({
      email: user.email,
      password: user.password,
    }));

    check(responseLogin, {
      'login is status 200': (r) => r.status === 200,
      'response has token': (r) => r.json('token'),
    });

    token = responseLogin.json('token');
  });

  group("Registrando checkout", function () {
    const payloadCheckout = JSON.stringify({
      'items': [
        {
          'productId': 1,
          'quantity': 2
        }
      ],
      'freight': 0,
      'paymentMethod': 'credit_card',
      'cardData': {
        'number': '4111111111111111',
        'name': 'Nome do Titular',
        'expiry': '12/30',
        'cvv': '123'
      }
    });

    let responseCheckout = http.post(`${BASE_URL}/api/checkout`, payloadCheckout, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    check(responseCheckout, {
      'checkout is status 200': (r) => r.status === 200,
    });
  })

  group("Simulando o pensamento do usuário", function () {
    sleep(1); //User think time
  });
}
