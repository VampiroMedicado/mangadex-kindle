import axios from "axios";
import { MangaAggregateResponse } from "src/types/response.types";
import { getToken } from "./tokenService";
import { cacheService } from "src/utils/cacheService";

const baseURL = "https://api.mangadex.org";

const baseInstance = axios.create();

baseInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    config.headers.Authorization = `${token.token_type} ${token.access_token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getMangaVolumeList(mangaName: string, mangaId: string): Promise<MangaAggregateResponse> {
  const cacheName = `volume-metadata-${mangaName.replace(" ", "_")}`;
  const cache = cacheService.readCache(cacheName);

  if (cache) {
    console.log("Returning data from cache");
    return cache;
  }

  try {
    const response = await baseInstance.get(`${baseURL}/manga/${mangaId}/aggregate`, {
      params: {
        translatedLanguage: ["en"],
      },
    });

    if (response.status === 200) {
      const expirationTime = 60 * 60 * 1000; // 1 hour in milliseconds
      cacheService.writeCache(cacheName, response.data, expirationTime);
      console.log("Returning data from API");
      return response.data;
    }

    throw Error("Error with status code: " + response.status);
  } catch (error) {
    console.log("Error fetching manga list", error);
    throw error;
  }
}
