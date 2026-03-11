import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, string> = {
  identity: `You are an AI Artist Identity Analyzer for a music creative intelligence platform.
Analyze the creator profile and generate a comprehensive identity analysis. Return ONLY valid JSON with NO markdown formatting, no asterisks, no bold text.
Return JSON with these exact keys:
{
  "archetype": "A 2-3 word artist archetype",
  "brand_personality": "3-4 sentence brand personality description",
  "audience_profile": "3-4 sentence target audience description",
  "stage_name_suggestions": ["name1", "name2", "name3", "name4", "name5"],
  "visual_aesthetic": "3-4 sentence visual direction description",
  "messaging_tone": "2-3 sentence messaging tone description"
}
Do not use any markdown. Plain text only in all values.`,

  sound: `You are an AI Sound Direction Advisor for a music creative intelligence platform.
Analyze the creator profile and generate sound recommendations. Return ONLY valid JSON with NO markdown formatting.
Return JSON with these exact keys:
{
  "genre_scores": {"Hip-Hop": 85, "R&B": 70, "Pop": 55, "Electronic": 40, "Rock": 30, "Jazz": 25},
  "bpm_range": {"min": 80, "max": 140, "sweet_spot": 110},
  "beat_styles": ["style1", "style2", "style3", "style4"],
  "vocal_guidance": "3-4 sentence vocal delivery guidance",
  "flow_ideas": ["idea1", "idea2", "idea3", "idea4"],
  "comparable_artists": ["artist1", "artist2", "artist3"],
  "music_lane_summary": "3-4 sentence summary of their ideal music lane"
}
All genre scores should be 0-100 integers. Plain text only.`,

  sound_audio: `You are an AI Sound Direction Advisor for a music creative intelligence platform.
You have been given an audio file of the user's own music. Analyze the actual audio — its tempo, rhythm, melody, vocal style, energy, production quality, genre elements, and overall feel.
Based on this real analysis, generate sound recommendations. Return ONLY valid JSON with NO markdown formatting.
Return JSON with these exact keys:
{
  "genre_scores": {"Hip-Hop": 85, "R&B": 70, "Pop": 55, "Electronic": 40, "Rock": 30, "Jazz": 25},
  "bpm_range": {"min": 80, "max": 140, "sweet_spot": 110},
  "beat_styles": ["style1", "style2", "style3", "style4"],
  "vocal_guidance": "3-4 sentence vocal delivery guidance based on what you hear",
  "flow_ideas": ["idea1", "idea2", "idea3", "idea4"],
  "comparable_artists": ["artist1", "artist2", "artist3"],
  "music_lane_summary": "3-4 sentence summary of their ideal music lane based on the audio",
  "audio_observations": "3-4 sentences describing what you specifically heard in their track — tempo, key elements, production style, vocal characteristics"
}
All genre scores should be 0-100 integers. Plain text only.`,

  sound_url: `You are an AI Branding & Monetization Advisor for a music creative intelligence platform.
You have been given detailed audio features and metadata from a user's track/artist profile on a streaming platform, plus their creator profile. Analyze everything to provide both sound direction AND actionable branding, cross-platform conversion, and monetization strategies.
Return ONLY valid JSON with NO markdown formatting.
Return JSON with these exact keys:
{
  "genre_scores": {"Hip-Hop": 85, "R&B": 70, "Pop": 55, "Electronic": 40, "Rock": 30, "Jazz": 25},
  "bpm_range": {"min": 80, "max": 140, "sweet_spot": 110},
  "beat_styles": ["style1", "style2", "style3", "style4"],
  "vocal_guidance": "3-4 sentence vocal delivery guidance",
  "comparable_artists": ["artist1", "artist2", "artist3"],
  "music_lane_summary": "3-4 sentence summary of their ideal music lane",
  "audio_observations": "3-4 sentences about the track characteristics",
  "platform_strategy": [
    {"platform": "TikTok", "why": "2 sentences why this platform fits their sound/brand", "content_ideas": ["idea1", "idea2", "idea3"], "conversion_tactic": "1-2 sentences on how to funnel followers to streaming/sales", "posting_frequency": "e.g. 4-5x per week"},
    {"platform": "Instagram", "why": "...", "content_ideas": ["..."], "conversion_tactic": "...", "posting_frequency": "..."},
    {"platform": "YouTube", "why": "...", "content_ideas": ["..."], "conversion_tactic": "...", "posting_frequency": "..."},
    {"platform": "Twitter/X", "why": "...", "content_ideas": ["..."], "conversion_tactic": "...", "posting_frequency": "..."}
  ],
  "monetization_paths": [
    {"channel": "e.g. Merchandise", "description": "2-3 sentences on how to execute this", "revenue_potential": "low/medium/high", "difficulty": "easy/medium/hard", "first_step": "1 sentence actionable first step"},
    {"channel": "e.g. Live Shows", "description": "...", "revenue_potential": "...", "difficulty": "...", "first_step": "..."},
    {"channel": "e.g. Sync Licensing", "description": "...", "revenue_potential": "...", "difficulty": "...", "first_step": "..."},
    {"channel": "e.g. Beat Sales / Features", "description": "...", "revenue_potential": "...", "difficulty": "...", "first_step": "..."}
  ],
  "audience_conversion": {
    "current_strengths": "2-3 sentences on what they can leverage now",
    "funnel_strategy": "3-4 sentences on how to convert casual listeners into superfans",
    "email_sms_play": "2 sentences on building direct audience ownership",
    "collab_opportunities": ["specific collab idea 1", "specific collab idea 2", "specific collab idea 3"]
  },
  "brand_identity": {
    "visual_direction": "2-3 sentences on visual aesthetic that matches their sound",
    "content_pillars": ["pillar1", "pillar2", "pillar3"],
    "brand_voice": "2 sentences describing their ideal online voice/tone",
    "tagline_ideas": ["tagline1", "tagline2", "tagline3"]
  }
}
All genre scores should be 0-100 integers. Generate real, specific, actionable advice tailored to their actual music and profile. Plain text only.`,

  translator: `You are an AI Experience-to-Music Translator for a creative intelligence platform.
Convert the user's personal experiences into music themes and concepts. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "song_topics": [{"title": "topic", "description": "2 sentences"}],
  "hook_concepts": [{"hook": "hook line", "context": "1 sentence"}],
  "emotional_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "storytelling_angles": [{"angle": "angle name", "description": "2 sentences"}]
}
Generate at least 4 items per array. Plain text only.`,

  readiness: `You are an AI Artist Readiness Scorer for a music creative intelligence platform.
Evaluate the creator's readiness across categories. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "overall_score": 72,
  "brand_clarity": 68,
  "voice_potential": 80,
  "consistency": 55,
  "market_positioning": 70,
  "story_authenticity": 85,
  "explanation": "3-4 sentence overall assessment",
  "recommendations": [{"category": "category", "suggestion": "2-3 sentence suggestion"}]
}
All scores 0-100 integers. Generate 4-5 recommendations. Plain text only.`,

  strategy: `You are an AI Strategy Advisor for a music creative intelligence platform.
Create an actionable career strategy. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "content_strategy": [{"action": "action", "details": "2 sentences", "timeline": "timeframe"}],
  "release_roadmap": [{"milestone": "milestone", "description": "1-2 sentences", "timeline": "timeframe"}],
  "brand_positioning": "3-4 sentence brand positioning advice",
  "growth_recommendations": [{"area": "area", "suggestion": "2 sentences"}],
  "next_steps": [{"step": "step", "priority": "high/medium/low"}],
  "priority_actions": [{"action": "action", "impact": "1 sentence"}],
  "long_term_strategy": "3-4 sentence long term vision"
}
Generate 3-5 items per array. Plain text only.`,

  feedback: `You are an AI Music Feedback Coach for a creative intelligence platform.
Analyze the submitted lyrics and provide detailed feedback. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "flow_score": 75,
  "authenticity_score": 80,
  "energy_score": 70,
  "commercial_appeal_score": 65,
  "improvement_suggestions": [{"area": "area", "suggestion": "2-3 sentences"}],
  "strengths": ["strength1", "strength2"],
  "overall_feedback": "3-4 sentence overall assessment"
}
All scores 0-100. Generate 3-5 suggestions. Plain text only.`,

  music_video: `You are an AI Music Video Creative Director for a music creative intelligence platform.
Based on the creator profile and any uploaded media context, generate a complete music video concept with a detailed storyboard. Return ONLY valid JSON with NO markdown formatting.
Return JSON with these exact keys:
{
  "concept_title": "A catchy 3-5 word title for the music video concept",
  "creative_direction": "4-5 sentences describing the overall vision, mood, color palette, and aesthetic",
  "visual_themes": ["theme1", "theme2", "theme3", "theme4"],
  "scenes": [
    {
      "scene_number": 1,
      "timestamp": "0:00 - 0:30",
      "description": "3-4 sentences describing exactly what happens visually",
      "camera_work": "1-2 sentences on camera angles, movements, transitions",
      "lighting_mood": "1 sentence on lighting and color grading",
      "wardrobe_props": "1-2 sentences on outfit and props",
      "ai_clip_prompt": "A detailed 1-2 sentence prompt optimized for AI video generation describing this scene visually — cinematic, specific, vivid"
    }
  ],
  "locations": [{"name": "location name", "vibe": "1 sentence description"}],
  "wardrobe_guide": [{"look": "Look 1", "description": "2 sentences describing outfit, accessories, styling"}],
  "editing_notes": {
    "pace": "1-2 sentences on editing rhythm and cuts",
    "effects": "1-2 sentences on visual effects, color grading, overlays",
    "transitions": "1 sentence on transition styles"
  },
  "reference_artists": ["artist1 - video name", "artist2 - video name", "artist3 - video name"],
  "budget_tier": "low/medium/high",
  "estimated_crew": "1-2 sentences on minimum crew needed"
}
Generate 6-8 scenes. Make it specific to their genre, brand, and personality. Plain text only.`,
};

