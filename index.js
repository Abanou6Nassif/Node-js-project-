import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import dns from "node:dns/promises";
import userRouter from "./routes/user.route.js";

dotenv.config();
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use("/questions", questionRouter);

const port = process.env.PORT;
const uri =
  "mongodb+srv://team2:guKhaFulSJAsAvWG@cluster0.i7u5kme.mongodb.net/stackOverflow?appName=Cluster0";

async function startServer() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to database");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(" Error connecting to DB", err);
  }
}

startServer();
