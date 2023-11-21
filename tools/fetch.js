import http from "node:http";
import https from "node:https";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const FetchToolkit = {
  async agentSelector(_parsedUrl) {
    if (_parsedUrl.protocol === "http:") {
      return httpAgent;
    } else {
      return httpsAgent;
    }
  },
};

export default FetchToolkit;
