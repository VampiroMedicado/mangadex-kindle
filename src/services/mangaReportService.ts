import axios from "axios";
import { getToken } from "./tokenService";

const baseURL = "https://api.mangadex.network";

const baseInstance = axios.create();

baseInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    config.headers["Content-Type"] = "application/json";
    config.headers.Authorization = `${token.token_type} ${token.access_token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type ReportMangaParameters = {
  url: string;
  success: boolean;
  cached: boolean;
  bytes: number;
  duration: number;
};

export async function reportManga({
  url,
  success,
  cached,
  bytes,
  duration,
}: ReportMangaParameters): Promise<void> {
  try {
    await baseInstance.post(`${baseURL}/report`, {
      url,
      success,
      bytes,
      duration,
      cached,
    });
    console.log("Image download reported with success: " + success);
  } catch (error) {
    console.error("Error reporting image download: " + error);
  }
}
