
const mongoose = require("mongoose")
const user = require("./users")

mongoose.connect(
    "mongodb+srv://umer91:emmawatson123@backendcluster.hehctlm.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true },
).then((result) => {
    console.log("DB Connected!!");
}).catch((err) => {
    console.log(err);
});

run()
async function run() {
    try {
        const users = await user.create({
            name: "ali",
            age: 36,
            hobbies: ["cricket", "football"],
            email: "umer.khayyam900@gmail.com",
            address: {
                street: "Main St",
                city: "Islamabad"
            }
        });

        console.log(users);
    } catch (error) {
        console.log(error.message);
    }
}