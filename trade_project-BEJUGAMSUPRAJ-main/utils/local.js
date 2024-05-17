const moment = require('moment');
const jwt = require('jwt-simple');

const TOKEN_SECRET = '\xf8%\xa8\xf2INz\xcc:\x171\xeei\x82\xce\x81Y\xc2HJ\xe5\x01\xf3$';

function encodeToken(user) {
	const payload = {
		exp: moment().add(30, 'days').unix(),	// token is valid for 30 days
		iat: moment().unix(),
		sub: user.email,
		userInfo: {
			id: user.id,
			name: user.first_name + ' ' + user.last_name,
			email: user.email
		}
	};

	return jwt.encode(payload, TOKEN_SECRET);
}

function decodeToken(token) {
	return new Promise((resolve, reject) => {
        let payload;

        try {
            payload = jwt.decode(token, TOKEN_SECRET);
        } catch (ex) {
            reject('AUTH_TOKEN_NOT_VALID');
        }
        const now = moment().unix();

        // check if the token has expired
        if (now > payload.exp) {
            reject('AUTH_TOKEN_EXPIRED');
        }
        else {
            resolve(payload);
        }
	});
}

module.exports = {
	encodeToken,
	decodeToken
};
