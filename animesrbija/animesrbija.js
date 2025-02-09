function searchResults(html) {
    const results = [];
    const animeItems = html.match(/<h3 class="ani-title".*?>(.*?)<\/h3>/g) || [];
    const baseUrl = 'https://www.animesrbija.com';

    animeItems.forEach(item => {
        const title = item.match(/>([^<]+)</)[1];
        const href = baseUrl + `/anime/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        results.push({
            title,
            href
        });
    });

    console.log(results);
    return results;
}

function extractDetails(html) {
    const details = [];

    const descriptionMatch = html.match(/<div class="anime-description">([\s\S]*?)<\/div>/);
    let description = descriptionMatch ? descriptionMatch[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/<br \/>\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() : '';


    const nameMatch = html.match(/<h2 class="anime-name[^>]*>([^<]+)<\/h2>/);
    const engNameMatch = html.match(/<h3 class="anime-eng-name">([^<]+)<\/h3>/);

    const airdateMatch = html.match(/<span class="bt">Datum:<\/span>([^<]+)/);
    let airdate = airdateMatch ? airdateMatch[1].trim() : '';

    let name = nameMatch ? nameMatch[1].trim() : '';
    let engName = engNameMatch ? engNameMatch[1].trim() : '';
    let aliases = name === engName ? 'N/A' : engName;

    if (description || airdate) {
        details.push({
            description: description,
            aliases: aliases,
            airdate: airdate
        });
    }

    console.log(details);
    return details;
}

function extractEpisodes(html) {
    const episodes = [];
    const baseUrl = 'https://www.animesrbija.com';

    const episodeRegex = /<a class="anime-episode-link" href="([^"]+)">.*?<\/a>/g;
    let match;

    while ((match = episodeRegex.exec(html)) !== null) {
        const href = baseUrl + match[1];
        const numberMatch = href.match(/epizoda-(\d+)/);
        const number = numberMatch ? numberMatch[1] : '';

        episodes.push({
            href: href,
            number: number
        });
    }

    episodes.reverse();
    console.log(episodes);
    return episodes;
}

function extractStreamUrl(html) {
    const sourceRegex = /player\.html\?source=([^&"]+\.m3u8)/;
    const match = html.match(sourceRegex);
    if (match) {
        const decodedUrl = decodeURIComponent(match[1]);
        console.log(decodedUrl);
        return decodedUrl;
    } else {
        console.log("No stream URL found.");
        return null;
    }
}
