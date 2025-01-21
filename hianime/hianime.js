async function searchResults(keyword) {
        console.log('Inshallah it will work');
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
        const responseText = response.toString();
        console.log('Raw response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.log('Parse error:', parseError);
            data = response;
        }
            
        console.log('Parsed data:', data);
        
        if (!data || !data.anime || !data.anime.info) {
            throw new Error('Invalid response format');
        }

        const animeInfo = data.anime.info;
        console.log('Anime info:', animeInfo); 
        
        const transformedResults = [{
            description: animeInfo.description || 'No description available',
            aliases: `Duration: ${animeInfo.stats?.duration || 'Unknown'}`,
            airdate: `Rating: ${animeInfo.stats?.rating || 'Unknown'}`
        }];

        console.log('Transformed results:', transformedResults); 
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Rating: Unknown'
        }]);
    }
}
