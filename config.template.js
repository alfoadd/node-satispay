/**
 * Please refer to the official documentation for more information on how to generate RSA keys and obtain the KeyId
 * https://developers.satispay.com/reference#genereate-rsa-keys
 */

const config = {
	key_id: 'your_key_id',
	private_key: 'your_private_key', //`-----BEGIN RSA PRIVATE KEY-----\n[...]\n-----END RSA PRIVATE KEY-----`
	sandbox: true,
	debug: true,
}

module.exports = config
