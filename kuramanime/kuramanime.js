function searchResults(html) {
	const results = [];

	const animeEntryRegex = /<div class="product__item">[\s\S]*?<a href="([^"]+)"[\s\S]*?data-setbg="([^"]+)"[\s\S]*?<h5><a[^>]*>([^<]+)<\/a><\/h5>/g;

	const entries = html.matchAll(animeEntryRegex);
	for (const entry of entries) {
		const href = entry[1].trim();
		const imageUrl = entry[2].trim();
		const title = entry[3].trim();

		if (href && imageUrl && title) {
			results.push({
				title: title,
				href: href,
				image: imageUrl
			});
		}
	}

	console.log(results);
	return results;
}

function extractDetails(html) {
	const details = [];
	const descriptionMatch = html.match(/<p id="synopsisField"[^>]*>([\s\S]*?)<\/p>/);

	const description = descriptionMatch ?
		descriptionMatch[1]
		.replace(/<\/?[^>]+(>|$)/g, '')
		.replace(/\s+/g, ' ')
		.trim() :
		'N/A';

	details.push({
		description: description,
		aliases: 'N/A',
		airdate: 'N/A'
	});

	console.log(details);
	return details;
}

function extractEpisodes(html) {
    const episodes = [];    
    const episodeLinks = [...html.matchAll(/<a\s+class=['"]btn btn-sm btn-secondary mb-1 mt-1['"]\s*href=['"]([^'"]+)['"][^>]*>\s*Ep\s*(\d+)/g)];
    
    if (episodeLinks.length === 0) {
        console.error("No episode links found in HTML");
        return episodes;
    }    
    const episodeNumbers = episodeLinks.map(match => parseInt(match[2], 10));
    const minEpisode = Math.min(...episodeNumbers);
    const maxEpisode = Math.max(...episodeNumbers);    
    const baseUrlMatch = episodeLinks[0][1].match(/(https:\/\/v6\.kuramanime\.run\/anime\/\d+\/[^/]+\/episode\/)[^/]+/);
    
    if (!baseUrlMatch) {
        console.error("Could not extract base URL");
        return episodes;
    }
    
    const baseUrl = baseUrlMatch[1];    
    for (let episodeNumber = minEpisode; episodeNumber <= maxEpisode; episodeNumber++) {
        episodes.push({
            href: `${baseUrl}${episodeNumber}`,
            number: episodeNumber.toString()
        });
    }
    
    console.log("Extracted episodes:", JSON.stringify(episodes, null, 2));
    return episodes;
}

function extractStreamUrl(html) {
    const videoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/i;
    
    const match = html.match(videoRegex);
    
    if (!match) {
        console.log("No stream URL found");
        return null;
    }
    
    const streamUrl = decodeURIComponent(match[1].replace(/&amp;/g, '&'));
    console.log(streamUrl);
    return streamUrl;
}
