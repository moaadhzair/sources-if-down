async function searchResults(query) {
    console.log('Search Query:', query);    
    const fetchUrl = `https://aniwatch140.vercel.app/anime/search?q=${(query)}`;
    console.log('Fetch URL:', fetchUrl);

    try {
        const response = await fetch(fetchUrl);
        if (!response || !response.ok) {
            console.error('API request failed with status:', response?.status);
            return [];
        }

        const data = await response.json();
        console.log('Parsed JSON:', data);

        if (!data || !data.animes) {
            console.error('Error: Unexpected response structure:', data);
            return [];
        }

        const results = data.animes.map(anime => ({
            title: anime.name || "Unknown Title",
            image: anime.poster || "N/A",
            href: `https://hianime.to/watch/${anime.id}`
        }));

        console.log('Final Results:', results);
        return results;

    } catch (e) {
        console.error('Failed to fetch or parse results:', e);
        return [];
    }
}

  
  async function extractDetails(greenfn) {
    try {
        const headerRegex = /<meta property="og:url" content="https:\/\/hianime\.to\/watch\/([^?]+)/;
        const idMatch = greenfn.match(headerRegex);

        if (!idMatch) {
            return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
        }

        const animeId = idMatch[1]; 
        
        const resp = await fetch(`https://aniwatch140.vercel.app/anime/info?id=${animeId}`);
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
        const headerRegex = /<meta property="og:url" content="https:\/\/hianime\.to\/watch\/([^?]+)/;
        const idMatch = greenfn.match(headerRegex);

        if (!idMatch) {
            console.log("No match for ID");
            return [{ description: 'N/A', aliases: 'N/A', airdate: 'N/A' }];
        }

        const animeId = idMatch[1]; 
        
        const resp = await fetch(`https://aniwatch140.vercel.app/anime/episodes/${animeId}`);
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
  