// Helper: Get Spotify access token via client credentials
async function getSpotifyToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Spotify credentials not configured");

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) throw new Error("Failed to get Spotify token");
  const data = await resp.json();
  return data.access_token;
}

// Helper: Extract Spotify ID and type from URL
function extractSpotifyInfo(url: string): { type: string; id: string } | null {
  const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) return { type: "track", id: trackMatch[1] };
  const artistMatch = url.match(/artist\/([a-zA-Z0-9]+)/);
  if (artistMatch) return { type: "artist", id: artistMatch[1] };
  const albumMatch = url.match(/album\/([a-zA-Z0-9]+)/);
  if (albumMatch) return { type: "album", id: albumMatch[1] };
  return null;
}

// Helper: Fetch Spotify data (supports track, artist, album URLs)
async function fetchSpotifyTrackData(url: string): Promise<string | null> {
  const info = extractSpotifyInfo(url);
  if (!info) throw new Error("Could not parse Spotify URL. Please paste a track, artist, or album link.");

  const token = await getSpotifyToken();
  const headers = { Authorization: `Bearer ${token}` };

  if (info.type === "artist") {
    // Fetch artist info + top tracks
    const [artistResp, topTracksResp] = await Promise.all([
      fetch(`https://api.spotify.com/v1/artists/${info.id}`, { headers }),
      fetch(`https://api.spotify.com/v1/artists/${info.id}/top-tracks?market=US`, { headers }),
    ]);
    if (!artistResp.ok) throw new Error("Failed to fetch Spotify artist info");
    const artist = await artistResp.json();
    const topTracks = topTracksResp.ok ? await topTracksResp.json() : null;

    const result: any = {
      platform: "spotify",
      type: "artist",
      artist_name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers?.total,
      top_tracks: topTracks?.tracks?.slice(0, 5).map((t: any) => ({
        name: t.name,
        popularity: t.popularity,
        duration_ms: t.duration_ms,
        explicit: t.explicit,
        album: t.album?.name,
      })),
    };

    // Fetch audio features for top tracks
    if (topTracks?.tracks?.length) {
      const trackIds = topTracks.tracks.slice(0, 5).map((t: any) => t.id).join(",");
      try {
        const featResp = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, { headers });
        if (featResp.ok) {
          const featData = await featResp.json();
          const features = featData.audio_features?.filter(Boolean);
          if (features?.length) {
            const avg = (key: string) => +(features.reduce((s: number, f: any) => s + (f[key] || 0), 0) / features.length).toFixed(3);
            result.average_audio_features = {
              tempo: avg("tempo"),
              danceability: avg("danceability"),
              energy: avg("energy"),
              valence: avg("valence"),
              acousticness: avg("acousticness"),
              instrumentalness: avg("instrumentalness"),
              speechiness: avg("speechiness"),
              liveness: avg("liveness"),
              loudness: avg("loudness"),
            };
          }
        }
      } catch {}
    }

    return JSON.stringify(result);
  }

  // Default: track
  const trackId = info.id;
  const [trackResp, featuresResp] = await Promise.all([
    fetch(`https://api.spotify.com/v1/tracks/${trackId}`, { headers }),
    fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, { headers }),
  ]);

  if (!trackResp.ok) throw new Error("Failed to fetch Spotify track info");

  const track = await trackResp.json();
  const features = featuresResp.ok ? await featuresResp.json() : null;

  const result: any = {
    platform: "spotify",
    type: "track",
    track_name: track.name,
    artists: track.artists?.map((a: any) => a.name),
    album: track.album?.name,
    release_date: track.album?.release_date,
    popularity: track.popularity,
    duration_ms: track.duration_ms,
    explicit: track.explicit,
  };

  if (features && !features.error) {
    result.audio_features = {
      tempo: features.tempo, key: features.key, mode: features.mode,
      time_signature: features.time_signature, danceability: features.danceability,
      energy: features.energy, valence: features.valence, acousticness: features.acousticness,
      instrumentalness: features.instrumentalness, liveness: features.liveness,
      speechiness: features.speechiness, loudness: features.loudness,
    };
  }

  if (track.artists?.[0]?.id) {
    try {
      const artistResp = await fetch(`https://api.spotify.com/v1/artists/${track.artists[0].id}`, { headers });
      if (artistResp.ok) {
        const artist = await artistResp.json();
        result.artist_genres = artist.genres;
      }
    } catch {}
  }

  return JSON.stringify(result);
}

