function searchResults(html) {
    const results = [];
    const baseUrl = "https://anime3rb.com/";
    
    const titleRegex = /<h2[^>]*>(.*?)<\/h2>/;
    const hrefRegex = /<a\s+href="([^"]+)"\s*[^>]*>/;
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/;
    
    const itemRegex = /<div class="my-2 w-64[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    const items = html.match(itemRegex) || [];
    
    items.forEach((itemHtml) => {
       const titleMatch = itemHtml.match(titleRegex);
       const title = titleMatch ? titleMatch[1].trim() : '';
       
       const hrefMatch = itemHtml.match(hrefRegex);
       const href = hrefMatch ? baseUrl + hrefMatch[1].trim() : '';
       
       const imgMatch = itemHtml.match(imgRegex);
       const imageUrl = imgMatch ? imgMatch[1].trim() : '';
       
       if (title && href) {
           results.push({
               title: title,
               image: imageUrl,
               href: href
           });
       }
    });
    return results;
}

function extractDetails(html) {
   const details = [];

   const descriptionMatch = html.match(/<p class="sm:text-\[1\.05rem\] leading-loose text-justify">([\s\S]*?)<\/p>/);
   let description = descriptionMatch ? descriptionMatch[1].trim() : '';

   const airdateMatch = html.match(/<td[^>]*title="([^"]+)">[^<]+<\/td>/);
   let airdate = airdateMatch ? airdateMatch[1].trim() : '';

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

async function extractStreamUrl(url) {
    try {
        // Fetch the HTML data from the initial URL
        const response = await fetch(url);
        const data = await response.text();

        // Extract embed URL from JSON-LD
        const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
        const match = data.match(jsonLdRegex);
        if (match) {
            const jsonData = JSON.parse(match[1]);
            const embedUrl = jsonData.video && jsonData.video[0] ? jsonData.video[0].embedUrl : null;
            if (embedUrl) {
                // Fetch the embed URL page to extract the video source
                const embedResponse = await fetch(embedUrl);
                const embedData = await embedResponse.text();

                // Extract the video source from the embed page
                const videoSrcRegex = /src:\s*'(https:\/\/[^']+\.mp4[^']*)'/g;
                const videoMatches = [...embedData.matchAll(videoSrcRegex)];

                if (videoMatches.length > 0) {
                    const firstVideoSrc = videoMatches[0][1];
                    return firstVideoSrc;
                } else {
                    console.log('No video sources found on the embed page.');
                }
            }
        }
        return null;

    } catch (error) {
        console.error('Error:', error);
    }
}

async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = response; 

        const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
        const match = html.match(jsonLdRegex);
        
        if (match) {
            const jsonData = JSON.parse(match[1]);
            const embedUrl = jsonData.video && jsonData.video[0] ? jsonData.video[0].embedUrl : null;

            if (embedUrl) {
                const tempUrl = embedUrl.replace(/&amp;/g, '&');
                const response2 = await fetch(tempUrl);
                const data = await response2.text();
                
                const videoSrcRegex = /src:\s*'(https:\/\/[^']+\.mp4[^']*)'/g;
                const matches = [...data.matchAll(videoSrcRegex)];
                
                if (matches.length > 0) {
                    const firstVideoSrc = matches[0][1];
                    console.log(firstVideoSrc);
                    return firstVideoSrc;
                } else {
                    console.log('No video sources found.');
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }

    return null;
}
