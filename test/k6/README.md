
## Conceitos aplicados no código:
### Thresholds
O conceito Thresholds foi aplicado no arquivo test/k6/testes-performance.js (linhas 15 a 18), com a inclusão da validação das duas métricas `http_req_duration` (percentil 90 e 95) e `http_req_failed` (taxa de erros).

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(90)<=20', 'p(95)<=19'], 
    http_req_failed: ['rate<0.01'],
  }, 
  //omitido restante do código
}

```

### Checks
Checks está presente em vários trechos do arquivo test/k6/testes-performance.js, validando o status code no response das requisições POST. Como demonstração temos a verificação do status code para o endpoint POST `/api/checkout` (linhas 72 a 74), onde é realizada uma comparação booleana para confirmar se o valor retornado é igual a 200.

```javascript

    check(responseCheckout, {
      'checkout is status 200': (r) => r.status === 200,
    });

```

### Helpers
Foram criados dois arquivos que empregam o conceito de Helpers `apiCalls.js` (método para requisição POST) e `baseURL.js` (método para obter a URL Base da API) que estão no diretório test/k6/helpers.

Como demonstração temos o código abaixo que foi extraído do arquivo test/k6/testes-performance.js (linhas 63 a 68), com a chamada ao método `postCall` (implementação no arquivo test/k6/helpers/apiCalls.js). O método `postCall` é um utilitário para as requisições POST com os parâmetros resource (sem a URL base da API), payload (corpo da requisição) e params (campo opcional, com valor default). Todas as requisições POST do teste utilizam `postCall` para reutilizar configurações repetidas, como a URL base e os params.

```javascript
import { postCall } from './helpers/apiCalls.js';

//omitido restante do código

    let responseCheckout = postCall('/api/checkout', payloadCheckout, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

```

### Trends
O conceito de Trends foi utilizado para todas as requisições POST da API (post_checkout_duration, post_login_duration e post_register_duration). Para exemplificar temos a Trend do endpoint `/api/checkout`, para a métrica `Response.timings.duration` com o nome `post_checkout_duration` que está armazenado no arquivo test/k6/testes-performance.js. 

```javascript
//import na linha 4
import {Trend} from 'k6/metrics';

//omitido restante do código
//linha 25 declaracao da variável postCheckoutTrend
const postCheckoutTrend = new Trend('post_checkout_duration', true);

//omitido restante do código
//linha 73 
    postCheckoutTrend.add(responseCheckout.timings.duration);

```

### Faker
O conceito de Faker é utilizado na geração dos dados do usuário (nome, email e senha) a ser registrado pelo endpoint `/api/users/register`. O código abaixo foi extraído do arquivo test/k6/testes-performance.js (linha 31 a 35).
```javascript
//linha 2
import { Faker } from 'k6/x/faker';

//linha 31 a 35
  const user = {
    name: faker.person.name(),
    email: faker.person.email(),
    password: faker.internet.password(false,false,true,false, false, 6),
  };


```

### Variável de Ambiente
A variável de ambiente BASE_URL está sendo utilizada pelo Helper `postCall` que está no arquivo test/k6/helpers/apiCalls.js (ver trecho de código abaixo). A variável BASE_URL possui valor padrão configurado, ou poderá ter o seu valor repassado via comando.
```javascript
import { BASE_URL } from './baseURL.js';
export function postCall(resource, payload, params = {headers: {
          'Content-Type': 'application/json',
        },}){
    return http.post(`${BASE_URL}${resource}`, payload, params);
}

```

### Stages
O código abaixo está armazenado no arquivo test/k6/testes-performance.js (linhas 17 a 22) e demontra o uso do conceito de Stages (ramp up, ramp down, e etc.) na constante options.
```javascript
export const options = {
//omitido restante do código

  stages: [
    { duration: '30s', target: 5 }, //ramp up
    { duration: '45s', target: 10 }, //average
    { duration: '45s', target: 10 }, //average
    { duration: '30s', target: 0 }, // ramp down
  ],
};

```

### Reaproveitamento de Resposta
O código abaixo está armazenado no arquivo test/k6/testes-performance.js, e demontra o reaproveitamento da resposta da requisição POST do endpoint `/api/users/login` (group "Fazendo Login"), com a variável `token` que contém o token obtido do response, que é utilizado no headers (`Bearer ${token}`) da requisição POST do endpoint `/api/checkout` (group "Registrando checkout"). 
```javascript
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


```

### Uso de Token de Autenticação
O token obtido no group `Fazendo login` é utilizado na requisição POST do endpoint `/api/checkout`. O código abaixo foi extraído do arquivo test/k6/testes-performance.js, que exemplifica a utilização de token no header da requisição `Authorization': Bearer ${token},`
```javascript

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

```

### Data-Driven Testing
O conceito de Data-Driven Testing foi utilizado para geração de massa de dados a ser utilizado no body request do endpoint  POST `/api/checkout`. Importado o módulo `k6/data`, e criada a constante `checkoutData`, que lê o arquivo json com os dados válidos (diretório test/k6/data/checkout.test.data.json).
No group "Registrando checkout" que está armazendo no arquivo test/k6/testes-performance.js temos a constante `payloadCheckout` que obtém os dados da constante `checkoutData` (cujo indice é obtido, a partir de mod e/ou resto da divisão entre VU e/ou virtual user menos um, e o tamanho da constante `checkoutData`, a fim de reaproveitar a massa de dados ao longo da execução).
```javascript
//linha 5
import {SharedArray} from 'k6/data';
//omitido restante do código

//linha 8 a 10
const checkoutData = new SharedArray('checkout data', function() {
    return JSON.parse(open('./data/checkout.test.data.json'));
});
//omitido restante do código

//linha 60 a 74
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

```

### Groups
O código abaixo está armazenado no arquivo test/k6/testes-performance.js (linhas 46 a 58), e demontra o uso do conceito de Groups. No exemplo abaixo temos o group `Fazendo login`, que faz uso do helper `postCall` na requisição POST do endpoint `/api/users/login`, o status code do response é validado pelo Check. A partir do response é obtido o token que é armazenado na variável token. No group também temos a configuração da Trend `postLoginTrend`.
```javascript
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

```