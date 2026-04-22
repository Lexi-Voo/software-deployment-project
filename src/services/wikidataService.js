export async function getAttractionImageFromWiki(attractionName, city) {
  const queries = [
    `${attractionName} ${city}`,
    attractionName,
  ];

  for (const query of queries) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) continue;

      const searchData = await searchRes.json();
      const title = searchData.query?.search?.[0]?.title;

      if (!title) continue;

      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageterms&titles=${encodeURIComponent(
        title
      )}&piprop=original&format=json&origin=*`;

      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) continue;

      const imageData = await imageRes.json();
      const pages = imageData.query?.pages || {};
      const firstPage = Object.values(pages)[0];

      const image = firstPage?.original?.source || null;

      if (image) return image;
    } catch (error) {
      console.error(`Wiki image fetch failed for ${query}:`, error);
    }
  }

  return null;
}