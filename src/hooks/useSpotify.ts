import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SpotifyUser {
  id: string;
  name: string;
  image: string | null;
  product: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  uri: string;
  previewUrl: string | null;
}

interface SpotifyState {
  isConnected: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  searchResults: SpotifyTrack[];
}

const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "user-library-read",
  "user-read-email",
  "user-read-private",
].join(" ");

const REDIRECT_PATH = "/spotify-callback";

export const useSpotify = () => {
  const [state, setState] = useState<SpotifyState>({
    isConnected: false,
    user: null,
    accessToken: null,
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    searchResults: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for stored tokens on mount
  useEffect(() => {
    const stored = localStorage.getItem("spotify_auth");
    if (stored) {
      try {
        const { access_token, refresh_token, user, expires_at } = JSON.parse(stored);
        if (Date.now() < expires_at) {
          setState(prev => ({ ...prev, isConnected: true, user, accessToken: access_token }));
        } else if (refresh_token) {
          refreshToken(refresh_token);
        }
      } catch {
        localStorage.removeItem("spotify_auth");
      }
    }
  }, []);

  // Listen for OAuth callback via postMessage (primary) and localStorage polling (fallback)
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const handleMessage = async (e: MessageEvent) => {
      if (e.data?.type === "spotify_callback" && e.data.code) {
        console.log("Spotify: received code via postMessage");
        if (pollTimer) clearInterval(pollTimer);
        await exchangeCode(e.data.code);
      }
      if (e.data?.type === "spotify_callback_error") {
        console.error("Spotify auth error via postMessage:", e.data.error);
        if (pollTimer) clearInterval(pollTimer);
        setIsLoading(false);
      }
    };
    window.addEventListener("message", handleMessage);

    // Fallback: poll localStorage (in case postMessage doesn't work)
    const checkForCallback = async () => {
      const code = localStorage.getItem("spotify_callback_code");
      if (code) {
        localStorage.removeItem("spotify_callback_code");
        if (pollTimer) clearInterval(pollTimer);
        console.log("Spotify: received code via localStorage poll");
        await exchangeCode(code);
      }
      const error = localStorage.getItem("spotify_callback_error");
      if (error) {
        console.error("Spotify auth error:", error);
        localStorage.removeItem("spotify_callback_error");
        if (pollTimer) clearInterval(pollTimer);
        setIsLoading(false);
      }
    };
    pollTimer = setInterval(checkForCallback, 500);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Poll for currently playing when connected
  useEffect(() => {
    if (state.isConnected && state.accessToken) {
      fetchCurrentlyPlaying();
      pollInterval.current = setInterval(fetchCurrentlyPlaying, 5000);
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [state.isConnected, state.accessToken]);

  const exchangeCode = async (code: string) => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}${REDIRECT_PATH}`;
      const { data, error } = await supabase.functions.invoke("spotify-auth", {
        body: {
          action: "exchange",
          code,
          redirect_uri: redirectUri,
        },
      });

      if (error) throw error;

      const expiresAt = Date.now() + data.expires_in * 1000;
      localStorage.setItem("spotify_auth", JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        expires_at: expiresAt,
      }));

      setState(prev => ({
        ...prev,
        isConnected: true,
        user: data.user,
        accessToken: data.access_token,
      }));
    } catch (err) {
      console.error("Spotify auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("spotify-auth", {
        body: { action: "get_client_id" },
      });

      if (error) throw error;

      const redirectUri = `${window.location.origin}${REDIRECT_PATH}`;
      console.log("Spotify redirect_uri:", redirectUri);
      
      const authUrl = new URL("https://accounts.spotify.com/authorize");
      authUrl.searchParams.set("client_id", data.client_id);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", SPOTIFY_SCOPES);
      authUrl.searchParams.set("show_dialog", "true");

      // Open in a new tab (avoid noopener so window.close works in callback)
      window.open(authUrl.toString(), "_blank");
    } catch (err) {
      console.error("Spotify connect error:", err);
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("spotify_auth");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState({
      isConnected: false,
      user: null,
      accessToken: null,
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      searchResults: [],
    });
  }, []);

  const refreshToken = async (refreshTkn: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("spotify-auth", {
        body: { action: "refresh", refresh_token: refreshTkn },
      });
      if (error) throw error;

      const stored = JSON.parse(localStorage.getItem("spotify_auth") || "{}");
      const expiresAt = Date.now() + data.expires_in * 1000;
      localStorage.setItem("spotify_auth", JSON.stringify({
        ...stored,
        access_token: data.access_token,
        expires_at: expiresAt,
      }));

      setState(prev => ({ ...prev, accessToken: data.access_token, isConnected: true, user: stored.user }));
    } catch {
      disconnect();
    }
  };

  const fetchCurrentlyPlaying = useCallback(async () => {
    if (!state.accessToken) return;
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      if (res.status === 204 || res.status === 401) return;
      if (!res.ok) return;

      const data = await res.json();
      if (data?.item) {
        setState(prev => ({
          ...prev,
          currentTrack: {
            id: data.item.id,
            name: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(", "),
            album: data.item.album.name,
            albumArt: data.item.album.images?.[0]?.url || "",
            duration: data.item.duration_ms,
            uri: data.item.uri,
            previewUrl: data.item.preview_url,
          },
          isPlaying: data.is_playing,
          progress: data.progress_ms || 0,
          duration: data.item.duration_ms,
        }));
      }
    } catch {
      // Silently fail polling
    }
  }, [state.accessToken]);

  const search = useCallback(async (query: string) => {
    if (!state.accessToken || !query.trim()) {
      setState(prev => ({ ...prev, searchResults: [] }));
      return;
    }
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        { headers: { Authorization: `Bearer ${state.accessToken}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const tracks: SpotifyTrack[] = data.tracks.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists.map((a: any) => a.name).join(", "),
        album: item.album.name,
        albumArt: item.album.images?.[1]?.url || item.album.images?.[0]?.url || "",
        duration: item.duration_ms,
        uri: item.uri,
        previewUrl: item.preview_url,
      }));
      setState(prev => ({ ...prev, searchResults: tracks }));
    } catch {
      // Silently fail
    }
  }, [state.accessToken]);

  const playTrack = useCallback(async (track: SpotifyTrack) => {
    if (!state.accessToken) return;

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });

      if (res.ok || res.status === 204) {
        setState(prev => ({ ...prev, currentTrack: track, isPlaying: true }));
        return;
      }
    } catch {
      // Fall through to preview
    }

    // Fallback: play 30s preview
    if (track.previewUrl) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(track.previewUrl);
      audioRef.current.volume = 0.7;
      audioRef.current.play();
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };
      setState(prev => ({ ...prev, currentTrack: track, isPlaying: true }));
    }
  }, [state.accessToken]);

  const togglePlay = useCallback(async () => {
    if (!state.accessToken) return;

    try {
      const endpoint = state.isPlaying
        ? "https://api.spotify.com/v1/me/player/pause"
        : "https://api.spotify.com/v1/me/player/play";
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      if (res.ok || res.status === 204) {
        setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
        return;
      }
    } catch {
      // Fallback to audio element
    }

    if (audioRef.current) {
      if (state.isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [state.accessToken, state.isPlaying]);

  const skipNext = useCallback(async () => {
    if (!state.accessToken) return;
    try {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      setTimeout(fetchCurrentlyPlaying, 500);
    } catch { /* ignore */ }
  }, [state.accessToken, fetchCurrentlyPlaying]);

  const skipPrev = useCallback(async () => {
    if (!state.accessToken) return;
    try {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      setTimeout(fetchCurrentlyPlaying, 500);
    } catch { /* ignore */ }
  }, [state.accessToken, fetchCurrentlyPlaying]);

  return {
    ...state,
    isLoading,
    connect,
    disconnect,
    search,
    playTrack,
    togglePlay,
    skipNext,
    skipPrev,
  };
};
