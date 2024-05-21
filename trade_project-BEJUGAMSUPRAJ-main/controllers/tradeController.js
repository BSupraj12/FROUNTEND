const { validationResult } = require('express-validator');

const Trade = require('../models/Trade');
const User = require('../models/User');
const UserToTrade = require('../models/UserToTrade');
const { getUserFromSession } = require('../utils/auth');

// html response handlers
exports.tradeList = async (req, res) => {
    const trades = await Trade.find({}, null, { sort: 'topic' }).exec();
    const topics = Array.from(new Set(trades.map((item) => item.topic))).sort(); // creating uniquie categories

    res.render('./trade/list', { trades, topics });
};

exports.tradeNew = async (req, res) => {
    res.render('./trade/edit', { trade: {} });
};

exports.tradeDetail = async (req, res) => {
    let id = req.params.id,
        user = await getUserFromSession(req),
        products = [],
        items,
        code,
        msg,
        trade;

    try {
        if (id) {
            trade = await Trade.findById(id).exec();
        }

        if (!trade) {
            throw "TRADE_NOT_FOUND"
        } else {
            trade.statusText = this.upperCaps(trade.status);
            trade.auth_user = !!user;
            trade.watching = user ? trade.watching_users.indexOf(String(user.id)) > -1 : false;
            trade.current_user_id = user ? user.id : '';

            if (trade.status !== 'available') {
                items = await UserToTrade.find({ trade_item: id, status: 'pending' }).exec();

                for (var i = 0, len = items.length, item; i < len; i++) {
                    item = items[i];

                    let details = await Trade.findById(item.offer_item).exec();

                    item.offer_item_name = details.name;
                    item.statusText = this.upperCaps(item.status);

                    details = await User.findById(item.owner).exec();
                    item.owner_name = details.first_name + ' ' + details.last_name;

                    if (user && user.id === String(item.owner)) {
                        trade.offerdByMe = true;
                    }
                }

                trade.offers = items;

                items = await UserToTrade.find({ offer_item: id, status: 'pending' }).exec();

                for (var i = 0, len = items.length, item; i < len; i++) {
                    item = items[i];

                    let details = await Trade.findById(item.trade_item).exec();

                    item.trade_item_name = details.name;
                    item.product_owner = String(details.user);
                    item.statusText = this.upperCaps(item.status);

                    details = await User.findById(item.owner).exec();
                    item.owner_name = details.first_name + ' ' + details.last_name;
                }

                trade.trades = items;
            }

            if (trade.auth_user) {
                if (user.id === String(trade.user)) {
                    trade.created_by = 'Me';
                } else if (!trade.offerdByMe) {
                    // if I have not given the offer already, then only I can give offer to this trade
                    products = await Trade.find({ user: user.id, status: ['available', 'offer-made'] }, null, { sort: 'topic' }).exec();
                }
            }

            if (!trade.created_by) {
                const author = await User.findById(trade.user).exec();
                trade.created_by = author ? (author.first_name + ' ' + author.last_name) : 'UNKNOWN';
            }
        }
    } catch (ex) {
        code = "TRADE_NOT_FOUND";
        msg = "Requested trade not found!";
    }

    if (msg) {
        res.render('./error', { msg, code })
    } else {
        res.render('./trade/details', { trade, products });
    }
};

exports.upperCaps = str => str.split('-').map(x => x.charAt(0).toUpperCase() + x.substr(1)).join(' ');

exports.tradeEdit = async (req, res) => {
    let id = req.params.id,
        user = req.user,
        code,
        msg,
        trade;

    try {
        if (id) {
            trade = await Trade.findById(id).exec();
        }

        if (!trade) {
            throw "TRADE_NOT_FOUND";
        } else if (user.id !== String(trade.user)) {
            throw "UNAUTHORIZED_ACCESS";
        }

        trade.status = this.upperCaps(trade.status);
    } catch (ex) {
        if (ex === 'UNAUTHORIZED_ACCESS') {
            code = ex;
            msg = 'User is not authorized to edit this trade!';
        } else {
            code = "TRADE_NOT_FOUND";
            msg = "Requested trade not found!";
        }
    }

    if (msg) {
        res.render('./error', { msg, code })
    } else {
        res.render('./trade/edit', { trade });
    }
};

