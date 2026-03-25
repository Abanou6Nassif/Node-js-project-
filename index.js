import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { MongoClient } from "mongodb"; 

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const uri =  "mongodb+srv://mostafaeldabaaa98:mostafa123456@cluster0.jx9irjt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri);
let database;

async function startServer() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    database = client.db("stack-overflow");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(" Error connecting to DB", err);
  }
}

startServer();;
