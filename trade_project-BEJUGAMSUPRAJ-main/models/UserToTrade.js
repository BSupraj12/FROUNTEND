const { Schema, model } = require('mongoose');

const schema = new Schema({
    status: {
        type: String,
        default: 'pending' 
    },
    trade_item: {
        type: Schema.Types.ObjectId,
        ref: 'Trade'
    },
    offer_item: {
        type: Schema.Types.ObjectId,
        ref: 'Trade'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('UserToTrade', schema);