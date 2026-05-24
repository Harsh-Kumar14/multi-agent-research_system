import {
  build_reader_agent,
  build_search_agent,
  writer_chain,
  critic_chain,
} from "./agents/agents.js";


export async function run_research_pipeline(topic) {

  const state = {};

  

  console.log("\n" + "=".repeat(50));

  console.log("STEP 1 - Search Agent is working...");

  console.log("=".repeat(50));


  const search_agent = build_search_agent();

  const search_result = await search_agent.invoke({

    messages: [
      {
        role: "user",
        content: `Find recent, reliable and detailed information about: ${topic}`,
      },
    ],
  });


  state.search_results =
    search_result.messages[
      search_result.messages.length - 1
    ].content;


  console.log("\nSEARCH RESULTS:\n");

  console.log(state.search_results);


  // -----------------------------------------
  // STEP 2 - READER AGENT
  // -----------------------------------------

  console.log("\n" + "=".repeat(50));

  console.log("STEP 2 - Reader Agent is scraping top resources...");

  console.log("=".repeat(50));


  const reader_agent = build_reader_agent();

  const reader_result = await reader_agent.invoke({

    messages: [
      {
        role: "user",

        content:
          `Based on the following search results about '${topic}', ` +
          `pick the most relevant URL and scrape it for deeper content.\n\n` +
          `Search Results:\n${state.search_results.slice(0, 800)}`,
      },
    ],
  });


  state.scraped_content =
    reader_result.messages[
      reader_result.messages.length - 1
    ].content;


  console.log("\nSCRAPED CONTENT:\n");

  console.log(state.scraped_content);


  // -----------------------------------------
  // STEP 3 - WRITER CHAIN
  // -----------------------------------------

  console.log("\n" + "=".repeat(50));

  console.log("STEP 3 - Writer is drafting the report...");

  console.log("=".repeat(50));


  const research_combined =

    `SEARCH RESULTS:\n${state.search_results}\n\n` +

    `DETAILED SCRAPED CONTENT:\n${state.scraped_content}`;


  state.report = await writer_chain.invoke({

    topic,

    research: research_combined,
  });


  console.log("\nFINAL REPORT:\n");

  console.log(state.report);


  // -----------------------------------------
  // STEP 4 - CRITIC CHAIN
  // -----------------------------------------

  console.log("\n" + "=".repeat(50));

  console.log("STEP 4 - Critic is reviewing the report...");

  console.log("=".repeat(50));


  state.feedback = await critic_chain.invoke({

    report: state.report,
  });


  console.log("\nCRITIC REPORT:\n");

  console.log(state.feedback);


  return state;
}
