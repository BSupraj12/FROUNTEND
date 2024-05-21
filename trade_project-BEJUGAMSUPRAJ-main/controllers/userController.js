const { validationResult } = require('express-validator');

const User = require('../models/User');
const Trade = require('../models/Trade');
const { encodeToken } = require('../utils/local');
const { getUserFromSession, comparePass } = require('../utils/auth');
const { upperCaps } = require('./tradeController');
const bcrypt = require('bcryptjs');
const UserToTrade = require('../models/UserToTrade');

// profile detail page
exports.detail = async (req, res, next) => {
    let user = req.user,
        id,
        trades,
        topics;

    try {
        id = user.id;

        trades = await Trade.find({ user: id }, null, { sort: 'topic' }).exec();
        trades.forEach(trade => {
            trade.statusText = upperCaps(trade.status);
        });

        user.watchList = await getWatchingTrades(id);
        user.offers = await getMyOffers(user.id);
        user.receivedOffers = await getReceivedOffers(id);
        topics = Array.from(new Set(trades.map((item) => item.topic))).sort(); // creating uniquie categories
        res.render('./auth/detail', { topics, trades, user });
    } catch (ex) {
        res.render('./error', {
            code: "UNAUTHORIZED_ACCESS",
            msg: "You are not authorized to edit this trade as you are not the owner of this trade"
        });
    }
};

const getMyOffers = async (userId) => {
    const items = await UserToTrade.find({ owner: userId }).exec(),
        offers = [];

    for (var i = 0, len = items.length, item; i < len; i++) {
        item = items[i];

        let details = await Trade.findById(String(item.trade_item)).exec();

        if (details) {
            item.trade_item_name = details.name;

            details = await User.findById(details.user).exec();
            item.trade_item_owner_name = details.first_name + ' ' + details.last_name;

            details = await Trade.findById(String(item.offer_item)).exec();

            if (details) {
                item.offer_item_name = details.name;

                item.statusText = upperCaps(item.status);
                offers.push(item);
            }
        }
    }

    return offers;
};

const getReceivedOffers = async (userId) => {
    // my trades pending items
    const items = await Trade.find({ user: userId }).or({ status: ['offer-made', 'traded'] }).exec(),
        offers = [];

    for (var i = 0, len = items.length, item; i < len; i++) {
        item = items[i];

        let trades = await UserToTrade.find({ trade_item: item.id }).exec();

        for (var j = 0, length = trades.length, trade; j < length; j++) {
            trade = trades[j];
            trade.trade_item_name = item.name;
            trade.statusText = upperCaps(trade.status);

            let details = await User.findById(String(trade.owner)).exec();
            trade.trade_owner_name = details.first_name + ' ' + details.last_name;

            details = await Trade.findById(String(trade.offer_item)).exec();
            trade.offer_item_name = details.name;

            offers.push(trade);
        }
    }

    return offers;
};

const getWatchingTrades = async (userId) => {
    const trades = await Trade.find({}, null, { sort: 'topic' }).exec();

    return trades.filter(trade => {
        trade.statusText = upperCaps(trade.status);
        return trade.watching_users && trade.watching_users.indexOf(userId) > -1;
    });
};

// login page
exports.login = async (req, res) => {
    res.render('./auth/login', { user: await getUserFromSession(req) });
};

// register page
exports.register = async (req, res) => {
    res.render('./auth/register', { user: await getUserFromSession(req) });
};

// sign in api call
exports.signin = async (req, res, next) => {
    const body = req.body;
    const email = body.username;
    const password = body.password;

    let token;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                code: 'BAD_DATA',
                msg: errors.array().map(x => x.msg).join('\n')
            });
        }
        const userInfo = await User.findOne({ email });

        if (userInfo && comparePass(password, userInfo.password)) {
            token = encodeToken(userInfo);
        }

        if (token) {
            res.status(200).json({
                token, success: true
            });
        } else {
            throw "INVALID_CREDENTIALS";
        }
    } catch (ex) {
        let msg, code, status;

        if (ex === "INVALID_CREDENTIALS" || ex === "PASSWORD_MISMATCH") {
            status = 400;
            msg = 'Invalid Credentails, please use valid credentials!';
            code = 'INVALID_CREDENTIALS';
        } else {
            status = 500;
            msg = 'System error occurred, please try again after some time!';
            code = 'SYSTEM_ERROR';
        }

        res.status(status).json({
            code, msg
        });
    }
};

// sign up api call
exports.signup = async (req, res, next) => {
    let userData = req.body, token;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                code: 'BAD_DATA',
                msg: errors.array().map(x => x.msg).join('\n')
            });
        }

        let user = await User.findOne({ email: userData.email });

        if (!user) {
            const salt = bcrypt.genSaltSync();
            userData.password = bcrypt.hashSync(userData.password, salt);
            user = await User.create(userData);
            token = encodeToken(user);

            res.status(200).json({
                token, success: true
            });
        } else {
            throw "DUPLICATE_EMAIL";
        }
    } catch (ex) {
        let msg, code, status;

        if (ex === "DUPLICATE_EMAIL") {
            status = 400;
            code = 'DUPLICATE_EMAIL';
            msg = 'Email is already registered, please use different email for signup !';
        } else {
            status = 500;
            msg = 'System error occurred, please try again after some time!';
            code = 'SYSTEM_ERROR';
        }

        res.status(status).json({
            code, msg
        });
    }
};

exports.get = async (req, res) => {
    const token = req.body.token;
    const user = await getUserFromSession(req, token);

    res.status(200).json({
        user, success: true
    });
};