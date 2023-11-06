import axios from "axios";
import Bottleneck from "bottleneck";
import { getToken } from "./tokenService";
import { MangaChaptersResponse } from "src/types/response.types";
import { cacheService } from "src/utils/cacheService";
import { CachedChapterMetadata, SelectedVolume } from "src/types/common.types";

const baseURL = "https://api.mangadex.org";

const baseInstance = axios.create();

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 2000,
});

baseInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    config.headers.Authorization = `${token.token_type} ${token.access_token}`;
    return await limiter.schedule(() => Promise.resolve(config));;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getMangaChapterList(mangaName: string, selectedVolume: SelectedVolume): Promise<CachedChapterMetadata> {
  const cacheName = `volume-${selectedVolume.number}-chapter-metadata-${mangaName.replace(" ", "_")}`;
  const cache = <CachedChapterMetadata | undefined>cacheService.readCache(cacheName);
  if (cache) {
    return cache;
  }

  const result: CachedChapterMetadata = {};
  for (const [number, metadata] of Object.entries(selectedVolume.chapters)) {
    const chapterName = `Chapter ${number}`;
    console.log("Not found in cache:", chapterName);
    if (metadata?.id) {
      result[chapterName] = await getMangaChapter(metadata.id);
    } else {
      throw Error(`Chapter ID missing! ${chapterName}`);
    }
  }

  const expirationTime = 60 * 60 * 1000; // 1 hour in milliseconds
  cacheService.writeCache(cacheName, result, expirationTime);
  return result;
}

async function getMangaChapter(chapterId: string): Promise<MangaChaptersResponse> {
  try {
    const response = await baseInstance.get(`${baseURL}/at-home/server/${chapterId}`);
    if (response.status === 200) {
      console.log('Returning data from API');
      return response.data;
    }
    throw Error(`Error with status code: ${response.status}`);
  } catch (error) {
    console.log('Error fetching chapter metadata', error);
    throw error;
  }
}
