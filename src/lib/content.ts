import { getCollection, type CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;

export const hrefOf = (e: ProjectEntry) => `/projects/${e.id}/`;

export async function projectEntries() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}
