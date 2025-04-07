async function searchResults(keyword) {
    const results = [];
    const headers = {
        'Referer': 'https://gojo.wtf/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetchv2(`https://backend.gojo.wtf/api/anime/search?query=${keyword}&page=1&perPage=35`, headers);
    const json = await response.json();

    json.results.forEach(anime => {
        const title = anime.title.english || anime.title.romaji || anime.title.native || "Unknown Title";
        const image = anime.coverImage.large;
        const href = `${anime.id}`;

        if (title && href && image) {
            results.push({
                title: title,
                image: image,
                href: href
            });
        } else {
            console.error("Missing or invalid data in search result item:", {
                title,
                href,
                image
            });
        }
    });

    return JSON.stringify(results);
}

async function extractDetails(id) {
    const results = [];
    const headers = {
        'Referer': 'https://gojo.wtf/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetchv2(`https://backend.gojo.wtf/api/anime/info/${id}`, headers);
    const json = await response.json();

    const description = json.description || "No description available"; // Handling case where description might be missing

    results.push({
        description: description.replace(/<br>/g, ''),
        aliases: 'N/A',
        airdate: 'N/A'
    });

    return JSON.stringify(results);
}


async function extractEpisodes(id) {
    console.log("extracting episodes");
    const results = [];
    const headers = {
        'Referer': 'https://gojo.wtf/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetchv2(`https://backend.gojo.wtf/api/anime/episodes/${id}`, headers);

    const json = await response.json();

    const zazaProvider = json.find(provider => provider.providerId === "zaza");

    if (zazaProvider && zazaProvider.episodes) {
        zazaProvider.episodes.forEach(episode => {
            results.push({
                href: `${episode.dub_id}/${episode.id}/${id}/${episode.number}`,
                number: episode.number
            });
        });
    }

    console.log("Extracted episodes:", results);
    return results;
}

async function extractStreamUrl(url) {
    const [/*dub_id, watchId, */id, num] = url.split('/');  
     console.log("extracting the stream url of the ${num} episode");
    
    console.error(`ID: ${id}, Number: ${num}, Dub ID: ${dub_id}, Watch ID: ${watchId}`);

    const headers = {
        'Referer': 'https://gojo.wtf/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetch(`https://backend.gojo.wtf/api/anime/tiddies?dub_id=${dub_id}&watchId=${watchId}&id=${id}&num=${num}&subType=dub&provider=zaza`, {
        headers
    });

    const json = await response.json();

    //console.log(json);

    const master = 
        json.sources.find(source => source.quality === "master") ||
        null;

    if (master) {
        console.log(`Best Stream URL: ${master.url.replace(/\n/g, '')}`);
        return master.url.replace(/\n/g, '');
    } else {
        console.error("No stream found.");
        return null;
    }
}


