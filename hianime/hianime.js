async function searchResults(query) {   
    const fetchUrl = `https://aniwatch140.vercel.app/anime/search?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(fetchUrl);
        let responseData;
        
        try {
            responseData = response.json ? await response.json() : JSON.parse(response);
        } catch (parseError) {
            console.log('Parse error:', parseError);
            // Return a minimal valid JSON string
            return '{"status":"error","data":[]}';
        }
        
        if (!responseData || !responseData.animes) {
            console.log('Error: Unexpected response structure');
            return '{"status":"error","data":[]}';
        }

        // Create a clean data object
        const results = responseData.animes.map(anime => ({
            title: String(anime.name || "Unknown Title").replace(/"/g, '\\"'),
            image: String(anime.poster || "N/A").replace(/"/g, '\\"'),
            href: String(`https://hianime.to/watch/${anime.id}`).replace(/"/g, '\\"')
        }));

        // Create a minimal response object
        const responseObject = {
            status: "success",
            data: results
        };

        // Convert to string with minimal whitespace
        const jsonString = JSON.stringify(responseObject, null, 0);
        
        // Log for debugging
        console.log('Response length:', jsonString.length);
        console.log('First 100 chars:', jsonString.substring(0, 100));
        
        return jsonString;

    } catch (e) {
        console.log('Failed to fetch or parse results:', e);
        return '{"status":"error","data":[]}';
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
  
