const express = require("express")
const app = express()

app.get("/" , async (req,res)=>{
    res.json({
        status: "success",
        message: "working "
    })
})


const PORT = process.env.PORT||'8080';
app.listen(PORT, () => {
    console.log("Server has been started")
});