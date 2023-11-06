import axios from "axios";
import Bottleneck from "bottleneck";
import { getToken } from "./tokenService";
import { CachedChapterMetadata } from "src/types/common.types";
import { ensureDirectoryExists } from "src/utils/utils";
import { resolve } from "path";
import { createWriteStream, existsSync } from "fs";

const downloadsDir = resolve(__dirname, "downloads");
ensureDirectoryExists(downloadsDir);

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

export async function downloadMangaChapters(mangaName: string, volumeName: string, chaptersMetadata: CachedChapterMetadata) {
  const mangaDir = resolve(downloadsDir, mangaName);
  ensureDirectoryExists(mangaDir);
  const volumeDir = resolve(mangaDir, volumeName);
  ensureDirectoryExists(volumeDir);
  for (const [chapterName, chapterMetadata] of Object.entries(chaptersMetadata)) {
    const chapterDir = resolve(volumeDir, chapterName);
    ensureDirectoryExists(chapterDir);
    if (chapterMetadata.baseUrl && chapterMetadata.chapter) {
      const { hash, data } = chapterMetadata.chapter;
      if (hash && data) {
        for (const imageURL of data) {
          await downloadChapterImage(chapterMetadata.baseUrl, hash, imageURL, chapterDir);
        }
      }
    }
    console.log(`Finished with ${chapterName}`);
  }
  console.log(`Finished with ${volumeName}`);
}

async function downloadChapterImage(baseURL: string, hash: string, imageURL: string, chapterDirectory: string) {
  const url = `${baseURL}/${hash}/${imageURL}`;
  const filePath = resolve(chapterDirectory, imageURL);

  if (existsSync(filePath)) {
    console.log('Image already exists. Skipping download.');
    return;
  }

  try {
    console.log(`Downloading image from URL: ${url}`);
    const response = await baseInstance.get(url, { responseType: "stream" });

    const writer = createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log('Image downloaded successfully.');
  } catch (error) {
    console.error(`Error downloading image: ${error}`);
  }
}
