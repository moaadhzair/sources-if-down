async function searchResults(keyword) {
    const response = await fetch(`https://111.90.159.132/?s=${keyword}`);
    const html = await response;

    const results = [];
    const filmListRegex = /<article[^>]+itemscope[^>]+itemtype="http:\/\/schema\.org\/Movie"[^>]*>[\s\S]*?<\/article>/g;
    const items = html.match(filmListRegex); 

    if (!items) return results; 

    items.forEach(itemHtml => {
        const titleMatch = itemHtml.match(/<p class="entry-title"[^>]*>\s*<a[^>]+>([^<]+)<\/a>/);
        const hrefMatch = itemHtml.match(/<a href="([^"]+)"[^>]+title="Watch Movie:/);
        const imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/);

        if (titleMatch && hrefMatch && imgMatch) {
            results.push({
                title: titleMatch[1].trim(),
                image: imgMatch[1].trim(),
                href: hrefMatch[1].trim()
            });
        }
    });
	console.log(results);
    return results;
}

async function extractDetails(url) {
    const response = await fetch(url);
    const html = await response;
    const details = [];

    const descriptionMatch = html.match(/<div class="entry-content entry-content-single"[^>]*>([\s\S]*?)<\/div>/);
    let description = descriptionMatch ? descriptionMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : '';
    
    description = description.replace(/\s+/g, ' ').replace(/Country:[^<]+/g, '').trim();

    const airdateMatch = html.match(/Year: <a href="[^"]*" rel="tag">(\d{4})<\/a>/);
    let airdate = airdateMatch ? airdateMatch[1] : '';

    if (description && airdate) {
        details.push({
            description: description,
            aliases: 'N/A',
            airdate: airdate
        });
    }
	console.log(details);
    return details;
}

async function extractEpisodes(url) {
    const response = await fetch(url);
    const html = await response;
    const episodes = [];

    const canonicalLinkMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    const baseUrl = canonicalLinkMatch ? canonicalLinkMatch[1] : '';

    if (baseUrl) {
        const hardcodedEpisode = {
            href: baseUrl + '#download',
            number: '1'
        };
        episodes.push(hardcodedEpisode);
    }

    console.log(episodes);
    return episodes;
}

async function extractStreamUrl(url) {
    const response = await fetch(url);
    const html = await response;

    const sourceRegex = /<video[^>]*>.*?<source\s+src=['"]([^'"]+)['"][^>]*>/i;
    const match = html.match(sourceRegex);
    const url = match ? match[1].replace(/&amp;/g, '&') : null;
    console.log(url);
    return url;
}

