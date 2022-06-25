import express from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import joi from "joi";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const participants = [];
const messages = [];
const fullStatus = [];

app.get("/test", (_, res) => {
  res.send(
    `Hello, ${process.env.USER_NAME}! the server is running on port ${process.env.PORT}.`
  );
});

app.post("/participants", (req, res) => {
  const participant = req.body.name;
  participants.push(participant);
  res.send(participants);
});

app.get("/participants", (req, res) => {
  res.status(200).send(participants);
});

app.post("/messages", (req, res) => {
  const message = req.body.message;
  messages.push(message);
  res.sendStatus(201);
});

app.get("/messages", (req, res) => {
  res.status(200).send(messages);
});

app.post("/status", (req, res) => {
  const status = req.body.status;
  fullStatus.push(status);
  res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
  console.log(
    chalk.green.bold(
      `Server running on port: http://localhost:${process.env.PORT}`
    )
  );
});
