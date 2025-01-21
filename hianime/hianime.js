async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);        
        const response = await fetch(`https://aniwatch140.vercel.app/anime/search?q=${encodedKeyword}`);        
        const responseText = await response.text();
        
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
