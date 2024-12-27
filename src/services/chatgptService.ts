import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  // Analyse la question pour générer des mots-clés en français
  async analyzeQuestion(question: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Vous êtes un assistant qui génère des mots-clés pertinents pour une recherche dans une documentation Confluence en français.",
        },
        {
          role: "user",
          content: `Analysez la question suivante et suggérez des mots-clés pertinents :\n\n"${question}"`,
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || "";
  }

  // Génère une réponse basée sur le contenu de Confluence
  async synthesizeResponse(
    question: string,
    content: string[]
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Vous êtes un assistant qui répond aux questions en français en utilisant la documentation suivante provenant de Confluence. Vous devez fournir des réponses claires et inclure les instructions pertinentes ou les étapes détaillées trouvées dans la documentation.",
        },
        {
          role: "user",
          content: `Question : "${question}"\n\nDocumentation :\n${content.join(
            "\n\n"
          )}\n\nRépondez en incluant les étapes ou instructions si disponibles.`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Je n’ai pas trouvé d’informations pertinentes dans la documentation."
    );
  }
}

export default ChatGPTService;
