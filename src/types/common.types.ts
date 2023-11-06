import { paths } from "./api";
import { MangaChaptersResponse } from "./response.types";

/**
 * Represents a selected manga.
 */
export type SelectedManga = {
  /**
   * The ID of the manga.
   */
  id: string;

  /**
   * The name of the manga.
   */
  name: string;
};

export type SelectedVolume = {
  name: string;
  number: string;
  chapters: {
    [key: string]: {
      chapter?: string;
      /** Format: uuid */
      id?: string;
      others?: string[];
      count?: number;
    };
  };
};

export type CachedChapterMetadata = {
  [chapter: string]: MangaChaptersResponse;
};
