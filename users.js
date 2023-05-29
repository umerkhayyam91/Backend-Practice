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
    bestFriend: {
        type : mongoose.SchemaTypes.ObjectId,
        
        ref : "users"
    },
    address: addressSchema

});

// adding method on each instance of a user
userSchema.methods.sayHi = function() {
    console.log(`Hi my name is ${this.name}`);
}

// Static methods on models 
userSchema.statics.findByName = function(name) {
    return this.find({name : new RegExp(name, "i")})
}

// making a query
userSchema.query.byName = function(name) {
    return this.where({name : new RegExp(name, "i")})
}

// virtual
userSchema.virtual("namedEmail").get(function() {
    return `${this.name} <${this.email}>`
})

// middleware
userSchema.pre("save", function(next) {
    this.updatedAt = Date.now()
    next()
})

userSchema.post("save", function(doc, next) {
    doc.sayHi
    next()
})

module.exports = mongoose.model("users", userSchema);