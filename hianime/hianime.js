async function searchResults(keyword) {
    console.log('Inshallah it will work _/\_');
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
        const encodedID = url.match(/https:\/\/hianime\.to\/watch\/(.+)$/)[1];
        const response = await fetch(`https://aniwatch140.vercel.app/anime/info?id=${encodedID}`);
        
        // Handle both Node.js and iOS environments
        const data = response.json ? await response.json() : JSON.parse(response);
        
        const animeInfo = data.anime.info;
        const transformedResults = [{
            description: animeInfo.description,
            aliases: `Duration: ${animeInfo.stats.duration}`,
            airdate: `Rating: ${animeInfo.stats.rating}`
        }];
        
        console.log('Transformed Results:', transformedResults);
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Error fetching anime data:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Rating: Unknown'
        }]);
    }
}
