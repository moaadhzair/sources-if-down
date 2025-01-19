const baseUrl = 'https://https://aniwatch140.vercel.app/anime/home';
const searchUrl = 'https://aniwatch140.vercel.app/anime/search?q=';

async function searchResults(search) {
    try {
        const fetchUrl = `${searchUrl}${search}`;
        const response = await fetch(fetchUrl);
        const data = await response.json();  // Get the JSON data from the response

        const matches = [];

        // Loop through the fetched animes
        data.animes.forEach(anime => {
            if (anime.id && anime.name) {
                matches.push({
                    title: anime.name.trim(),
                    image: anime.poster || "No Image",  // If there's no poster, return "No Image"
                    href: `https://hianime.to/watch/${anime.id}`  // Construct the URL with the ID
                });
            }
        });
        console.log("Final JSON Output:", JSON.stringify(matches, null, 2));

        // Return the result as a JSON string
        return JSON.stringify(matches);
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error', href: '', image: '' }]);
    }
}

searchResults();

async function extractDetails(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
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

        return result
    } catch (error) {
        console.log('Fetch error:', error);
        return JSON.stringify([{ description: 'Error', aliases: 'Error', airdate: 'Error' }]);
    }
}
//Test url
//const testurl = 'https://hianime.to/watch/one-piece-fan-letter-19406';
//extractDetails(testurl);


async function extractEpisodes(url){
    try {
        const fetchUrl = `${url}`;
        const text = await fetch(fetchUrl);

        const finishedList = [];
        const seasonLinks = getSeasonLinks(text);
        
        for (const seasonLink of seasonLinks) {
            const seasonEpisodes = await fetchSeasonEpisodes(`${baseUrl}${seasonLink}`);
            finishedList.push(...seasonEpisodes);
        }

        // Replace the field "number" with the current index of each item, starting from 1
        finishedList.forEach((item, index) => {
            item.number = index + 1;
        });

        return JSON.stringify(finishedList);

    } catch (error) {
        log('Fetch error:', error);
        return JSON.stringify([{ title: 'Error1', link: '' }]);
    }
}




// Helper function to fetch episodes for a season
// Site specific structure
async function fetchSeasonEpisodes(url) {
    try {
        const fetchUrl = `${url}`;
        const text = await fetch(fetchUrl);

        // Updated regex to allow empty <strong> content
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




// Helper function to get the list of seasons
// Site specific structure
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
