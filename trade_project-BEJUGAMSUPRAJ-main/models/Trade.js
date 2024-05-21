const { Schema, model } = require('mongoose');

const tradeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 20
    },
    topic: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    details: {
        type: String,
        required: true,
        minLength: 3
    },
    status: {
        type: String,
        default: 'available' 
    },
    avatar_url: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    watching_users: []
});

module.exports = model('Trade', tradeSchema);