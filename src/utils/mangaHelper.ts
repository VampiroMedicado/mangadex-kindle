import { MangaAggregateResponse, MangaSearchResponse } from "src/types/response.types";

export function generateSelectMangaList(list: MangaSearchResponse) {
  return list && list.data
    ? list.data.map((manga) => {
        const title = manga.attributes?.title && Object.values(manga.attributes?.title || {})[0];
        return {
          title: `${title} | ${manga.attributes?.status} | ${manga.attributes?.publicationDemographic}`,
          value: {
            id: manga.id,
            name: title,
          },
        };
      })
    : [];
}

export function generateSelectVolumeList(list: MangaAggregateResponse) {
  return list && list.volumes ? Object.values(list.volumes).map((volume) => {
    const volumeName = `Volume ${volume.volume}`
    return {
      title: volumeName,
      value: {
        name: volumeName,
        number: volume.volume,
        chapters: volume.chapters,
      },
    };
  }) : [];
}
