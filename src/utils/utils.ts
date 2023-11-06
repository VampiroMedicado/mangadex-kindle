import { existsSync, mkdirSync } from "fs";

export const ensureDirectoryExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
};
