function searchResults(data) {
    try {
        if (!data || !Array.isArray(data.animes)) {
            throw new Error("Invalid data format");
        }

        const matches = [];

        data.animes.forEach(anime => {
            if (anime.id && anime.name) {
                matches.push({
                    title: anime.name.trim(),
                    image: anime.poster || "No Image",  
                    href: `https://hianime.to/watch/${anime.id}` 
                });
            }
        });

        return matches;
    } catch (error) {
        console.log('Error processing the data:', error);
        return JSON.stringify([{ title: 'Error', href: '', image: '' }]);
    }
}

function extractDetails(url) {
    try {
        const text = fetch(url).then(response => response.text()); 
        const descriptionRegex = /<div\s+class="film-description\s+m-hide">[\s\S]*?<div\s+class="text">([\s\S]*?)<\/div>/;
        const aliasesRegex = /data-alternativetitles="([^"]+)"/i;

        const aliasesMatch = aliasesRegex.exec(text);
        const descriptionMatch = descriptionRegex.exec(text);

        console.log("Aliases:", aliasesMatch ? aliasesMatch[1] : "N/A");
        console.log("Description:", descriptionMatch ? descriptionMatch[1] : "N/A");

        const result = [
            { 
                description: descriptionMatch ? descriptionMatch[1].trim() : "N/A", 
                aliases: aliasesMatch ? aliasesMatch[1].trim() : "N/A", 
                airdate: "N/A" 
            }
        ];

        console.log("JSON Output:", JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ description: 'Error', aliases: 'Error', airdate: 'Error' }]);
    }
}

function extractEpisodes(url) {
    try {
        const text = fetch(url).then(response => response.text()); 
        const finishedList = [];
        const seasonLinks = getSeasonLinks(text);
        
        for (const seasonLink of seasonLinks) {
            const seasonEpisodes = fetchSeasonEpisodes(`${baseUrl}${seasonLink}`);
            finishedList.push(...seasonEpisodes);
        }


        finishedList.forEach((item, index) => {
            item.number = index + 1;
        });

        return JSON.stringify(finishedList);

    } catch (error) {
        log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error1', link: '' }]);
    }
}


function fetchSeasonEpisodes(url) {
    try {
        const text = fetch(url).then(response => response.text()); 
        const regex = /<td class="seasonEpisodeTitle">\s*<a[^>]*href="([^"]+)"[^>]*>.*?<strong>([^<]*)<\/strong>.*?<span>([^<]+)<\/span>.*?<\/a>/g;

        const matches = [];
        let match;
        let holderNumber = 0;

        while ((match = regex.exec(text)) !== null) {
            const [_, link] = match;
            matches.push({ number: holderNumber, href: `${baseUrl}${link}` });
        }

        return matches;

    } catch (error) {
        log('Fetch error:', error);
        return [{ number: '1', href: 'https://error.org' }];
    }
}

function getSeasonLinks(html) {
    const seasonLinks = [];
    const seasonRegex = /<div class="hosterSiteDirectNav" id="stream">.*?<ul>(.*?)<\/ul>/s;
    const seasonMatch = seasonRegex.exec(html);
    if (seasonMatch) {
        const seasonList = seasonMatch[1];
        const seasonLinkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
        let seasonLinkMatch;
        const filmeLinks = [];
        while ((seasonLinkMatch = seasonLinkRegex.exec(seasonList)) !== null) {
            const [_, seasonLink] = seasonLinkMatch;
            if (seasonLink.endsWith('/filme')) {
                filmeLinks.push(seasonLink);
            } else {
                seasonLinks.push(seasonLink);
            }
        }
        seasonLinks.push(...filmeLinks);
    }
    return seasonLinks;
}
