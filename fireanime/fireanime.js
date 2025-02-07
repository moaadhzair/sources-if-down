async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://fireani.me/api/anime/search?q=${encodedKeyword}`);
        const data = await JSON.parse(responseText);
        
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
        const data = await JSON.parse(response);
        
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
        const data = await JSON.parse(response);

        const episodes = data.data.anime_seasons.reduce((acc, season, seasonIndex) => {
            const seasonNumber = seasonIndex + 1; 
            const seasonEpisodes = season.anime_episodes || [];
            seasonEpisodes.forEach(episode => {
                acc.push({
                    href: `${encodedID}&season=${seasonNumber}&episode=${episode.episode}`,
                    number: episode.episode
                });
            });
            return acc;
        }, []);

        console.log(episodes);
        return JSON.stringify(episodes);
    } catch (error) {
        console.log('Fetch error:', error);
    }    
}



extractEpisodes('naruto-shippuden');

async function extractStreamUrl(id) {
    try {
        const encodedID = encodeURIComponent(id);
        const response = await fetch(`https://fireani.me/api/anime/episode?slug=${encodedID}`);
        const data = JSON.parse(response);
       
       const voeStream = data.data.anime_episode_links.find(link => link.name === 'VOE' && link.lang === 'eng-sub');

       if (voeStream) {
        const newLink = voeStream.link.replace('https://voe.sx/e/', 'https://maxfinishseveral.com/e/');
        const tempHTML = await fetch(newLink);

        const hlsMatch = tempHTML.match(/var\s+sources\s*=\s*({.*?})/s);
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
