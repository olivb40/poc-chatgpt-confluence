import express from "express";
import dotenv from "dotenv";
import ConfluenceApi from "./api/confluenceApi";
import SearchService from "./services/searchService";
import ChatGPTService from "./services/chatgptService";

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
const chatgptService = new ChatGPTService();

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

app.post<{}, any, any, { query?: string }>("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    res.status(400).json({
      error: "Veuillez fournir une question valide sous forme de texte.",
    });
    return;
  }

  try {
    // Étape 1 : Analyse de la question
    const keywords = await chatgptService.analyzeQuestion(question);

    console.log(`🔍 Mots-clés : ${keywords}`);

    // Nettoyage et simplification des mots-clés
    const cleanKeywords = keywords
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, "") // Supprime les caractères spéciaux
      .split(/\s+/) // Divise en mots
      .filter((word) => word.length > 2) // Élimine les mots trop courts
      .join(" OR ");

    console.log(`🔍 Mots-clés nettoyés : ${cleanKeywords}`);

    // Étape 2 : Recherche dans Confluence
    const cql = `(title~"${cleanKeywords}*" OR text~"${cleanKeywords}*")`;
    const results = await searchService.search(cql);

    if (!results || results.length === 0) {
      console.log("❌ Aucun résultat trouvé dans Confluence.");
      res.json({
        answer:
          "Il semble que Confluence n’ait retourné aucun résultat pertinent pour cette question.",
      });
      return;
    }

    // Étape 3 : Préparation des données pour ChatGPT
    const pageContents = results.map(
      (result: any) =>
        `Titre : ${result.title}\nURL : ${result.url}\nExtrait : ${
          result.excerpt || "Aucun extrait disponible."
        }`
    );

    console.log("📝 Contenus préparés pour ChatGPT :", pageContents);

    // Étape 4 : Génération de la réponse
    const answer = await chatgptService.synthesizeResponse(
      question,
      pageContents
    );
    res.json({ answer });
  } catch (error) {
    console.error("❌ Erreur lors du traitement de la question :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors du traitement de la question.",
    });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
