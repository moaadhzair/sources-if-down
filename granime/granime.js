function searchResults(html) {
    console.log("Starting searchResults function...");
    const results = [];
    const baseUrl = "https://grani.me/";

    const filmListRegex = /<div class="content_episode"[\s\S]*?<\/div>/g;
    const items = html.match(filmListRegex) || [];
    console.log(`Found ${items.length} film items.`);

    items.forEach((itemHtml, index) => {
        console.log(`Processing item ${index + 1}:`, itemHtml);

        const imgMatch = itemHtml.match(/<img class="coveri" src="([^"]+)"/);
        let imageUrl = imgMatch ? imgMatch[1] : '';
        console.log(`Extracted imageUrl: ${imageUrl}`);

        const titleMatch = itemHtml.match(/<a class="cona" href="([^"]+)">([^<]+)<\/a>/);
        const title = titleMatch ? titleMatch[2] : '';
        console.log(`Extracted title: ${title}`);

        const hrefMatch = itemHtml.match(/<a class="an" href="([^"]+)"/);
        let href = hrefMatch ? hrefMatch[1] : '';
        console.log(`Extracted href: ${href}`);

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
            console.log("Added to results:", { title: title.trim(), image: imageUrl, href: href });
        } else {
            console.log("Skipping item due to missing fields.");
        }
    });

    console.log("Final results:", results);
    return results;
}

function extractDetails(html) {
    console.log("Starting extractDetails function...");
    const details = [];

    const descriptionMatch = html.match(/<div class="infodes2 entry-content entry-content-single" itemprop="description">[\s\S]*?<p>([\s\S]*?)<\/p>/);
    let description = descriptionMatch ? descriptionMatch[1] : '';
    console.log(`Extracted description: ${description}`);

    const aliasesMatch = html.match(/<h1 class="entry-title" itemprop="name""([^"]+)">/);
    let aliases = aliasesMatch ? aliasesMatch[1] : '';
    console.log(`Extracted aliases: ${aliases}`);

    const airdateMatch = html.match(/<div class="textd">Year:<\/div>\s*<div class="textc">([^<]+)<\/div>/);
    let airdate = airdateMatch ? airdateMatch[1] : '';
    console.log(`Extracted airdate: ${airdate}`);

    if (description && aliases && airdate) {
        details.push({
            description: description,
            aliases: aliases,
            airdate: airdate
        });
        console.log("Details added:", details[0]);
    } else {
        console.log("Missing fields in extractDetails, skipping.");
    }

    return details;
}

function extractEpisodes(html) {
    console.log("Starting extractEpisodes function...");
    const episodes = [];
    const baseUrl = "https://grani.me/";

    const serverActiveRegex = /<div class="infoepbox"[^>]*>([\s\S]*?)<\/div>/;
    const serverActiveMatch = html.match(serverActiveRegex);

    if (!serverActiveMatch) {
        console.log("No server active content found.");
        return episodes;
    }

    const serverActiveContent = serverActiveMatch[1];
    const episodeRegex = /<a class="infovan" href="([^"]+)">[\s\S]*?<div class="infoept2">[\s\S]*?<div class="centerv">([^<]+)<\/div>/g;

    let match;
    let episodeCount = 0;

    while ((match = episodeRegex.exec(serverActiveContent)) !== null) {
        let href = match[1];
        const number = match[2];
        console.log(`Found episode ${number} with href: ${href}`);

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
        episodeCount++;
    }

    console.log(`Extracted ${episodeCount} episodes:`, episodes);
    return episodes;
}

function extractStreamUrl(html) {
    console.log("Starting extractStreamUrl function...");
    const idRegex = /<a[^>]+href="([^"]+)"[^>]*class="an"/;
    const match = html.match(idRegex);
    const streamUrl = match ? match[1] : null;
    console.log(`Extracted stream URL: ${streamUrl}`);
    return streamUrl;
}
