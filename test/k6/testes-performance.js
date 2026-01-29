import { sleep, check, group } from 'k6';
import { Faker } from 'k6/x/faker';
import { postCall } from './helpers/apiCalls.js';
import {Trend} from 'k6/metrics';
import {SharedArray} from 'k6/data';

const faker = new Faker();
const checkoutData = new SharedArray('checkout data', function() {
    return JSON.parse(open('./data/checkout.test.data.json'));
});

export const options = {
  thresholds: {
    http_req_duration: ['p(90)<=20', 'p(95)<=19'], 
    http_req_failed: ['rate<0.01'],
  }, 
  stages: [
    { duration: '30s', target: 5 }, //ramp up
    { duration: '45s', target: 10 }, //average
    { duration: '45s', target: 10 }, //average
    { duration: '30s', target: 0 }, // ramp down
  ],
};

const postCheckoutTrend = new Trend('post_checkout_duration', true);
const postLoginTrend = new Trend('post_login_duration', true);
const postRegisterTrend = new Trend('post_register_duration', true);

export default function() {
  let token = '';
  const user = {
    name: faker.person.name(),
    email: faker.person.email(),
    password: faker.internet.password(false,false,true,false, false, 6),
  };

  group("Registrar usuário", function () {
      let responseRegister = postCall('/api/users/register', JSON.stringify(user));
      check(responseRegister, {
        'register is status 201': (r) => r.status === 201,
        'user has name': (r) => r.json('user.name') === user.name,
      });
      postRegisterTrend.add(responseRegister.timings.duration);
  });

  group("Fazendo login", function () {
    let responseLogin = postCall('/api/users/login', JSON.stringify({
      email: user.email,
      password: user.password,
    }));

    check(responseLogin, {
      'login is status 200': (r) => r.status === 200,
    });

    token = responseLogin.json('token');
    postLoginTrend.add(responseLogin.timings.duration);
  });

  group("Registrando checkout", function () {
    const payloadCheckout = JSON.stringify(checkoutData[(__VU - 1) % checkoutData.length]);

    let responseCheckout = postCall('/api/checkout', payloadCheckout, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    check(responseCheckout, {
      'checkout is status 200': (r) => r.status === 200,
    });
    postCheckoutTrend.add(responseCheckout.timings.duration);
  })

  group("Simulando o pensamento do usuário", function () {
    sleep(1); //User think time
  });
}