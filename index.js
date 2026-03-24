import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();

app.use(express.json());

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
