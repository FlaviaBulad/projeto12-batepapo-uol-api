import express from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;
const mongoClient = new MongoClient(process.env.MONGO_URI);

mongoClient.connect().then(() => {
  db = mongoClient.db("bate_papo_uol");
  console.log(chalk.magenta.bold("MongoDB connected"));
});

app.post("/participants", async (req, res) => {
  const participant = req.body;

  const participantSchema = joi.object({ name: joi.string().required() });
  const validation = participantSchema.validate(participant, {
    abortEarly: false,
  });

  if (validation.error) {
    console.log(validation.error.details);
    return res.sendStatus(422);
  }

  try {
    await mongoClient.connect();
    const participantExists = await db
      .collection("participants")
      .findOne({ name: participant.name });

    if (participantExists) {
      return res.status(409).send("Participant already exists");
    }

    await db
      .collection("participants")
      .insertOne({ name: participant.name, lastStatus: Date.now() });
    await db.collection("messages").insertOne({
      from: participant.name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:MM:SS"),
    });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send("Server error");
    mongoClient.close();
  }
});

app.get("/participants", (req, res) => {
  res.status(200).send(participants);
});

app.post("/messages", (req, res) => {
  // const message = req.body.message;
  // messages.push(message);
  res.sendStatus(201);
});

app.get("/messages", (req, res) => {
  res.status(200).send(messages);
});

app.post("/status", (req, res) => {
  // const status = req.body.status;
  // fullStatus.push(status);
  res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
  console.log(
    chalk.green.bold(
      `Server running on port: http://localhost:${process.env.PORT}`
    )
  );
});
