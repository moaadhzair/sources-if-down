function searchResults(html) {
    const results = [];
    const baseUrl = "https://www.animeunity.so/anime";
    
    const recordsRegex = /<archivio records="(.*?)"/;
    const recordsMatch = html.match(recordsRegex);

    if (!recordsMatch) {
        return results;
    }
    
    const recordsJson = recordsMatch[1].replace(/&quot;/g, '"');
    let recordsData;
    
    try {
        recordsData = JSON.parse(recordsJson);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return results;
    }
    
    recordsData.forEach(record => {
        if (!record || typeof record !== 'object') return;

        const imageUrl = record.imageurl || '';
        const title = record.title || record.title_eng || '';
        const id = record.id || '';
        const slug = record.slug || '';
        
        if (id && slug) {
            const href = `${baseUrl}/${id}-${slug}`;
            
            results.push({
                title: title.trim(),
                image: imageUrl,
                href: href
            });
        }
    });

    return results;
}

function extractDetails(html) {
    const details = [];
    
    const videoPlayerRegex = /<video-player anime="([^"]*)"/;
    const videoPlayerMatch = html.match(videoPlayerRegex);

    if (!videoPlayerMatch) {
        return details;
    }

    const animeJson = videoPlayerMatch[1].replace(/&quot;/g, '"');
    const animeData = JSON.parse(animeJson);

    const description = animeData.plot || '';
    const aliases = animeData.title_eng || '';
    const airdate = animeData.title || '';

    if (description && aliases && airdate && title) {
        details.push({
            description: description,
            aliases: aliases,
            airdate: airdate
        });
    }
    
    return details;
}

function extractEpisodes(html) {
    const episodes = [];
    
    const videoPlayerRegex = /<video-player[^>]*anime="([^"]*)"[^>]*episodes="([^"]*)"/;
    const videoPlayerMatch = html.match(videoPlayerRegex);

    if (!videoPlayerMatch) {
        return episodes;
    }

    const animeJson = videoPlayerMatch[1].replace(/&quot;/g, '"');
    const animeData = JSON.parse(animeJson);
    const slug = animeData.slug;
    const idAnime = animeData.id;

    const episodesJson = videoPlayerMatch[2].replace(/&quot;/g, '"');
    const episodesData = JSON.parse(episodesJson);

    episodesData.forEach(episode => {
        episodes.push({
            href: `https://animeunity.so/anime/${idAnime}-${slug}/${episode.id}`,
            number: episode.number
        });
    });

    return episodes;
}

async function extractStreamUrl(html) {
    try {
        const vixcloudMatch = html.match(/embed_url="(https:\/\/vixcloud\.co\/embed\/\d+\?[^"]+)"/);
        if (!vixcloudMatch) {
            console.log('No vixcloud.co URL found in the HTML.');
            return null;
        }

        let vixcloudUrl = vixcloudMatch[1];
        vixcloudUrl = vixcloudUrl.replace(/&amp;/g, '&');

        const response = await fetch(vixcloudUrl);
        const downloadUrlMatch = response.match(/window\.downloadUrl\s*=\s*['"]([^'"]+)['"]/);
        
        if (!downloadUrlMatch) {
            console.log('No downloadUrl found in the response.');
            return null;
        }

        const downloadURL = downloadUrlMatch[1];
        console.log(downloadURL);
        return downloadURL;
    } catch (error) {
        console.log('Fetch error:', error);
        return null;
    }
}