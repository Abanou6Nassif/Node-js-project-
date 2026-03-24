import dotenv from "dotenv"
dotenv.config()

const express = require("express");
const app = express();


app.use(express.json()); 



app.listen(3000, () => {
  console.log("Server running on port 3000");
});