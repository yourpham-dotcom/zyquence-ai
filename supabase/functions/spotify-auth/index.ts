import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirect_uri, refresh_token } = await req.json();
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Spotify credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    if (action === 'get_client_id') {
      return new Response(
        JSON.stringify({ client_id: clientId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchange') {
      // Exchange authorization code for tokens
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        console.error('Spotify token exchange error:', tokenData);
        return new Response(
          JSON.stringify({ error: tokenData.error_description || 'Token exchange failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user profile
      const profileRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();

      return new Response(
        JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          user: {
            id: profile.id,
            name: profile.display_name,
            image: profile.images?.[0]?.url || null,
            product: profile.product, // "premium" or "free"
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'refresh') {
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        return new Response(
          JSON.stringify({ error: tokenData.error_description || 'Token refresh failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'search') {
      const { query, token } = await req.json().catch(() => ({ query: '', token: '' }));
      // Re-parse since we already consumed the body
      return new Response(
        JSON.stringify({ error: 'Use client-side search with access token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Spotify auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
