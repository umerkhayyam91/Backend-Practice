const express = require("express")
const app = express()

app.get("/" , async (req,res)=>{
    res.json({
        status: "success",
        message: "working "
    })
})


app.listen(process.env.PORT||'8080', () => {
    console.log("Server has been started")
});