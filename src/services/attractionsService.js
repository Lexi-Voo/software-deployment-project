import { getAttractions as getGeoapifyAttractions } from './geoapifyService.js';

export async function getAttractions(cityInfo) {
  return await getGeoapifyAttractions(cityInfo);
}