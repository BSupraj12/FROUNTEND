const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 25
    },
    last_name: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 25
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    trades: [{
        type: Schema.Types.ObjectId,
        ref: 'Trade'
    }]
});

module.exports = model('User', userSchema);