// rest api handlers
exports.create = async (req, res) => {
    let trade = req.body,
        userId = req.user.id,
        status = 200,
        data = {};

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                code: 'BAD_DATA',
                msg: errors.array().map(x => x.msg).join('\n')
            });
        }

        trade.user = userId;
        var result = await Trade.create(trade);

        data.msg = 'Created Successfully!';
        data.id = result.id;
        data.success = true;
    } catch (ex) {
        let msg = ex.message;

        if (msg.indexOf('duplicate key error collection') > -1) {
            status = 400;
            data.code = "DUPLICATE_NAME";
            data.msg = "Item name already exist, please use different name for item!";
        } else {
            status = 500;
            data.code = "SERVER_ERROR";
            data.msg = 'System error occurred, please try again after some time!';
        }
    }

    res.status(status);
    res.send(JSON.stringify(data));
};

// update rest api
exports.update = async (req, res, next) => {
    let id = req.params.id,
        userId = req.user.id,
        trade = req.body,
        status = 200,
        data = {},
        existing;

    try {
        if (id) {
            existing = await Trade.findById(id).exec();
        }

        if (existing) {
            if (existing.user != userId) {
                status = 401;
                data.code = "UNAUTHORIZED_ACCESS";
                data.msg = "You are not authorized to edit this trade!";
            } else {
                await existing.updateOne(trade);
                data.msg = 'Updated Successfully!';
                data.id = id;
                data.success = true;
            }
        } else {
            status = 400;
            data.code = "BAD_DATA";
            data.msg = "Id is not valid";
        }
    } catch (ex) {
        let msg = ex.message;

        if (msg.indexOf('duplicate key error collection') > -1) {
            status = 400;
            data.code = "DUPLICATE_NAME";
            data.msg = "Item name already exist, please use different name for item!";
        } else {
            status = 500;
            data.code = "SERVER_ERROR";
            data.msg = 'System error occurred, please try again after some time!';
        }
    }

    res.status(status);
    res.send(JSON.stringify(data));
};

// delete rest api
exports.delete = async (req, res, next) => {
    let id = req.params.id,
        userId = req.user.id,
        status = 200,
        data = {},
        trade;

    try {
        if (id) {
            trade = await Trade.findById(id).exec();
        }

        if (trade) {
            if (trade.user != userId) {
                status = 401;
                data.code = "UNAUTHORIZED_ACCESS";
                data.msg = "You are not authorized to delete this trade!";
            } else if (trade.status === 'traded') {
                status = 400;
                data.code = "BAD_DATA";
                data.msg = "Traded item can't be deleted";
            } else {
                await removePendingOffers(id);
                await Trade.findByIdAndRemove(id);
                data.msg = 'Deleted Successfully!';
                data.success = true;
            }
        } else {
            status = 400;
            data.code = "BAD_DATA";
            data.msg = "Id is not valid";
        }
    } catch (ex) {
        status = 500;
        data.code = "SERVER_ERROR";
        data.msg = 'System error occurred, please try again after some time!';
    }

    res.status(status);
    res.send(JSON.stringify(data));
};

// watch rest api
exports.watch = async (req, res, next) => {
    let id = req.body.id,
        userId = req.user.id,
        status = 200,
        data = {},
        watchList,
        trade;

    try {
        if (id) {
            trade = await Trade.findById(id).exec();
        }

        if (trade) {
            watchList = trade.watching_users;

            if (watchList.indexOf(userId) === -1) {
                watchList.push(userId);
                data.added = true;
            } else {
                watchList.splice(watchList.indexOf(userId), 1);
            }

            await trade.updateOne({ watching_users: watchList });

            data.msg = 'Updated Successfully!';
            data.success = true;
        } else {
            status = 400;
            data.code = "BAD_DATA";
            data.msg = "Id is not valid";
        }
    } catch (ex) {
        status = 500;
        data.code = "SERVER_ERROR";
        data.msg = 'System error occurred, please try again after some time!';
    }

    res.status(status);
    res.send(JSON.stringify(data));
};

