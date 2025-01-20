function searchResults(html) {
    let data;
    try {
      data = JSON.parse(html);
    } catch (e) {
      console.error('Failed to parse results');
      return [];
    }
    const results = [];
    data.animes.forEach((anime) => {
      if (anime.name && anime.id) {
        results.push({
          title: anime.name,
          image: anime.poster || "N/A",
          href: `https://hianime.to/watch/${anime.id}`
        });
      }
    });
    return results;
  }
  
  async function extractDetails(greenfn) {
    try {
        /*const headerRegex = /<meta property="og:url" content="https:\/\/hianime\.to\/watch\/([^?]+)/;
        const idMatch = greenfn.match(headerRegex);

        if (!idMatch) {
            return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
        }

        const animeId = idMatch[1]; */
        
        const resp = await fetch(`https://aniwatch140.vercel.app/anime/info?id=one-piece-fan-letter-19406`);
        if (!resp.ok) {
            return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
        }
        
        const data = await resp.json();

        const result = [];

        result.push({
            description: data.anime?.info?.description || "N/A",
            aliases: data.anime?.info?.aliases || "N/A",
            airdate: data.anime?.info?.airdate || "N/A"
        });

        return result;
    } catch (error) {
        return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
    }
}
  
async function extractEpisodes(greenfn) {
    try {
        /*const headerRegex = /<meta property="og:url" content="https:\/\/hianime\.to\/watch\/([^?]+)/;
        const idMatch = greenfn.match(headerRegex);

        if (!idMatch) {
            console.log("No match for ID");
            return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
        }

        const animeId = idMatch[1]; */
        
        const resp = await fetch(`https://aniwatch140.vercel.app/anime/episodes/one-piece-fan-letter-19406`);
        if (!resp.ok) {
            console.log("Fetch failed");
            return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
        }
        
        const data = await resp.json();

        console.log("Data:", data);

        const result = [];

        if (data.episodes && Array.isArray(data.episodes)) {
            data.episodes.forEach(episode => {
                result.push({
                    href: episode.link || "No link",
                    number: episode.title || "No title"
                });
            });
        }

        console.log("Result:", result);
        return result;

    } catch (error) {
        console.log('Fetch error:', error);
        return [{ title: 'Error1', link: '' }];
    }
}

const testhtml = '<meta property="og:url" content="https://hianime.to/watch/one-piece-fan-letter-19406?ep=128693">';
extractEpisodes(testhtml).then(result => {
    console.log("Test Result:", JSON.stringify(result, null, 2));
});

  
  function fetchSeasonEpisodes(url) {
      try {
          const text = fetch(url).then(response => response.text()); 
          const regex = /<td class="seasonEpisodeTitle">\s*<a[^>]*href="([^"]+)"[^>]*>.*?<strong>([^<]*)<\/strong>.*?<span>([^<]+)<\/span>.*?<\/a>/g;
  
          const matches = [];
          let match;
          let holderNumber = 0;
  
          while ((match = regex.exec(text)) !== null) {
              const [_, link] = match;
              matches.push({ number: holderNumber, href: `${baseUrl}${link}` });
          }
  
          return matches;
  
      } catch (error) {
          log('Fetch error:', error);
          return [{ number: '1', href: 'https://error.org' }];
      }
  }
  
  function getSeasonLinks(html) {
      const seasonLinks = [];
      const seasonRegex = /<div class="hosterSiteDirectNav" id="stream">.*?<ul>(.*?)<\/ul>/s;
      const seasonMatch = seasonRegex.exec(html);
      if (seasonMatch) {
          const seasonList = seasonMatch[1];
          const seasonLinkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
          let seasonLinkMatch;
          const filmeLinks = [];
          while ((seasonLinkMatch = seasonLinkRegex.exec(seasonList)) !== null) {
              const [_, seasonLink] = seasonLinkMatch;
              if (seasonLink.endsWith('/filme')) {
                  filmeLinks.push(seasonLink);
              } else {
                  seasonLinks.push(seasonLink);
              }
          }
          seasonLinks.push(...filmeLinks);
      }
      return seasonLinks;
  }
  
