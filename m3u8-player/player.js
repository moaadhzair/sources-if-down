async function searchResults(keyword) {
  const results = [];

  const query = `
    query ($search: String) {
      Page(perPage: 100) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          coverImage {
            large
          }
          episodes
          status
          averageScore
          genres
          siteUrl
        }
      }
    }
  `;

  const url = "https://graphql.anilist.co";
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://anilist.co"
  };
  const method = "POST";
  const body = {
    query: query,
    variables: {
      search: keyword
    }
  };

  try {
    const response = await fetchv2(url, headers, method, body);
    const json = await response.json();

    const Animes = json.data.Page.media;

    Animes.forEach(anime => {
      const title =
        anime.title.english ||
        anime.title.romaji ||
        anime.title.native ||
        "Unknown Title";
      const image = anime.coverImage.large;
      const href = `${anime.id}`;

      if (title && href && image) {
        results.push({
          title,
          image,
          href
        });
      } else {
        console.error("Missing or invalid data in search result item:", {
          title,
          href,
          image
        });
      }
    });

    return JSON.stringify(results);
  } catch (error) {
    console.error("Error fetching anime:", error);
    return [];
  }
}


async function extractDetails(id) {
  const results = [];
  const headers = {
      'Referer': 'https://gojo.wtf/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  const response = await fetchv2(`https://backend.gojo.wtf/api/anime/info/${id}`, headers);
  const json = await response.json();

  const description = json.description || "No description available"; // Handling case where description might be missing

  results.push({
      description: description.replace(/<br>/g, ''),
      aliases: 'N/A',
      airdate: 'N/A'
  });

  return JSON.stringify(results);
}


async function extractEpisodes(id) {
  const results = [];
  const headers = {
      'Referer': 'https://gojo.wtf/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  const response = await fetchv2(`https://backend.gojo.wtf/api/anime/episodes/${id}`, headers );
  const json = await response.json();

  const zazaProvider = json.find(provider => provider.providerId === "zaza");

  if (zazaProvider?.episodes) {
      zazaProvider.episodes.forEach(episode => {
          results.push({
              href: `https://backend.gojo.wtf/api/anime/tiddies?dub_id=${episode.dub_id}&watchId=${episode.id}&id=${id}&num=${episode.number}&subType=dub&provider=zaza`, 
              number: episode.number
          });
      });
  }

  return JSON.stringify(results);
}

async function extractStreamUrl(url) {
  const url1 = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8";
  const url2 = "http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8";
  
  return [url1, url2];
}


