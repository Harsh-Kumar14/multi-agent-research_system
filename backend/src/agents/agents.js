import dotenv from "dotenv";

import { createAgent } from "langchain";

import { ChatGroq } from "@langchain/groq";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { web_search, scrape_url } from "../tools/tools.js";

dotenv.config();


// --------------------------------------
// MODEL SETUP
// --------------------------------------

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});


// --------------------------------------
// SEARCH AGENT
// --------------------------------------

export function build_search_agent() {

  return createAgent({

    model: llm,

    tools: [web_search],
  });
}


// --------------------------------------
// READER AGENT
// --------------------------------------

export function build_reader_agent() {

  return createAgent({

    model: llm,

    tools: [scrape_url],
  });
}


// --------------------------------------
// WRITER CHAIN
// --------------------------------------

const writer_prompt = ChatPromptTemplate.fromMessages([

  [
    "system",
    "You are an expert research writer. Write clear, structured and insightful reports.",
  ],

  [
    "human",
    `Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional.`,
  ],
]);


export const writer_chain =
  writer_prompt
    .pipe(llm)
    .pipe(new StringOutputParser());


// --------------------------------------
// CRITIC CHAIN
// --------------------------------------

const critic_prompt = ChatPromptTemplate.fromMessages([

  [
    "system",
    "You are a sharp and constructive research critic. Be honest and specific.",
  ],

  [
    "human",
    `Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
...`,
  ],
]);


export const critic_chain =
  critic_prompt
    .pipe(llm)
    .pipe(new StringOutputParser());