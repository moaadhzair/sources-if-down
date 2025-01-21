async function searchResults(keyword) {
    console.log('Inshallah it will work');
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://aniwatch140.vercel.app/anime/search?q=${encodedKeyword}`);
        
        const data = await response.json();
        
        const transformedResults = data.animes.map(anime => ({
            title: anime.name,
            image: anime.poster,
            href: `https://hianime.to/watch/${anime.id}`
        }));
        
        return transformedResults;
        
    } catch (error) {
        console.log('Error fetching anime data:', error);
        throw error; 
    }
}

  
async function extractDetails(url) {
    try {
        const encodedID = url.match(/https:\/\/hianime\.to\/watch\/(.+)$/)[1];
        const response = await fetch(`https://aniwatch140.vercel.app/anime/info?id=${encodedID}`);
        const data = JSON.parse(response);
        const animeInfo = data.anime.info;
        
        const transformedResults = [{
            description: animeInfo.description,
            aliases: `Duration: ${animeInfo.stats.duration}`,
            airdate: `Rating: ${animeInfo.stats.rating}`
        }];
        
        console.log('Transformed Results:', transformedResults);
        return transformedResults;
        
    } catch (error) {
        console.log('Error fetching anime data:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Rating: Unknown'
        }]);
    }
}
