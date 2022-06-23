import express from "express";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/test", (_, res) => {
  res.send(
    `Hello, ${process.env.USER_NAME}! the server is running on port ${process.env.PORT}.`
  );
});

app.listen(process.env.PORT, () => {
  console.log(
    chalk.green.bold(
      `Server running on port: http://localhost:${process.env.PORT}`
    )
  );
});
