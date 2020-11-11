const axios = require('axios')
const crypto = require('crypto')

const errors = {
	missing_conf: new Error('node-satispay: Missing configuration'),
	missing_params: new Error('node-satispay: Missing parameters'),
	sandbox_only: new Error('node-satispay: This API works on Sandbox endpoint only'),
}

let conf = {
	key_id: null,
	private_key: null,
	sandbox: false,
	debug: false,
}

const host = {
	true: 'staging.authservices.satispay.com', //sandbox
	false: 'authservices.satispay.com', //prod
}

const check_config = () => {
	if (!conf.key_id || !conf.private_key) {
		throw errors.missing_conf
	}
}

const check_sandbox = () => {
	if (!conf.sandbox) {
		throw errors.sandbox_only
	}
}

const make_call = (method, host, path, query_params, body_params, extra_headers, callback) => {
	//add promise support
	if (!callback) {
		return new Promise((resolve, reject) =>
			make_call(method, host, path, query_params, body_params, extra_headers, function (err, res) {
				err ? reject(err) : resolve(res)
			})
		)
	}

	//checks
	check_config()

	if (!method || !host || !path) {
		throw errors.missing_params
	}

	//prepare call
	if (!body_params) body_params = ''
	if (!extra_headers) extra_headers = {}
	if (query_params) {
		query_params = Object.keys(query_params)
			.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query_params[key]))
			.join('&')
		path = `${path}?${query_params}`
	}

	const date = new Date().toGMTString()
	const body = body_params ? JSON.stringify(body_params) : ''
	const digest = `SHA-256=${crypto.createHash('sha256').update(body).digest('base64')}`
	const string = `(request-target): ${method.toLowerCase()} ${path}` + '\n' + `host: ${host}` + '\n' + `date: ${date}` + '\n' + `digest: ${digest}`
	const signature = crypto.createSign('RSA-SHA256').update(string).sign(conf.private_key.trim(), 'base64')
	const authorization = `Signature keyId="${conf.key_id}", algorithm="rsa-sha256", headers="(request-target) host date digest", signature="${signature}"`

	//make call
	axios({
		url: `https://${host}${path}`,
		method: method.toUpperCase(),
		headers: {
			'Content-Type': 'application/json',
			host: host,
			date: date,
			digest: digest,
			Authorization: authorization,
			...extra_headers,
		},
		data: body_params,
	})
		.then((res) => {
			if (callback) callback(null, res.data)
		})
		.catch((error) => {
			if (callback) callback(error.response.data, null)
		})
}

const satispay = {
	config: function ({ key_id, private_key, sandbox, debug } = {}) {
		if (key_id === undefined && private_key === undefined && sandbox === undefined && debug === undefined) {
			return conf
		}

		conf = {
			...conf,
			...(key_id && { key_id }),
			...(private_key && { private_key }),
			...(sandbox !== undefined && { sandbox: !!sandbox }),
			...(debug !== undefined && { debug: !!debug }),
		}

		return satispay
	},

	test_authentication: function (callback) {
		//add promise support
		if (!callback) {
			return new Promise((resolve, reject) =>
				this.test_authentication(function (err, res) {
					err ? reject(err) : resolve(res)
				})
			)
		}

		//checks
		check_config()
		check_sandbox()

		//make test call
		return make_call(
			'POST',
			'staging.authservices.satispay.com',
			'/wally-services/protocol/tests/signature',
			null,
			{
				flow: 'MATCH_CODE', //MATCH_CODE, MATCH_USER, REFUND or PRE_AUTHORIZED
				amount_unit: 100,
				currency: 'EUR',
			},
			null
		)
			.then((res) => {
				if (res.authentication_key.role === 'ONLINE_SHOP' || res.authentication_key.role === 'DEVICE') {
					callback(null, res)
				} else {
					callback(res, null)
				}
			})
			.catch((err) => {
				callback(err, null)
			})
	},

	obtain_key_id: function (token, public_key, callback) {
		//add promise support
		if (!callback) {
			return new Promise((resolve, reject) =>
				this.obtain_key_id(token, public_key, function (err, res) {
					err ? reject(err) : resolve(res)
				})
			)
		}

		axios({
			url: `https://${host[conf.sandbox]}/g_business/v1/authentication_keys`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			data: {
				token,
				public_key,
			},
		})
			.then((res) => {
				if (callback) callback(null, res.data)
			})
			.catch((error) => {
				if (callback) callback(error.response.data, null)
			})
	},

	create_payment: (body_params, extra_headers, callback) => {
		return make_call('POST', host[conf.sandbox], '/g_business/v1/payments', null, body_params, extra_headers, callback)
	},

	get_payment_details: (id, extra_headers, callback) => {
		return make_call('GET', host[conf.sandbox], `/g_business/v1/payments/${id}`, null, null, extra_headers, callback)
	},

	get_shop_payments_list: (query_params, extra_headers, callback) => {
		return make_call('GET', host[conf.sandbox], '/g_business/v1/payments', query_params, null, extra_headers, callback)
	},

	update_payment: (id, body_params, extra_headers, callback) => {
		return make_call('PUT', host[conf.sandbox], `/g_business/v1/payments/${id}`, null, body_params, extra_headers, callback)
	},

	retrieve_daily_closure: (daily_closure_date, query_params, extra_headers, callback) => {
		return make_call('GET', host[conf.sandbox], `/g_business/v1/daily_closure/${daily_closure_date}`, query_params, null, extra_headers, callback)
	},

	create_authorization: (body_params, extra_headers, callback) => {
		return make_call('POST', host[conf.sandbox], `/g_business/v1/pre_authorized_payment_tokens`, null, body_params, extra_headers, callback)
	},

	get_authorization: (id, extra_headers, callback) => {
		return make_call('GET', host[conf.sandbox], `/g_business/v1/pre_authorized_payment_tokens/${id}`, null, null, extra_headers, callback)
	},

	create_mqtt_certificates: (extra_headers, callback) => {
		return make_call('POST', host[conf.sandbox], `/g_business/v1/mqtt_certificates`, null, null, extra_headers, callback)
	},

	open_session: (body_params, extra_headers, callback) => {
		return make_call('POST', host[conf.sandbox], `/g_business/v1/sessions`, null, body_params, extra_headers, callback)
	},

	create_session_event: (id, body_params, extra_headers, callback) => {
		return make_call('POST', host[conf.sandbox], `/g_business/v1/sessions/${id}/events`, null, body_params, extra_headers, callback)
	},

	get_session_details: (id, extra_headers, callback) => {
		return make_call('GET', host[conf.sandbox], `/g_business/v1/sessions/${id}`, null, null, extra_headers, callback)
	},

	update_session: (id, body_params, extra_headers, callback) => {
		return make_call('PATCH', host[conf.sandbox], `/g_business/v1/sessions/${id}`, null, body_params, extra_headers, callback)
	},
}

module.exports = satispay
