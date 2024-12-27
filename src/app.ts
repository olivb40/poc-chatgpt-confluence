import dotenv from "dotenv";
import ConfluenceApi from "./api/confluenceApi";
import SearchService from "./services/searchService";

dotenv.config();

const baseUrl = process.env.CONFLUENCE_BASE_URL || "";
const username = process.env.CONFLUENCE_USERNAME || "";
const token = process.env.CONFLUENCE_API_TOKEN || "";

if (!baseUrl || !username || !token) {
  console.error(
    "Please set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, and CONFLUENCE_API_TOKEN in the .env file."
  );
  process.exit(1);
}

const confluenceApi = new ConfluenceApi(baseUrl, username, token);
const searchService = new SearchService(confluenceApi);

const main = async () => {
  const query = 'type=page AND title~"example"';
  await searchService.search(query);
};

main().catch((err) => console.error(err));
