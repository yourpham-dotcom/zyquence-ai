const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function fetchChartData(symbol: string, range = '1d', interval = '5m') {
  const urls = [
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`,
  ];

  for (const url of urls) {
    try {
      const resp = await fetch(url, { headers: HEADERS });
      if (!resp.ok) continue;
      const data = await resp.json();
      const result = data?.chart?.result?.[0];
      if (result) return result;
    } catch (e) {
      console.log(`Error fetching ${url}:`, e);
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols, type } = await req.json();

    if (type === 'chart') {
      const symbol = symbols?.[0] || '^IXIC';
      const result = await fetchChartData(symbol, '1d', '5m');

      if (!result) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unable to fetch chart data' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];
      const meta = result.meta || {};

      const points = timestamps
        .map((t: number, i: number) => ({ time: t * 1000, price: closes[i] ?? null }))
        .filter((p: { price: number | null }) => p.price !== null);

      return new Response(
        JSON.stringify({
          success: true,
          chart: {
            symbol: meta.symbol || symbol,
            currency: meta.currency,
            previousClose: meta.previousClose || meta.chartPreviousClose || 0,
            points,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Quotes: use chart endpoint with 1d/1d to extract price data from metadata
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'symbols array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all symbols in parallel using chart endpoint
    const results = await Promise.allSettled(
      symbols.map(async (symbol: string) => {
        const result = await fetchChartData(symbol, '1d', '1d');
        if (!result) return null;

        const meta = result.meta || {};
        const closes = result.indicators?.quote?.[0]?.close || [];
        const lastPrice = meta.regularMarketPrice || closes[closes.length - 1] || 0;
        const prevClose = meta.previousClose || meta.chartPreviousClose || lastPrice;
        const change = lastPrice - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;

        return {
          symbol: meta.symbol || symbol,
          name: meta.shortName || meta.longName || meta.symbol || symbol,
          price: lastPrice,
          change,
          changePercent,
          previousClose: prevClose,
          marketState: meta.currentTradingPeriod?.regular ? 
            (Date.now() / 1000 >= meta.currentTradingPeriod.regular.start && 
             Date.now() / 1000 <= meta.currentTradingPeriod.regular.end ? 'REGULAR' : 'CLOSED') 
            : 'UNKNOWN',
        };
      })
    );

    const quotes = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
      .map((r) => r.value);

    return new Response(
      JSON.stringify({ success: true, quotes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
