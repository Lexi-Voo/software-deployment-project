export const getAttractions = async (city) => {
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${city}&language=en&format=json&origin=*`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  const entityId = searchData.search?.[0]?.id;
  if (!entityId) return [];

  const query = `
  SELECT ?placeLabel ?image WHERE {
    ?place wdt:P131* wd:${entityId} .
    ?place wdt:P31/wdt:P279* ?type .
    OPTIONAL { ?place wdt:P18 ?image }

    VALUES ?type {
      wd:Q570116
      wd:Q33506
      wd:Q1248784
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  LIMIT 10
  `;

  const url =
    "https://query.wikidata.org/sparql?query=" +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { Accept: "application/sparql-results+json" },
  });

  const data = await res.json();

  return data.results.bindings;
};