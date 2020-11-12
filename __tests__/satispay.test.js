/**
 * @jest-environment node
 */

let config

describe('Satispay API', () => {
	describe('Tests setup', () => {
		test('Load config file', () => {
			/**
			 * You must create a 'config.js' file in the root of the project.
			 * The content can be inferred from the file 'config.template.js'.
			 */

			config = require('../config')
			expect(config).toBeTruthy()
		})
	})

	describe('Configuration', () => {
		test('Handles invalid arguments and keeps defaults', () => {
			const sent = {
				key_id: 'key_id',
				private_key: false,
				sandbox: null,
				debug: 'true',
			}

			const satispay = require('../lib/satispay').config(sent)
			const received = satispay.config()

			expect(received.key_id).toBe(sent.key_id)
			expect(received.private_key).toBe(null)
			expect(received.sandbox).toBe(false)
			expect(received.debug).toBe(true)
		})

		test('Sets the right values', () => {
			const sent = {
				key_id: 'key_id',
				private_key: 'private_key',
				sandbox: true,
				debug: false,
			}

			const satispay = require('../lib/satispay').config(sent)
			const received = satispay.config()

			expect(received.key_id).toBe(sent.key_id)
			expect(received.private_key).toBe(sent.private_key)
			expect(received.sandbox).toBe(sent.sandbox)
			expect(received.debug).toBe(sent.debug)
		})
	})

	describe('Authentication', () => {
		test('Obtain the KeyId', async (done) => {
			let result
			let error
			const satispay = require('../lib/satispay').config(config)

			try {
				result = await satispay.obtain_key_id('aaa', 'aaa')
			} catch (err) {
				error = err
			}

			expect(result).toBeFalsy()
			expect(error).toBeTruthy()

			done()
		})

		test('Test fails in production', async (done) => {
			const satispay = require('../lib/satispay').config({
				...config,
				sandbox: false,
			})

			expect(satispay.test_authentication()).rejects.toMatchObject(new Error('node-satispay: This API works on Sandbox endpoint only'))

			done()
		})

		test('Test fails with an invalid key', async (done) => {
			let result
			const satispay = require('../lib/satispay').config({
				key_id: 'invalid',
				private_key: 'invalid',
				sandbox: true,
				debug: false,
			})

			try {
				result = await satispay.test_authentication()
			} catch (err) {
				expect(err).toBeTruthy()
			}

			expect(result).toBeFalsy()

			done()
		})

		test('Test succeeds with a valid key', async (done) => {
			const satispay = require('../lib/satispay').config(config)

			let result
			let error

			try {
				result = await satispay.test_authentication()
			} catch (err) {
				error = err
			}

			expect(result).toBeTruthy()
			expect(error).toBeFalsy()

			done()
		})
	})

	describe('Failures', () => {
		test('Create payment', async (done) => {
			const satispay = require('../lib/satispay').config(config)

			let payment
			let error

			try {
				payment = await satispay.create_payment(
					{
						flow: 'MATCH_CODE',
						// amount_unit: 100,
						currency: 'EUR',
					},
					null
				)
			} catch (err) {
				error = err
			}

			expect(payment).toBeFalsy()
			expect(error).toBeTruthy()

			done()
		})
	})

	describe('Calls', () => {
		describe('Consumers', () => {
			test('Retrieve consumer', async (done) => {
				const satispay = require('../lib/satispay').config(config)

				if (config.phone_number) {
					const consumer = await satispay.retrieve_consumer(config.phone_number)

					expect(consumer).toBeTruthy()
					expect(consumer.id).toBeTruthy()
				}

				done()
			})
		})

		describe('Payments', () => {
			test('Create payment', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const amount_unit = 100

				const payment = await satispay.create_payment({
					flow: 'MATCH_CODE',
					amount_unit,
					currency: 'EUR',
				})

				expect(payment).toBeTruthy()
				expect(payment.amount_unit).toBe(amount_unit)

				done()
			})

			test('Get payment details', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const amount_unit = 100

				const payment = await satispay.create_payment(
					{
						flow: 'MATCH_CODE',
						amount_unit,
						currency: 'EUR',
					},
					null
				)

				const payment_details = await satispay.get_payment_details(payment.id)

				expect(payment_details).toBeTruthy()
				expect(payment.amount_unit).toBe(amount_unit)

				done()
			})

			test('Get shop-payments list', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const shop_payments_list = await satispay.get_shop_payments_list()

				expect(shop_payments_list).toBeTruthy()

				done()
			})

			test('Update payment', async (done) => {
				const satispay = require('../lib/satispay').config(config)

				const payment = await satispay.create_payment(
					{
						flow: 'MATCH_CODE',
						amount_unit: 100,
						currency: 'EUR',
					},
					null
				)

				const updated_payment = await satispay.update_payment(payment.id, { action: 'CANCEL' })

				expect(payment.status).toBe('PENDING')
				expect(updated_payment.status).toBe('CANCELED')

				done()
			})
		})

		describe('Shop daily closure', () => {
			test('Retrieve daily closures', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const daily_closure = await satispay.retrieve_daily_closure('20201111')

				expect(daily_closure).toBeTruthy()

				done()
			})
		})

		describe('Pre-authorized', () => {
			test('Create authorization', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const reason = 'test'

				const authorization = await satispay.create_authorization({ reason })

				expect(authorization).toBeTruthy()
				expect(authorization.reason).toBe(reason)

				done()
			})

			test('Get authorization', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const reason = 'test'

				const authorization = await satispay.create_authorization({ reason })
				const authorization_got = await satispay.get_authorization(authorization.id)

				expect(authorization).toBeTruthy()
				expect(authorization.reason).toBe(reason)
				expect(authorization.id).toBe(authorization_got.id)
				expect(authorization.reason).toBe(authorization_got.reason)

				done()
			})
		})

		describe('Fund lock', () => {
			test('Create mqtt certificates', async (done) => {
				const satispay = require('../lib/satispay').config(config)
				const mqtt_certificates = await satispay.create_mqtt_certificates()

				expect(mqtt_certificates).toBeTruthy()

				done()
			})
		})
	})

	describe('Callbacks', () => {
		test('Create payment', async (done) => {
			const satispay = require('../lib/satispay').config(config)
			const amount_unit = 100

			satispay.create_payment(
				{
					flow: 'MATCH_CODE',
					amount_unit,
					currency: 'EUR',
				},
				null,
				(err, payment) => {
					expect(err).toBeFalsy()
					expect(payment).toBeTruthy()
					expect(payment.amount_unit).toBe(amount_unit)

					done()
				}
			)
		})
	})
})
