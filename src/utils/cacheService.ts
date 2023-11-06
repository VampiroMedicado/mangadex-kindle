import { existsSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { ensureDirectoryExists } from "./utils";

export interface CacheService {
  readCache: <T>(key: string) => T | undefined;
  writeCache: <T>(key: string, data: T, ttl: number) => void;
}

const cacheDir = resolve(__dirname, "cache");
ensureDirectoryExists(cacheDir);

export const cacheService: CacheService = {
  readCache: <T>(key: string) => {
    try {
      const filePath = join(cacheDir, `${key}.json`);
      if (existsSync(filePath)) {
        const cachedObject = JSON.parse(readFileSync(filePath, "utf-8"));
        if (Date.now() > cachedObject.expiry) {
          console.log(`Cache for key ${key} has expired.`);
          unlinkSync(filePath);
          return undefined;
        }
        return cachedObject.data as T;
      }
    } catch (error) {
      console.error(`Failed to read cache for key ${key}:`, error);
    }
    return undefined;
  },
  writeCache: <T>(key: string, data: T, ttl: number) => {
    try {
      const filePath = join(cacheDir, `${key}.json`);
      const expiry = Date.now() + ttl;
      const cachedObject = { data, expiry };
      writeFileSync(filePath, JSON.stringify(cachedObject, null, 2));
    } catch (error) {
      console.error(`Failed to write cache for key ${key}:`, error);
    }
    return undefined;
  },
};
