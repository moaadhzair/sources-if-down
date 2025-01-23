async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://aniwatch140.vercel.app/anime/search?q=${encodedKeyword}`);
        const data = JSON.parse(responseText);
        
        const transformedResults = data.animes.map(anime => ({
            title: anime.name,
            image: anime.poster,
            href: `https://hianime.to/watch/${anime.id}`
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
  try {
    const match = url.match(/https:\/\/hianime\.to\/watch\/(.+)$/);
    const encodedID = match[1];
    const response = await fetch(`https://aniwatch140.vercel.app/anime/info?id=${encodedID}`);
    const data = JSON.parse(response);
    
    const animeInfo = data.anime.info;
    const moreInfo = data.anime.moreInfo;
    
    const transformedResults = [{
      description: animeInfo.description || 'No description available',
      aliases: `Duration: ${animeInfo.stats?.duration || 'Unknown'}`,
      airdate: `Aired: ${moreInfo.aired || 'Unknown'}`
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

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/hianime\.to\/watch\/(.+)$/);
        const encodedID = match[1];
        const response = await fetch(`https://aniwatch140.vercel.app/anime/episodes/${encodedID}`);
        const data = JSON.parse(response);

        const transformedResults = data.episodes.map(episode => ({
            href: `https://hianime.to/watch/${encodedID}?ep=${episode.episodeId.split('?ep=')[1]}`,
            number: episode.number
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }    
}
