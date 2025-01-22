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
        const html = await fetch(url);

        const descriptionMatch = html.match(/<div class="film-description m-hide">\s*<div class="text">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/);
        const durationMatch = html.match(/<span class="item">(\d+m)<\/span>/);
        const ratingMatch = html.match(/<div class="tick-item tick-pg">([^<]+)<\/div>/);

        const description = descriptionMatch ? descriptionMatch[1] : 'No description available';
        const duration = durationMatch ? durationMatch[1] : 'Unknown';
        const rating = ratingMatch ? ratingMatch[1] : 'Unknown';

        const transformedResults = [{
            description: 'Test',
            aliases: 'Test',
            airdate: 'Test'
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
