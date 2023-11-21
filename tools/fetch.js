import http from "node:http";
import https from "node:https";
import axios from "axios";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const FetchToolkit = {
  agentSelector(_parsedUrl) {
    if (_parsedUrl.protocol === "http:") {
      return httpAgent;
    } else {
      return httpsAgent;
    }
  },
  async fetch(url, params = {}) {
    try {
      const axiosConfig = {
        url: url,
        method: params.method || "GET",
        headers: params.headers || {
          "User-Agent": "Yunzai-Bot/Honor-Plugin",
        },
        ...params,
      };

      // Additional params (like body data for POST requests)
      if (params.body) {
        axiosConfig.data = params.body;
      }

      const response = await axios(axiosConfig);
      return response.data;
    } catch (err) {
      console.log(`Error fetchng data from ${url}: `, err);
      return null;
    }
  },
};

export default FetchToolkit;
