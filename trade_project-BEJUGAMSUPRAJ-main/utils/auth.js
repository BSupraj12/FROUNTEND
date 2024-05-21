const bcrypt = require('bcryptjs');

const { decodeToken } = require('./local');
const User = require('../models/User');

function comparePass(userPassword, databasePassword) {
    const bool = bcrypt.compareSync(userPassword, databasePassword);
    if (!bool) throw 'PASSWORD_MISMATCH';
    else return true;
}

function ensureAuthenticated(req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace('Bearer', '').trim() : null;

    if (!token) {
        response(req, res, {
            code: 'UNAUTHORIZED_ACCESS',
            msg: 'User is not authorized, please login to continue!'
        });
    } else {
        decodeToken(token).then((tokenInfo) => {
            req.token = token;
            req.user = tokenInfo.userInfo;
            next();
        }).catch((error) => {
            let msg, status = 401;

            if (error === 'AUTH_TOKEN_EXPIRED') {
                msg = 'Your session has been expired, please login to continue!';
            } else if (error === 'AUTH_TOKEN_NOT_VALID') {
                msg = 'User is not authorized, please login to continue!';
            } else {
                status = 500;
                msg = error.message;
            }

            response(req, res, {
                msg, code: 'UNAUTHORIZED_ACCESS'
            }, status);
        });
    }
}

async function getUserFromSession(req, token) {
    let user;

    if (!token) {
        const authHeader = req.header('Authorization');
        token = authHeader ? authHeader.replace('Bearer', '').trim() : '';        
    }

    if (token) {
        try {
            const tokenInfo = await decodeToken(token);
            user = tokenInfo.userInfo;
        } catch (ex) {
            user = null;
        }
    }

    return user;
}

function response(req, res, data, status) {
    if (req.originalUrl.indexOf('api/') > -1) {
        res.status(status || 401);
        res.send(JSON.stringify(data));
    } else {
        res.render('./error', data);
    }
}

module.exports = {
    ensureAuthenticated,
    comparePass,
    getUserFromSession
};
