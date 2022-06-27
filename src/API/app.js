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
    await mongoClient.connect(); // Connect to MongoDB using provided URI
    const participantExists = await db //Checks if participant already exists on db
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
    //
  } catch (error) {
    res.status(500).send("Post participants error");
    mongoClient.close(); //Close the current db connection, including all the child db instances
  }
});

app.get("/participants", async (req, res) => {
  try {
    await mongoClient.connect();
    const participants = await db.collection("participants").find().toArray();
    res.send(participants);
  } catch (error) {
    res.status(500).send("Get participants error");
    mongoClient.close();
  }
});

app.post("/messages", async (req, res) => {
  const message = req.body;

  const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid("message", "private_message").required(),
  });
  const validation = messageSchema.validate(message, {
    abortEarly: false,
  });

  if (validation.error) {
    console.log(validation.error.details.map((d) => d.message));
    return res.sendStatus(422);
  }
  const { user } = req.headers;

  try {
    await mongoClient.connect();
    const participant = await db
      .collection("participants")
      .findOne({ name: user });

    if (!participant) {
      return res.sendStatus(422);
    }

    await db.collection("messages").insertOne({
      from: user,
      to: message.to,
      text: message.text,
      type: message.type,
      time: dayjs().format("HH:MM:SS"),
    });
    res.sendStatus(201);
  } catch (error) {
    res.status(422).send("Participant does not exist");
    mongoClient.close();
  }
});

app.get("/messages", async (req, res) => {
  const limit = parseInt(req.query);
  const { user } = req.headers;

  try {
    await mongoClient.connect();
    const messages = await db.collection("messages").find().toArray();
    const filterMessages = messages.filter((message) => {
      const userMessages =
        message.to === user || message.from === user || message.to === "Todos";
      const publicMessages = message.type === "message";
      return userMessages || publicMessages;
    });

    if (limit) {
      return res.send(filterMessages.slice(-limit));
    }

    res.send(filterMessages);
  } catch (error) {
    res.status(500).send("Get messages error");
    mongoClient.close();
  }
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
