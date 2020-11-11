# node-satispay

Node.js wrapper for the Satispay API.


## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Usage with callbacks](#usage-with-callbacks)
- [API](#api)


## Installation

```sh
npm i node-satispay
```


## Usage

1. [Generate RSA keys](https://developers.satispay.com/reference#genereate-rsa-keys) and [Obtain the KeyId](https://developers.satispay.com/reference#keyid) as described in the official documentation.

2. Require `node-satispay` in your file.
    ```js
    const satispay = require('node-satispay')
    ```

3. Create config options, with parameters (key_id, private_key, sandbox).
    ```js
    satispay.config({
		key_id: 'your_key_id',
		private_key: 'your_private_key', //`-----BEGIN RSA PRIVATE KEY-----\n[...]\n-----END RSA PRIVATE KEY-----`
		sandbox: true
    })
    ```

5. Invoke the API (eg: create a Satispay payment) with required parameters (eg: flow, amount_unit, currency).
    ```js
    const payment = await satispay.create_payment({
		flow: 'MATCH_CODE',
		amount_unit: 100,
		currency: 'EUR'
	})
    ```


## Usage with callbacks

Promises and callbacks are both supported.
```js
satispay.create_payment({
		flow: 'MATCH_CODE',
		amount_unit,
		currency: 'EUR'
	}, null, (err, payment) => {
		// ...
	}
)
```


## API

Pleas refer to the [official documentation](https://developers.satispay.com/reference) for more information regarding the parameters.

`Host`, `Date`, `Digest` and `Authorization` headers are always added automatically.

### Payments

#### `create_payment(body_params, [extra_headers], [callback(err, res)])`

#### `get_payment_details(id, [extra_headers], [callback(err, res)])`

#### `get_shop_payments_list([query_params], [extra_headers], [callback(err, res)])`


### Shop daily closure

#### `retrieve_daily_closure(day, [query_params], [extra_headers], [callback(err, res)])`


### Pre-authorized

#### `create_authorization([body_params], [extra_headers], [callback(err, res)])`

#### `get_authorization(id, [extra_headers], [callback(err, res)])`


### Fund lock

#### `create_mqtt_certificates([extra_headers], [callback(err, res)])`

#### `create_session_event(id, body_params, [extra_headers], [callback(err, res)])`

#### `get_session_details(id, [extra_headers], [callback(err, res)])`

#### `update_session(id, body_params, extra_headers, [callback(err, res)])`


### Others

#### `obtain_key_id(token, public_key, [callback(err, res)])`

#### `test_authentication([callback(err, res)])`
- Works on sandbox endpoint only.

---

## Support my projects
If you appreciate my work and want to give something back, you can make a donation. I'll probably buy a ~~coffee~~ beer.

- **PayPal**
	You can make a donation [here](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ASQ5SYTCM7VXG&item_name=node-satispay+donations&currency_code=EUR).

- **Bitcoin**
	You can send me bitcoins at this address: `37frCJizACGsqwUYf7DR9mx1m1AFdGBPVg`.

	![](https://i.imgur.com/YdtUCxv.png)

Thanks! :)