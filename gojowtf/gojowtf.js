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
    const results = [];
    const headers = {
        'Referer': 'https://gojo.wtf/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetchv2(`https://backend.gojo.wtf/api/anime/episodes/${id}`, { headers });
    const json = await response.json();

    const zazaProvider = json.find(provider => provider.providerId === "zaza");

    if (zazaProvider?.episodes) {
        zazaProvider.episodes.forEach(episode => {
            results.push({
                href: `https://backend.gojo.wtf/api/anime/tiddies?dub_id=${episode.dub_id}&watchId=${episode.id}&id=${id}&num=${episode.number}&subType=dub&provider=zaza`, 
                number: episode.number
            });
        });
    }

    return JSON.stringify(results);
}

async function extractStreamUrl(url) {
    const headers = {
        'Referer': 'https://gojo.wtf/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const response = await fetchv2(url, { headers });
    const json = await response.json();

    const master = json.sources.find(source => source.quality === "master") || null;

    if (master) {
        return master.url.replace(/\n/g, '');
    } else {
        console.error("No stream found.");
        return null;
    }
}


