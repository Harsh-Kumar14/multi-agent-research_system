import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { run_research_pipeline } from "./pipeline.js";

dotenv.config();

const app = express();


// MIDDLEWARE

app.use(cors());

app.use(express.json());


// TEST ROUTE

app.get("/", (req, res) => {

  res.json({
    message: "Backend working"
  });

});


// MAIN ROUTE

app.post("/research", async (req, res) => {

  try {

    const { topic } = req.body;

    if (!topic) {

      return res.status(400).json({
        error: "Topic is required"
      });

    }

    console.log("\nResearch Topic:", topic);

    const result =
      await run_research_pipeline(topic);

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

});


// START SERVER

const PORT = 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});