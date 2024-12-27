import express from "express";
import dotenv from "dotenv";
import ConfluenceApi from "./api/confluenceApi";
import SearchService from "./services/searchService";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const baseUrl = process.env.CONFLUENCE_BASE_URL || "";
const username = process.env.CONFLUENCE_USERNAME || "";
const token = process.env.CONFLUENCE_API_TOKEN || "";
const space = process.env.CONFLUENCE_SPACE || "";
const parent = process.env.CONFLUENCE_PARENT || "";

// Vérifier que les variables d'environnement sont configurées
if (!baseUrl || !username || !token) {
  console.error(
    "❌ Please set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, and CONFLUENCE_API_TOKEN in the .env file."
  );
  process.exit(1);
}

// Initialiser l'API Confluence et le service de recherche
const confluenceApi = new ConfluenceApi(baseUrl, username, token);
const searchService = new SearchService(confluenceApi);

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Route principale pour tester l'API
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("🚀 Confluence API is running! Use /search to query.");
});

// Route pour rechercher dans Confluence
app.get<{}, any, any, { query?: string }>("/search", async (req, res) => {
  const { query } = req.query;

  if (typeof query !== "string" || query.trim() === "") {
    res.status(400).json({
      error: 'Invalid query parameter. "query" must be a non-empty string.',
    });
    return;
  }

  try {
    let cql = `(title~"${query}*" OR text~"${query}*")`; // Recherche dans le titre. Remplacez par `text~"${query}"` pour une recherche globale.

    if (space) {
      cql += ` AND space="${space}"`;
    }

    if (parent) {
      cql += ` AND parent="${parent}"`;
    }

    const results = await searchService.search(cql);

    // Retourner les résultats sous forme de JSON
    res.json({ results });
  } catch (error) {
    console.error("❌ Error during search:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
