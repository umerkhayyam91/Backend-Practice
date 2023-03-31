const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    street: String,
    city: String
})

const userSchema = new mongoose.Schema({
    name: String,
    age: {
        type: Number,
        min: 1,
        max: 100,
        validate: {
            validator: value => value % 2 === 0,
            message: props => `${props.value} is not an even number`
        },
    },

    email: {
        type: String,
        minlength: 0,
        maxlength: 30,
        required: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
    hobbies: [String],
    bestFriend: mongoose.SchemaTypes.ObjectId,
    address: addressSchema

});

module.exports = mongoose.model("users", userSchema);