import axios from "axios";

class ConfluenceApi {
  private baseUrl: string;
  private username: string;
  private token: string;

  constructor(baseUrl: string, username: string, token: string) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.token = token;
  }

  private getAuthHeader() {
    const encodedToken = Buffer.from(`${this.username}:${this.token}`).toString(
      "base64"
    );
    return `Basic ${encodedToken}`;
  }

  async searchContent(query: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/content/search/`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
          },
          params: {
            cql: query,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data from Confluence:", error);
      throw new Error("Failed to fetch data from Confluence");
    }
  }
}

export default ConfluenceApi;
