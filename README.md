# ChatGPT & Confluence Integration POC

## Overview
This Proof of Concept (POC) project leverages the ChatGPT API and Confluence API to create a chatbot capable of retrieving information from a company's internal documentation. The goal is to simplify information retrieval, especially for new developers joining the team, by allowing them to query the chatbot for specific procedures, naming conventions, or guidelines.

## Use Case
A developer can ask the chatbot questions such as:
- `What is the procedure to update a test environment?`
- `What are the team's naming conventions?`
- `How can I retrieve a production backup locally?`

The chatbot fetches relevant information from Confluence and provides concise, helpful answers.

## Technologies Used
- **TypeScript**: Strongly typed JavaScript for maintainability.
- **Node.js**: Backend runtime for handling API requests.
- **ChatGPT API**: Natural Language Processing (NLP) to interpret user queries.
- **Confluence API**: Fetching documentation data from Confluence.
- **Express.js**: Web framework for handling chatbot requests.
