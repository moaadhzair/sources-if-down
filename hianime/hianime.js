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
        const html = await fetch(url);
        console.log(html);
        const descriptionMatch = html.match(/<div class="film-description m-hide">\s*<div class="text">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/);
        const durationMatch = html.match(/<span class="item">(\d+m)<\/span>/);
        const ratingMatch = html.match(/<div class="tick-item tick-pg">([^<]+)<\/div>/);

        const description = descriptionMatch ? descriptionMatch[1].replace(/<br\s*\/?>/g, ' ') : 'No description available';
        const duration = durationMatch ? durationMatch[1] : 'Unknown';
        const rating = ratingMatch ? ratingMatch[1] : 'Unknown';

        const transformedResults = [{
            description: description,
            aliases: `Duration: ${duration}`,
            airdate: `Rating: ${rating}`
        }];

        console.log('Transformed results:', transformedResults);
        return JSON.stringify(transformedResults);

    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([
            {
                description: 'Error loading description',
                aliases: 'Duration: Unknown',
                airdate: 'Rating: Unknown'
            }
        ]);
    }
}

async function extractEpisodes(url) {
    try {
    const match = url.match(/https:\/\/hianime\.to\/watch\/(.+)$/);
    const encodedID = match[1];
    const response = await fetch(`https://aniwatch140.vercel.app/anime/info?id=${encodedID}`);
    const data = JSON.parse(response);

    console.log(data);
    
    const transformedResults = data.episodes.map(episode => ({
        href: `https://hianime.to/watch/${encodedID}`,
        number: episode.number
    }));
    
    return JSON.stringify(transformedResults);
    
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }    
}