// Helper: Fetch SoundCloud track data via oEmbed
async function fetchSoundCloudTrackData(url: string): Promise<string | null> {
  const resp = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
  if (!resp.ok) throw new Error("Could not fetch SoundCloud track info. Make sure the URL is public.");
  const data = await resp.json();

  return JSON.stringify({
    platform: "soundcloud",
    title: data.title,
    author_name: data.author_name,
    author_url: data.author_url,
    description: data.description || "",
    note: "SoundCloud does not provide detailed audio features. Analysis is based on metadata and track context. The AI should infer genre, style, and characteristics from the track title, artist name, and description.",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { module, profile, input } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = PROMPTS[module];
    if (!systemPrompt) throw new Error(`Unknown module: ${module}`);

    // Handle audio analysis for sound_audio module
    let audioBase64: string | null = null;
    
    if (module === "sound_audio" && input?.audio_url) {
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const audioResponse = await fetch(input.audio_url, {
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      });
      if (!audioResponse.ok) throw new Error("Failed to download audio file");
      const audioBuffer = await audioResponse.arrayBuffer();
      const bytes = new Uint8Array(audioBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      audioBase64 = btoa(binary);
    }

    // Handle streaming URL analysis
    let streamingData: string | null = null;

    if (module === "sound_url" && input?.url) {
      const { url, platform } = input;

      if (platform === "spotify") {
        streamingData = await fetchSpotifyTrackData(url);
      } else if (platform === "soundcloud") {
        streamingData = await fetchSoundCloudTrackData(url);
      }

      if (!streamingData) throw new Error("Could not fetch track data from the provided URL");
    }

    const userContent = module === "feedback"
      ? `Lyrics to analyze:\n${input}`
      : module === "translator"
      ? `Personal experiences to translate:\n${JSON.stringify(input)}`
      : module === "sound_url"
      ? `Creator Profile:\n${JSON.stringify(profile)}\n\nStreaming Platform Track Data:\n${streamingData}`
      : module === "music_video"
      ? `Creator Profile:\n${JSON.stringify(profile)}\n\nSong Details:\nTitle: ${input?.song_title || "Untitled"}\nMood: ${input?.song_mood || "Not specified"}\nUploaded Files: ${JSON.stringify(input?.uploaded_files || [])}`
      : `Creator Profile:\n${JSON.stringify(profile)}`;

    // Build messages based on whether we have audio
    let messages: any[];
    if (module === "sound_audio" && audioBase64) {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: [
          { type: "text", text: profile ? `Creator Profile:\n${JSON.stringify(profile)}\n\nAnalyze the attached audio file:` : "Analyze the attached audio file:" },
          { type: "input_audio", input_audio: { data: audioBase64, format: "mp3" } },
        ]},
      ];
    } else {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response, handling potential markdown wrapping
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("artist-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
