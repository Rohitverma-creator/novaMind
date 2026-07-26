import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "../chat/routes/chat.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.use("/", router);



app.get("/", (req, res) => {
  res.send("Hello from Chat Service");
});

app.listen(port, () => {
  console.log(`Chat service started at ${port}`);
});