# node-satispay

Node.js wrapper for the Satispay API.


## Table of Contents
- [node-satispay](#node-satispay)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Usage with callbacks](#usage-with-callbacks)
  - [API](#api)
    - [Authentication](#authentication)
      - [Obtain the KeyId](#obtain-the-keyid)
      - [Test the Authentication](#test-the-authentication)
    - [Payments](#payments)
      - [Create payment](#create-payment)
      - [Get payment details](#get-payment-details)
      - [Get shop-payments list](#get-shop-payments-list)
      - [Update payment](#update-payment)
    - [Shop daily closure](#shop-daily-closure)
      - [Retrieve daily closure](#retrieve-daily-closure)
    - [Pre-authorized](#pre-authorized)
      - [Create authorization](#create-authorization)
      - [Get authorization](#get-authorization)
    - [Fund lock](#fund-lock)
      - [Create mqtt certificates](#create-mqtt-certificates)
      - [Open session](#open-session)
      - [Create session event](#create-session-event)
      - [Get session details](#get-session-details)
      - [Update session](#update-session)
    - [Consumers](#consumers)
      - [Retrieve consumer](#retrieve-consumer)
  - [Support my projects](#support-my-projects)


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

1. Invoke the API (eg: create a Satispay payment) with required parameters (eg: flow, amount_unit, currency).
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
  amount_unit: 100,
  currency: 'EUR'
}, null, (err, payment) => {
  // ...
})
```

## API

Please refer to the [official documentation](https://developers.satispay.com/reference) for more information regarding the parameters.

`Host`, `Date`, `Digest` and `Authorization` headers are always added automatically.

### Authentication

  #### Obtain the KeyId
  API to retrieve the KeyId

    obtain_key_id(public_key, token, [callback(err, res)])

  - ##### **`public key`** (`string`)
    RSA public key, in pkcs8 encoding

  - ##### **`token`** (`string`)
    Activation code that can be generated from the Satispay Dashboard (or provided manually for Sandbox account)

  #### Test the Authentication
  API to test your authentication.

  *Please note that this API works on Sandbox endpoint only.*

    test_authentication([callback(err, res)])

### Payments
  #### Create payment
  API to create a payment

    create_payment(body_params, [extra_headers], [callback(err, res)])

  - ##### **`body_params`** (`object`)
    | field | description | type |
    |---|---|---|
    | **flow** `required` | The flow of the payment (MATCH_CODE, MATCH_USER, REFUND or PRE_AUTHORIZED)  | string |
    | **amount_unit** `required` | Amount of the payment in cents | number |
    | pre_authorized_payments_token | Pre-Authorized token id (required with the PRE_AUTHORIZED flow only) | string |
    | parent_payment_uid | Unique ID of the payment to refund (required with the REFUND flow only) | string |
    | **currency** `required` | Currency of the payment (only EUR currently supported) | string |
    | expiration_date | The expiration date of the payment | string |
    | external_code | Order ID or payment external identifier. Max length allowed is 50 chars. | string |
    | callback_url | The url that will be called with an http GET request when the Payment changes state. When url is called a Get payment details can be called to know the new Payment status. Note that {uuid} will be replaced with the Payment ID | string |
    | metadata | Generic field that can be used to store generic info . The field `phone_number` can be used to pre-fill the mobile number. If integrating the Web-Redirect `redirect_url` is mandatory | object |
    | consumer_uid | Unique ID of the consumer that has to accept the payment. To retrieve the customer uid use the [Retrive customer](####retrieve-customer) API (required with the MATCH_USER flow only) | string |

  - ##### `extra_headers` (`object`)
    | field | description | type |
    |---|---|---|
    | Idempotency-Key | The idempotent token of the request | string |
    | x-satispay-deviceinfo | Info about the device | string |
    | x-satispay-os | Operative System name | string |
    | x-satispay-devicetype | Device type: SMARTPHONE, TABLET, CASH-REGISTER, POS or PC | string |
    | x-satispay-osv | Operative System version | string |
    | x-satispay-apph | Software house name | string |
    | x-satispay-appn | Software name | string |
    | x-satispay-appv | Software version | string |
    | x-satispay-tracking-code | Tracking code used by Satispay commercial partners | string


  #### Get payment details
  API to retrieve the detail of a specific payment

    get_payment_details(id, [extra_headers], [callback(err, res)])

  - ##### **`id`** (`string`)
    The id of the payment to retrieve

  - ##### `extra_headers` (`object`)
    | field | description | type |
    |---|---|---|
    | x-satispay-response-wait-time | Seconds that the call will be hanging, waiting for a payment status change. Maximum value is 60 seconds. | string |


  #### Get shop-payments list
  API to retrieve the list of payments for a specific shop. The shop is automatically filtered based on the KeyID used in the authorisation header.

    get_shop_payments_list([query_params], [extra_headers], [callback(err, res)])

  - ##### `query_params` (`object`)
    | field | description | type |
    |---|---|---|
    | status | Filter by the payment status ACCEPTED, PENDING or CANCELED | string |
    | limit | A limit on the number of objects to be returned, between 1 and 100 | number |
    | starting_after | Is the id that defines your place in the list when you make a payment list request | string |
    | starting_after_timestamp | Is the timestamp (in milliseconds) that defines your place in the list when you make a payment list request | string |

  - ##### `extra_headers` (`object`)
    | field | description | type |
    |---|---|---|
    | x-satispay-deviceinfo | Info about the device | string |
    | x-satispay-os | Operative System name | string |
    | x-satispay-devicetype | Device type: SMARTPHONE, TABLET, CASH-REGISTER, POS or PC | string |
    | x-satispay-osv | Operative System version | string |
    | x-satispay-apph | Software house name | string |
    | x-satispay-appn | Software name | string |
    | x-satispay-appv | Software version | string |
    | x-satispay-tracking-code | Tracking code used by Satispay commercial partners | string

  #### Update payment
  API to update the state or metadata of a payment

    update_payment(id, body_params, [extra_headers], [callback(err, res)])

  - ##### **`id`** (`string`)
    The id of the payment to update

  - ##### **`body_params`** (`object`)
    | field | description | type |
    |---|---|---|
    | **action** `required` | The update action to perform (ACCEPT, CANCEL or CANCEL_OR_REFUND). | string |
    | metadata | Generic field that can be used to store the order_id. | object |

  - ##### `extra_headers` (`object`)

### Shop daily closure
  #### Retrieve daily closure
  API to retrieve shop daily closure

    retrieve_daily_closure(day, [query_params], [extra_headers], [callback(err, res)])

  - ##### **`daily_closure_date`** (`string`)
      The day on which retrieve the daily closure (format `yyyyMMdd`, eg: 20201231)

  - ##### `query_params` (`object`)
    | field | description | type |
    |---|---|---|
    | generate_pdf | Generate the pdf with the daily closure amounts | boolean |

  - ##### `extra_headers` (`object`)


### Pre-authorized
  #### Create authorization
  API to request a new pre-authorized token

    create_authorization([body_params], [extra_headers], [callback(err, res)])

  - ##### `body_params` (`object`)
    | field | description | type |
    |---|---|---|
    | reason | The reason why the token is being request | string |
    | callback_url | The url that will be called with an http GET request if the pre-authorization status changes. Note that {uuid} will be replaced with the authorization token | string |
    | metadata | Generic field that can be used to store additional data. The field `phone_number` can be used to pre-fill the mobile number. If integrating the Web-Redirect `redirect_url` is mandatory. | object |

  - ##### `extra_headers` (`object`)
    | field | description | type |
    |---|---|---|
    | Idempotency-Key | The idempotent token of the request | string |

  #### Get authorization
  API to get details about pre-authorized token

    get_authorization(id, [extra_headers], [callback(err, res)])

  - ##### **`id`** (`string`)
    Pre-Authorized Payment Token

  - ##### `extra_headers` (`object`)



### Fund lock
  #### Create mqtt certificates
  API to create a PEM certificate and the private key for a shop mqtt device

    create_mqtt_certificates([extra_headers], [callback(err, res)])

  - ##### `extra_headers` (`object`)

  #### Open session
  API to open a session from a fund lock

    open_session(body_params, [extra_headers], [callback(err, res)])

  - ##### **`body_params`** (`object`)
    | field | description | type |
    |---|---|---|
    | **fund_lock_uid** `required` | Unique ID of the fund lock obtained from mqtt client | string |

  - ##### `extra_headers` (`object`)
    | field | description | type |
    |---|---|---|
    | Idempotency-Key | The idempotent token of the request | string |



  #### Create session event
  API to create an event for an open session

    create_session_event(id, body_params, [extra_headers], [callback(err, res)])

  - ##### **`id`** (`string`)
    The ID of the session

  - ##### **`body_params`** (`object`)
    | field | description | type |
    |---|---|---|
    | **operation** `required` | The operation to perform on the amount (ADD/REMOVE) | string |
    | **amount_unit** `required` | Amount of the session event in cents | string |
    | **currency** `required` | Currency of the session event | string |

  - ##### `extra_headers` (`object`)
    | field | description | type |
    |---|---|---|
    | Idempotency-Key | The idempotent token of the request | string |



  #### Get session details
  API to retrieve the detail of a specific session

    get_session_details(id, [extra_headers], [callback(err, res)])

  - ##### **`id`** (`string`)
    The ID of the session

  - ##### `extra_headers` (`object`)


  #### Update session
  API to change the state of the session

    update_session(id, body_params, extra_headers, [callback(err, res)])

  - ##### **`id`** (`string`)
    The ID of the session

  - ##### **`body_params`** (`object`)
    | field | description | type |
    |---|---|---|
    | **action** `required` | The operation to perform on the session (CLOSE) | string |

  - ##### `extra_headers` (`object`)


### Consumers
  #### Retrieve consumer
  API to retrieve a customer uid from the phone number

    retrieve_consumer(phone_number, [extra_headers], [callback(err, res)])

  - ##### **`phone_number`** (`string`)
    The phone number formatted with its prefix (eg. +390000000000)

  - ##### `extra_headers` (`object`)


---

## Support my projects
If you appreciate my work and want to give something back, you can make a donation. I'll probably buy a ~~coffee~~ beer.

- **PayPal**
	You can make a donation [here](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ASQ5SYTCM7VXG&item_name=node-satispay+donations&currency_code=EUR).

- **Bitcoin**
	You can send me bitcoins at this address: `37frCJizACGsqwUYf7DR9mx1m1AFdGBPVg`.

	![](img/btc.png)

Thanks! :)