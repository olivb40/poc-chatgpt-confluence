import ConfluenceApi from "../api/confluenceApi";

class SearchService {
  private confluenceApi: ConfluenceApi;

  constructor(confluenceApi: ConfluenceApi) {
    this.confluenceApi = confluenceApi;
  }

  async search(query: string): Promise<any> {
    const results = await this.confluenceApi.searchContent(query);
    return results.results.map((r: any) => ({
      id: r.id,
      title: r.title,
      url: r._links?.webui,
    }));
  }
}

export default SearchService;
