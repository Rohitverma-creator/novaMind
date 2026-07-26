import "dotenv/config";

import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import router from "./routes/agent.route.js"
dotenv.config()

const port=process.env.PORT || 5000
const app=express()
app.use(express.json())
connectDB()

app.use("/",router)
app.use((err,req,res,next)=>{
console.log(err)
if(err.status){
    return res.status(err.status).json(err.data)
}
return res.status(500).json({message:`agent error ${error}`})
})


app.get("/",(req,res)=>{
    res.send("Hello from agent service")
})
app.listen(port,()=>{
   console.log(`agent service started at ${port}`) 
})



