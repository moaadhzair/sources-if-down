async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://fireani.me/api/anime/search?q=${encodedKeyword}`);
        const data = JSON.parse(responseText);
        
        const transformedResults = data.data.map(anime => ({
            title: anime.title,
            image: `https://fireani.me/img/posters/${anime.poster}`,
            href: anime.slug
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}


async function extractDetails(slug) {
    try {
        const encodedID = encodeURIComponent(slug);
        const response = await fetch(`https://fireani.me/api/anime?slug=${encodedID}`);
        const data = JSON.parse(response);
        
        const animeInfo = data.data;
        
        const transformedResults = [{
            description: animeInfo.desc || 'No description available', 
            aliases: `Alternate Titles: ${animeInfo.alternate_titles || 'Unknown'}`,  
            airdate: `Aired: ${animeInfo.start ? animeInfo.start : 'Unknown'}`
        }];
        
        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
        description: 'Error loading description',
        aliases: 'Duration: Unknown',
        airdate: 'Aired: Unknown'
        }]);
  }
}

async function extractEpisodes(slug) {
  try {
    const encodedID = encodeURIComponent(slug);
    const response = await fetch(`https://fireani.me/api/anime?slug=${encodedID}`);
    const data = JSON.parse(await response._bodyInit);
      
    const episodes = data.data.anime_seasons[0]?.anime_episodes || [];
      
    const transformedResults = episodes.map(episode => ({
      href: `${encodedID}&episode=${episode.episode}`,
      number: episode.episode
    }));
      
    return JSON.stringify(transformedResults);
  } catch (error) {
    console.log('Fetch error:', error);
  }
}

async function extractStreamUrl(id) {
  try {
    const encodedID = encodeURIComponent(id);
    const response = await fetch(`https://fireani.me/api/anime/episode?slug=${encodedID}`);
    const data = JSON.parse(await response._bodyInit);
      
    const voeStream = data.data.anime_episode_links.find(link => link.name === 'VOE' && link.lang === 'eng-sub');
      
    if (voeStream) {
      const newLink = voeStream.link.replace('https://voe.sx/e/', 'https://maxfinishseveral.com/e/');
      const tempHTML = await fetch(newLink);
      const tempHTMLText = await tempHTML._bodyInit;
        
      const hlsMatch = tempHTMLText.match(/var\s+sources\s*=\s*({.*?})/s);
        
      if (hlsMatch) {
        const sources = JSON.parse(hlsMatch[1]);
        const hlsEncodedUrl = sources.hls;
        const decodedUrl = atob(hlsEncodedUrl);
        return decodedUrl;
      }
    }
      
    return null;
  } catch (error) {
    console.log('Fetch error:', error);
    return null;
  }
}
