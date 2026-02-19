const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  time: string;
  url: string;
}

const RSS_FEEDS: { url: string; source: string; category: string }[] = [
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica', category: 'Technology' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', category: 'Technology' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC', category: 'Technology' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC', category: 'Business' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', category: 'Sports' },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC', category: 'Health' },
  { url: 'https://feeds.bbci.co.uk/news/education/rss.xml', source: 'BBC', category: 'Education' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NY Times', category: 'AI' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NY Times', category: 'Finance' },
  { url: 'https://www.reddit.com/r/Music/.rss', source: 'Reddit Music', category: 'Music' },
  { url: 'https://lifehacker.com/feed/rss', source: 'Lifehacker', category: 'Lifestyle' },
  { url: 'https://techcrunch.com/category/startups/feed/', source: 'TechCrunch', category: 'Startups' },
];

function parseTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'recently';
  }
}

function extractItems(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Try RSS <item> format
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const block = match[1];
    const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim();
    const link = block.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s)?.[1]?.trim();
    const pubDate = block.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s)?.[1]?.trim();
    if (title && link) {
      items.push({
        id: `${source}-${items.length}-${Date.now()}`,
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
        source,
        category,
        time: pubDate ? parseTimeAgo(pubDate) : 'recently',
        url: link,
      });
    }
  }

  // Try Atom <entry> format if no items found
  if (items.length === 0) {
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null && items.length < 5) {
      const block = match[1];
      const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim();
      const link = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/)?.[1];
      const updated = block.match(/<updated[^>]*>(.*?)<\/updated>/s)?.[1]?.trim() ||
                      block.match(/<published[^>]*>(.*?)<\/published>/s)?.[1]?.trim();
      if (title && link) {
        items.push({
          id: `${source}-${items.length}-${Date.now()}`,
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
          source,
          category,
          time: updated ? parseTimeAgo(updated) : 'recently',
          url: link,
        });
      }
    }
  }

  return items;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categories } = await req.json().catch(() => ({ categories: [] }));

    const feedsToFetch = categories?.length
      ? RSS_FEEDS.filter(f => categories.includes(f.category))
      : RSS_FEEDS;

    const results = await Promise.allSettled(
      feedsToFetch.map(async (feed) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch(feed.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Zyquence News Reader/1.0' },
          });
          clearTimeout(timeout);
          if (!res.ok) return [];
          const xml = await res.text();
          return extractItems(xml, feed.source, feed.category);
        } catch {
          clearTimeout(timeout);
          return [];
        }
      })
    );

    const allNews: NewsItem[] = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Sort by recency (items with smaller time values first)
    allNews.sort((a, b) => {
      const parseMs = (t: string) => {
        const num = parseInt(t);
        if (t.includes('m')) return num;
        if (t.includes('h')) return num * 60;
        if (t.includes('d')) return num * 1440;
        return 9999;
      };
      return parseMs(a.time) - parseMs(b.time);
    });

    return new Response(
      JSON.stringify({ success: true, news: allNews.slice(0, 20) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch news' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
