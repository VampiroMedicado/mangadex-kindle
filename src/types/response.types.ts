import { paths } from './api';

/**
 * Represents the response of a manga search API request.
 */
export type MangaSearchResponse = paths["/manga"]["get"]["responses"]["200"]["content"]["application/json"];

export type MangaVolumeResponse = paths["/manga/{id}/feed"]["get"]["responses"]["200"]["content"]["application/json"];

export type MangaAggregateResponse = paths["/manga/{id}/aggregate"]["get"]["responses"]["200"]["content"]["application/json"];

export type MangaChaptersResponse = paths['/at-home/server/{chapterId}']['get']['responses']['200']['content']['application/json'];