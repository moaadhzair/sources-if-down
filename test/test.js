(function(){const o=console.log;console.log=function(...a){o(...a);Logger.shared.log(a.join(' '),type:'Console');}})();

async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        console.log('Searching for:', encodedKeyword); 
        
        const responseText = await fetch(`https://api.animemundo.net/api/v2/hianime/search?q=${encodedKeyword}&language=dub`);
        console.log('API Response received'); 
        
        const data = await JSON.parse(responseText);
        console.log('Parsed response:', data); 
        
        const filteredAnimes = data.data.animes.filter(anime => anime.episodes.dub !== null); 
        console.log('Filtered Animes:', filteredAnimes); 
        
        const transformedResults = data.data.animes.map(anime => ({
            title: anime.name,
            image: anime.poster,
            href: `https://hianime.to/watch/${anime.id}`
        }));
        console.log('Transformed Results:', transformedResults);
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Search error:', error); // Log any errors encountered
        Logger.shared.log('Search error:', error.message, type: 'Search'); 
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}


// The rest of your functions...


async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetch(`https://api.animemundo.net/api/v2/hianime/search?q=${encodedKeyword}&language=dub`);
        const data = JSON.parse(responseText);

        const filteredAnimes = data.data.animes.filter(anime => anime.episodes.dub !== null); 
        //Filtering out anime's that don't have dub until we fix soft subs issue
        
        const transformedResults = data.data.animes.map(anime => ({
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
        const response = await fetch(`https://api.animemundo.net/api/v2/hianime/anime/${encodedID}`);
        const data = JSON.parse(response);
        
        const animeInfo = data.data.anime.info;
        const moreInfo = data.data.anime.moreInfo;

        const transformedResults = [{
            description: animeInfo.description || 'No description available',
            aliases: `Duration: ${animeInfo.stats?.duration || 'Unknown'}`,
            airdate: `Aired: ${moreInfo?.aired || 'Unknown'}`
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
        const response = await fetch(`https://api.animemundo.net/api/v2/hianime/anime/${encodedID}/episodes`);
        const data = JSON.parse(response);

        const transformedResults = data.data.episodes.map(episode => ({
            href: `https://hianime.to/watch/${encodedID}?ep=${episode.episodeId.split('?ep=')[1]}`,
            number: episode.number
        }));
        
        return JSON.stringify(transformedResults);
        
    } catch (error) {
        console.log('Fetch error:', error);
    }    
}

function extractStreamUrl(html) {
    try {
        const match = html.match(/https:\/\/hianime\.to\/watch\/(.+)$/);
        const encodedID = match[1];
        
        const response = fetch(`https://api.animemundo.net/api/v2/hianime/episode/sources?animeEpisodeId=${encodedID}&category=sub`);
        const data = response.json();

        const streamUrl = data.data.sources.find(source => source.type === 'hls')?.url;
        const subtitleUrl = data.data.tracks.find(track => track.default === true && track.kind === 'captions')?.file;
        return JSON.stringify({
            streamUrl: streamUrl || null,
            vttUrl: subtitleUrl || null
        });
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify({
            streamUrl: null,
            vttUrl: null
        });
    }
}
