function searchResults(html) {
    const results = [];
    const baseUrl = "https://grani.me/";

    const filmListRegex = /<div class="content_episode"[\s\S]*?<\/div>/g;
    const items = html.match(filmListRegex) || [];

    items.forEach(itemHtml => {
        const imgMatch = itemHtml.match(/<img class="coveri" src="([^"]+)"/);
        let imageUrl = imgMatch ? imgMatch[1] : '';

        const titleMatch = itemHtml.match(/<a class="cona" href="([^"]+)">([^<]+)<\/a>/);
        const title = titleMatch ? titleMatch[2] : '';

        const hrefMatch = itemHtml.match(/<a class="an" href="([^"]+)"/);
        let href = hrefMatch ? hrefMatch[1] : '';

        if (imageUrl && title && href) {
            if (!imageUrl.startsWith("https")) {
                if (imageUrl.startsWith("/")) {
                    imageUrl = baseUrl + imageUrl;
                } else {
                    imageUrl = baseUrl + "/" + imageUrl;
                }
            }

            if (!href.startsWith("https")) {
                if (href.startsWith("/")) {
                    href = baseUrl + href;
                } else {
                    href = baseUrl + "/" + href;
                }
            }

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
    
    const descriptionMatch = html.match(/<div class="infodes2 entry-content entry-content-single" itemprop="description">[\s\S]*?<p>([\s\S]*?)<\/p>/);
    let description = descriptionMatch ? descriptionMatch[1] : '';
    
    const aliasesMatch = html.match(/<h1 class="entry-title" itemprop="name""([^"]+)">/);
    let aliases = aliasesMatch ? aliasesMatch[1] : '';
    
    const airdateMatch = html.match(/<div class="textd">Year:<\/div>\s*<div class="textc">([^<]+)<\/div>/);
    let airdate = airdateMatch ? airdateMatch[1] : '';

    if (description && aliases && airdate) {
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
    const baseUrl = "https://grani.me/";

    const serverActiveRegex = /<div class="infoepbox"[^>]*>([\s\S]*?)<\/div>/;
    const serverActiveMatch = html.match(serverActiveRegex);

    if (!serverActiveMatch) {
        return episodes;
    }

    const serverActiveContent = serverActiveMatch[1];
    const episodeRegex = /<a class="infovan" href="([^"]+)">[\s\S]*?<div class="infoept2">[\s\S]*?<div class="centerv">([^<]+)<\/div>/g;

    let match;

    while ((match = episodeRegex.exec(serverActiveContent)) !== null) {
        let href = match[1];
        const number = match[2];
        
        if (!href.startsWith("https")) {
            if (href.startsWith("/")) {
                href = baseUrl + href;
            } else {
                href = baseUrl + "/" + href;
            }
        }
        
        episodes.push({
            href: href,
            number: number
        });
    }
    
    return episodes;
}

function extractStreamUrl(html) {
    const idRegex = /<a[^>]+href="([^"]+)"[^>]*class="an"/;
    const match = html.match(idRegex);
    return match ? match[1] : null;
}