// give offer to a trade rest api
exports.offerTrade = async (req, res, next) => {
    let user = req.user,
        info = req.body,
        status = 200,
        data = {},
        trade,
        newStatus;

    try {
        newStatus = 'offer-made';
        info.owner = user.id;
        await UserToTrade.create(info);

        trade = await Trade.findById(info.trade_item).exec();
        trade.watching_users = trade.watching_users || [];

        if (trade.watching_users.indexOf() === -1) {
            trade.watching_users.push(user.id);
        }

        await trade.updateOne({ status: newStatus, watching_users: trade.watching_users });

        trade = await Trade.findById(info.offer_item).exec();
        await trade.updateOne({ status: newStatus });

        data.statusText = this.upperCaps(newStatus);
        data.msg = 'Offer submitted Successfully!';
        data.success = true;
    } catch (ex) {
        status = 500;
        data.code = "SERVER_ERROR";
        data.msg = 'System error occurred, please try again after some time!';
    }

    res.status(status);
    res.send(JSON.stringify(data));
};

exports.acceptOffer = async (req, res, next) => {
    let id = req.body.offer_id,
        status = 200,
        data = {},
        trade,
        rec;

    try {
        // updated status of record
        rec = await UserToTrade.findById(id).exec();
        await rec.updateOne({ status: 'traded' });

        await removePendingOffers(rec.trade_item);
        trade = await Trade.findById(rec.trade_item).exec();
        await trade.updateOne({ status: 'traded' });

        await removePendingOffers(rec.offer_item);
        trade = await Trade.findById(rec.offer_item).exec();
        await trade.updateOne({ status: 'traded' });

        data.msg = 'Offer accepted Successfully!';
        data.success = true;
    } catch (ex) {
        status = 500;
        data.code = "SERVER_ERROR";
        data.msg = 'System error occurred, please try again after some time!';
    }

    res.status(status);
    res.send(JSON.stringify(data));
};

async function removePendingOffers(id) {
    // delete other records which are pending for those items
    let records = await UserToTrade.find({ status: 'pending' }).or([{ trade_item: id }, { offer_item: id }]).exec();

    if (records.length) {
        for (var i = 0, len = records.length; i < len; i++) {
            await removeOffer(records[i].id);
        }
    }
}

async function removeOffer(id) {
    let records,
        trade,
        rec;

    // deleting user to trade record
    rec = await UserToTrade.findById(id).exec();
    await UserToTrade.findByIdAndRemove(id);

    // if any of the trade is not available in table, change status back to available
    records = await UserToTrade.find().or([{ trade_item: rec.trade_item }, { offer_item: rec.trade_item }]).exec();

    if (!records.length) {
        trade = await Trade.findById(rec.trade_item).exec();
        await trade.updateOne({ status: 'available' });
    }

    records = await UserToTrade.find().or([{ trade_item: rec.offer_item }, { offer_item: rec.offer_item }]).exec();

    if (!records.length) {
        trade = await Trade.findById(rec.offer_item).exec();
        await trade.updateOne({ status: 'available' });
    }
}

// give offer to a trade rest api
exports.rejectOffer = async (req, res, next) => {
    let id = req.body.offer_id,
        status = 200,
        data = {};

    try {
        await removeOffer(id);
        data.msg = 'Offer rejected Successfully!';
        data.success = true;
    } catch (ex) {
        status = 500;
        data.code = "SERVER_ERROR";
        data.msg = 'System error occurred, please try again after some time!';
    }

    res.status(status);
    res.send(JSON.stringify(data));
};