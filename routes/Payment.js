const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    userName: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('payment' , paymentSchema)
