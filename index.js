
// const mongoose = require("mongoose")
// const user = require("./users")

// mongoose.connect(
//     "mongodb+srv://umer91:emmawatson123@backendcluster.hehctlm.mongodb.net/?retryWrites=true&w=majority",
//     { useNewUrlParser: true },
// ).then((result) => {
//     console.log("DB Connected!!");
// }).catch((err) => {
//     console.log(err);
// });

// run()
// async function run() {
//     try {
//         // const users = await user.where("age").equals(36).populate("bestFriend").limit(1)
//         // const users = await user.findByName("AlI").limit(1)
//         // const users = await user.where().byName("ali").limit(1)
//         // const users = await user.findOne({
//         //     name: "ali",
//         //     city: "Islamabad"
//         // })

//         const users = await user.create({
//             name: "ali",
//             age: 36,
//             hobbies: ["cricket", "football"],
//             email: "umer.khayyam900@gmail",
//             bestFriend : "6426438f8e6465281b3e52db",
//             address: {
//                 street: "Main St",
//                 city: "Islamabad"
//             }
//         });
//         // users.name = "Umer" // to update user name
//         // await users.save()
//         // const users = new user({name: "ali" , age: 33})
//         console.log(users);
//         // await users.save();
//         // console.log(users);
//         // console.log(users.namedEmail);
//         // users.sayHi();
//     } catch (error) {
//         console.log(error.message);
//     }
// }