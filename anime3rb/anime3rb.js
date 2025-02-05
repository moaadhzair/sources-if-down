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

function extractEpisodes(html) {
    const episodes = [];
    const htmlRegex = /<a\s+[^>]*href="([^"]*?\/episode\/[^"]*?)"[^>]*>[\s\S]*?الحلقة\s+(\d+)[\s\S]*?<\/a>/gi;
    const plainTextRegex = /الحلقة\s+(\d+)/g;

    let matches;

    if ((matches = html.match(htmlRegex))) {
        matches.forEach(link => {
            const hrefMatch = link.match(/href="([^"]+)"/);
            const numberMatch = link.match(/الحلقة\s+(\d+)/);
            if (hrefMatch && numberMatch) {
                const href = hrefMatch[1];
                const number = numberMatch[1];
                episodes.push({
                    href: href,
                    number: number
                });
            }
        });
    } 
    else if ((matches = html.match(plainTextRegex))) {
        matches.forEach(match => {
            const numberMatch = match.match(/\d+/);
            if (numberMatch) {
                episodes.push({
                    href: null, 
                    number: numberMatch[0]
                });
            }
        });
    }

    console.log(episodes);
    return episodes;
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
