///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////       Main Functions          //////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const searchApiUrl = `https://s.to/ajax/seriesSearch?keyword=${encodedKeyword}`;
        const responseText = await fetch(searchApiUrl);

        const data = await JSON.parse(responseText);

        const transformedResults = data.map(serie => ({
            title: serie.name,
            image: `https://s.to${serie.cover}`,
            href: `https://s.to/serie/stream/${serie.link}`
        }));

        return JSON.stringify(transformedResults);

    } catch (error) {
        console.log('Fetch error:' + error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const fetchUrl = `${url}`;
        const text = await fetch(fetchUrl);

        const descriptionRegex = /<p\s+class="seri_des"\s+itemprop="accessibilitySummary"\s+data-description-type="review"\s+data-full-description="([^"]*)".*?>(.*?)<\/p>/s;
        const aliasesRegex = /<h1\b[^>]*\bdata-alternativetitles="([^"]+)"[^>]*>/i;

        const aliasesMatch = aliasesRegex.exec(text);
        let aliasesArray = [];
        if (aliasesMatch) {
            aliasesArray = aliasesMatch[1].split(',').map(a => a.trim());
        }

        const descriptionMatch = descriptionRegex.exec(text) || [];

        const airdateMatch = "Unknown"; // TODO: Implement airdate extraction

        const transformedResults = [{
            description: descriptionMatch[1] || 'No description available',
            aliases: aliasesArray[0] || 'No aliases available',
            airdate: airdateMatch
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:' + error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const baseUrl = 'https://s.to';
        const fetchUrl = `${url}`;
        const html = await fetch(fetchUrl);

        const finishedList = [];
        const seasonLinks = getSeasonLinks(html);

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
        console.log('Fetch error:' + error);
        return JSON.stringify([{ number: '0', href: '' }]);
    }
}


async function extractStreamUrl(url) {
    try {
        const baseUrl = 'https://s.to';
        const fetchUrl = `${url}`;
        const text = await fetch(fetchUrl);

        const finishedList = [];
        const languageList = getAvailableLanguages(text);
        const videoLinks = getVideoLinks(text);

        for (const videoLink of videoLinks) {
            const language = languageList.find(l => l.langKey === videoLink.langKey);
            if (language) {
                finishedList.push({ provider: videoLink.provider, href: `${baseUrl}${videoLink.href}`, language: language.title });
            }
        }

        let firstVideo = null;

        const voeGermanDub = finishedList.find(video => video.provider === 'VOE' && video.language === 'Deutsch');
        if (voeGermanDub) {
            firstVideo = voeGermanDub;
        }
        else {
            const voeGerSub = finishedList.find(video => video.provider === 'VOE' && video.language === 'mit Untertitel Deutsch');
            if (voeGerSub) {
                firstVideo = voeGerSub;
            }
            else {
                firstVideo = finishedList[0];
            }
        }


        const videoPage = await fetch(firstVideo.href);

        // Extract the link from window.location.href in the script tag
        const scriptRegex = /window\.location\.href\s*=\s*['"]([^'"]+)['"]/;
        const scriptMatch = scriptRegex.exec(videoPage);
        const winLocUrl = scriptMatch ? scriptMatch[1] : '';

        const hlsSourceUrl = await fetch(winLocUrl);

        // Extract the sources variable and decode the hls value from base64
        const sourcesRegex = /var\s+sources\s*=\s*({[^}]+})/;
        const sourcesMatch = sourcesRegex.exec(hlsSourceUrl);
        let sourcesString = sourcesMatch ? sourcesMatch[1].replace(/'/g, '"') : null;

        // Remove trailing commas
        sourcesString = sourcesString ? sourcesString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']') : null;

        const sources = sourcesString ? JSON.parse(sourcesString) : null;
        if (sources && sources.hls) {
            const hlsBase64 = sources.hls;
            const hlsDecoded = base64Decode(hlsBase64);
            console.log('HLS Decoded:' + hlsDecoded);
            return hlsDecoded;
        }

        return firstVideo.href;
    } catch (error) {
        console.log('ExtractStreamUrl error:' + error);
        return JSON.stringify([{ provider: 'Error1', link: '' }]);
    }
}



////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////       Helper Functions       ////////////////////////////
////////////////////////////      for ExtractEpisodes     ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

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

// Helper function to fetch episodes for a season
// Site specific structure
async function fetchSeasonEpisodes(url) {
    try {
        const baseUrl = 'https://s.to';
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
        console.log('FetchSeasonEpisodes helper function error:' + error);
        return [{ number: '0', href: 'https://error.org' }];
    }
}


////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////       Helper Functions       ////////////////////////
////////////////////////////      for ExtractStreamUrl    ////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// Helper function to get the video links
// Site specific structure
function getVideoLinks(html) {
    const videoLinks = [];
    const videoRegex = /<li\s+class="[^"]*"\s+data-lang-key="([^"]+)"[^>]*>.*?<a[^>]*href="([^"]+)"[^>]*>.*?<h4>([^<]+)<\/h4>.*?<\/a>.*?<\/li>/gs;
    let match;

    while ((match = videoRegex.exec(html)) !== null) {
        const [_, langKey, href, provider] = match;
        videoLinks.push({ langKey, href, provider });
    }

    return videoLinks;
}

// Helper function to get the available languages
// Site specific structure
function getAvailableLanguages(html) {
    const languages = [];
    const languageRegex = /<img[^>]*data-lang-key="([^"]+)"[^>]*title="([^"]+)"[^>]*>/g;
    let match;

    while ((match = languageRegex.exec(html)) !== null) {
        const [_, langKey, title] = match;
        languages.push({ langKey, title });
    }

    return languages;
}

// Helper function to fetch the base64 encoded string
function base64Decode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';

    str = String(str).replace(/=+$/, '');

    if (str.length % 4 === 1) {
        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }

    for (let bc = 0, bs, buffer, idx = 0; (buffer = str.charAt(idx++)); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }

    return output;
}
