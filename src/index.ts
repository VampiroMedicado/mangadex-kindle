import prompts from "prompts";
import { getMangaList } from "./services/mangaSearchService";
import {
  generateSelectMangaList,
  generateSelectVolumeList,
} from "./utils/mangaHelper";
import { SelectedManga, SelectedVolume } from "./types/common.types";
import { getMangaVolumeList } from "./services/mangaVolumeService";
import { getMangaChapterList } from "./services/mangaChapterService";
import { downloadMangaChapters } from "./services/mangaDownloadService";
import { resolve } from "path";
import { execFile, execFileSync, spawn } from "child_process";

// const downloadsDir = resolve(__dirname, "downloads/Ryuu to Yuusha to Haitatsunin");
// execFile("kcc-c2e_5.6.3.exe", ['-p', 'KPW5', '-m', '--ts', '400', '-u', '-r', '2', '-c', '2', '--mozjpeg', '-o', `${__dirname}`, '-t', '"Ryuu to Yuusha to Haitatsunin"', '-f', 'MOBI', '-b', '2', `${downloadsDir}`], (error, stdout, stderr) => {
//   if (error) {
//     throw error;
//   }
//   console.log(stdout);
// })

/**
 * This function is the entry point of the program. It prompts the user for a search query, retrieves a list of manga based on the search query, prompts the user to select a manga from the list, and then proceeds to download the chapters of the selected manga. It continues to prompt the user for downloading additional volumes until the user chooses to stop.
 *
 * @return {Promise<void>} This function does not return anything.
 */
async function main() {
  let searchMore = true;
  while(searchMore) {
    const { value: searchQuery }: { value: string } = await prompts({
      name: "value",
      type: "text",
      message: "Search query:",
    });
  
    const mangaList = await getMangaList(searchQuery);
  
    const { value: selectedManga }: { value: SelectedManga } = await prompts({
      name: "value",
      type: "select",
      message: "Select a manga:",
      choices: generateSelectMangaList(mangaList),
    });
  
    let downloadMore = true;
    while (downloadMore) {
      const volumeList = await getMangaVolumeList(
        selectedManga.name,
        selectedManga.id
      );
  
      const { value: selectedVolumes }: { value: SelectedVolume[] } =
        await prompts({
          name: "value",
          type: "multiselect",
          message: "Select a volume:",
          choices: generateSelectVolumeList(volumeList),
        });
  
      for (const selectedVolume of selectedVolumes) {
        const chaptersMetadata = await getMangaChapterList(
          selectedManga.name,
          selectedVolume
        );
  
        await downloadMangaChapters(
          selectedManga.name.replace(":", "-"),
          selectedVolume.name,
          chaptersMetadata
        );
      }
  
      const { value: continueDownload } = await prompts({
        name: "value",
        type: "confirm",
        message: "Do you want to download another volume?",
      });
  
      downloadMore = continueDownload;
    }
    const { value: continueSearch } = await prompts({
      name: "value",
      type: "confirm",
      message: "Do you want to search for another manga?",
    });

    searchMore = continueSearch;
  }
}

main();
