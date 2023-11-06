import prompts from "prompts";
import { getMangaList } from "./services/mangaSearchService";
import { generateSelectMangaList, generateSelectVolumeList } from "./utils/mangaHelper";
import { SelectedManga, SelectedVolume } from "./types/common.types";
import { getMangaVolumeList } from "./services/mangaVolumeService";
import { getMangaChapterList } from "./services/mangaChapterService";
import { downloadMangaChapters } from "./services/mangaDownloadService";

async function main() {
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

  const volumeList = await getMangaVolumeList(selectedManga.name, selectedManga.id);

  const { value: selectedVolume }: { value: SelectedVolume } = await prompts({
    name: "value",
    type: "select",
    message: "Select a volume:",
    choices: generateSelectVolumeList(volumeList),
  });

  const chaptersMetadata = await getMangaChapterList(selectedManga.name, selectedVolume);

  await downloadMangaChapters(selectedManga.name, selectedVolume.name, chaptersMetadata);
}

main();
