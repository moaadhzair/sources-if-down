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
            const headerRegex = /og:url" content="https:\/\/hianime\.to\/watch\/([^?]+)/;
            const idMatch = greenfn.match(headerRegex);
             
            if (idMatch) {
                const animeId = idMatch[1]; 
                
                const resp = await fetch(`https://aniwatch140.vercel.app/anime/info?id=${animeId}`);
                const data = await resp.json();
    
                let result; 
                if (data.anime && data.anime.info) {
                    const info = data.anime.info;
    
                    const description = info.description || "N/A";
                    const aliases = info.aliases || "N/A";  
                    const airdate = info.airdate || "N/A";  
    
                    result = [
                        { 
                            description: description,
                            aliases: aliases,
                            airdate: airdate
                        }
                    ];
                } else {
                    result = [{ description: 'Error', aliases: 'Error', airdate: 'Error' }];
                }

                return result;
            }
        } catch (error) {
            console.log("Error:", error);
            return [{ description: 'Error', aliases: 'Error', airdate: 'Error' }];
        }
}

  function extractEpisodes(url) {
      try {
          const text = fetch(url).then(response => response.text());
          const finishedList = [];
          const seasonLinks = getSeasonLinks(text);
          
          for (const seasonLink of seasonLinks) {
              const seasonEpisodes = fetchSeasonEpisodes(`${baseUrl}${seasonLink}`);
              finishedList.push(...seasonEpisodes);
          }
  
          finishedList.forEach((item, index) => {
              item.number = index + 1;
          });
  
          return JSON.stringify(finishedList);
  
      } catch (error) {
          log('Fetch error:', error);
          return JSON.stringify([{ title: 'Error1', link: '' }]);
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
  
