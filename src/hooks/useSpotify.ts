import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SpotifyUser {
  id: string;
  name: string;
  image: string | null;
  product: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  uri: string;
  previewUrl: string | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  image: string | null;
  trackCount: number;
  uri: string;
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
  playlists: SpotifyPlaylist[];
  playlistTracks: SpotifyTrack[];
  activePlaylistId: string | null;
  deviceId: string | null;
  sdkReady: boolean;
}

const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "user-library-read",
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
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
    playlists: [],
    playlistTracks: [],
    activePlaylistId: null,
    deviceId: null,
    sdkReady: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<any>(null);
  const sdkScriptLoaded = useRef(false);

  // Load the Spotify Web Playback SDK script
  const loadSDKScript = useCallback(() => {
    if (sdkScriptLoaded.current || document.getElementById("spotify-sdk-script")) return;
    sdkScriptLoaded.current = true;
    const script = document.createElement("script");
    script.id = "spotify-sdk-script";
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Initialize the Web Playback SDK player
  const initializePlayer = useCallback((token: string) => {
    if (playerRef.current) return;

    const initPlayer = () => {
      const player = new (window as any).Spotify.Player({
        name: "Zyquence Studio",
        getOAuthToken: (cb: (token: string) => void) => {
          // Always use the latest token
          const stored = localStorage.getItem("spotify_auth");
          if (stored) {
            try {
              const { access_token } = JSON.parse(stored);
              cb(access_token);
            } catch {
              cb(token);
            }
          } else {
            cb(token);
          }
        },
        volume: 0.7,
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Spotify SDK: Ready with device ID", device_id);
        setState(prev => ({ ...prev, deviceId: device_id, sdkReady: true }));
      });

      player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("Spotify SDK: Device went offline", device_id);
        setState(prev => ({ ...prev, sdkReady: false }));
      });

      player.addListener("player_state_changed", (sdkState: any) => {
        if (!sdkState) return;
        const track = sdkState.track_window?.current_track;
        if (track) {
          setState(prev => ({
            ...prev,
            currentTrack: {
              id: track.id,
              name: track.name,
              artist: track.artists.map((a: any) => a.name).join(", "),
              album: track.album.name,
              albumArt: track.album.images?.[0]?.url || "",
              duration: track.duration_ms,
              uri: track.uri,
              previewUrl: null,
            },
            isPlaying: !sdkState.paused,
            progress: sdkState.position,
            duration: track.duration_ms,
          }));
        }
      });

      player.addListener("initialization_error", ({ message }: { message: string }) => {
        console.error("Spotify SDK init error:", message);
      });

      player.addListener("authentication_error", ({ message }: { message: string }) => {
        console.error("Spotify SDK auth error:", message);
      });

      player.addListener("account_error", ({ message }: { message: string }) => {
        console.error("Spotify SDK account error:", message);
      });

      player.connect().then((success: boolean) => {
        if (success) {
          console.log("Spotify SDK: Connected successfully");
        }
      });

      playerRef.current = player;
    };

    if ((window as any).Spotify) {
      initPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = initPlayer;
    }
  }, []);

  // Check for stored tokens on mount
  useEffect(() => {
    const stored = localStorage.getItem("spotify_auth");
    if (stored) {
      try {
        const { access_token, refresh_token, user, expires_at } = JSON.parse(stored);
        if (Date.now() < expires_at) {
          setState(prev => ({ ...prev, isConnected: true, user, accessToken: access_token }));
          loadSDKScript();
          initializePlayer(access_token);
        } else if (refresh_token) {
          refreshToken(refresh_token);
        }
      } catch {
        localStorage.removeItem("spotify_auth");
      }
    }
  }, []);

  // Listen for OAuth callback
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

    const checkForCallback = async () => {
      const code = localStorage.getItem("spotify_callback_code");
      if (code) {
        localStorage.removeItem("spotify_callback_code");
        if (pollTimer) clearInterval(pollTimer);
        await exchangeCode(code);
      }
      const error = localStorage.getItem("spotify_callback_error");
      if (error) {
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

  // Poll progress when playing
  useEffect(() => {
    if (state.isPlaying && playerRef.current) {
      pollInterval.current = setInterval(async () => {
        const sdkState = await playerRef.current?.getCurrentState();
        if (sdkState) {
          setState(prev => ({ ...prev, progress: sdkState.position }));
        }
      }, 1000);
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [state.isPlaying]);

  // Fetch playlists when connected
  useEffect(() => {
    if (state.isConnected && state.accessToken) {
      fetchPlaylists();
    }
  }, [state.isConnected, state.accessToken]);

  const exchangeCode = async (code: string) => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}${REDIRECT_PATH}`;
      const { data, error } = await supabase.functions.invoke("spotify-auth", {
        body: { action: "exchange", code, redirect_uri: redirectUri },
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

      loadSDKScript();
      initializePlayer(data.access_token);
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
      const authUrl = new URL("https://accounts.spotify.com/authorize");
      authUrl.searchParams.set("client_id", data.client_id);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", SPOTIFY_SCOPES);
      authUrl.searchParams.set("show_dialog", "true");

      window.open(authUrl.toString(), "_blank");
    } catch (err) {
      console.error("Spotify connect error:", err);
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("spotify_auth");
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
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
      playlists: [],
      playlistTracks: [],
      activePlaylistId: null,
      deviceId: null,
      sdkReady: false,
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
      loadSDKScript();
      initializePlayer(data.access_token);
    } catch {
      disconnect();
    }
  };

  const fetchPlaylists = useCallback(async () => {
    if (!state.accessToken) return;
    try {
      const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const playlists: SpotifyPlaylist[] = data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.images?.[0]?.url || null,
        trackCount: item.tracks?.total || 0,
        uri: item.uri,
      }));
      setState(prev => ({ ...prev, playlists }));
    } catch {
      // Silently fail
    }
  }, [state.accessToken]);

  const fetchPlaylistTracks = useCallback(async (playlistId: string) => {
    if (!state.accessToken) return;
    setState(prev => ({ ...prev, activePlaylistId: playlistId, playlistTracks: [] }));
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
        { headers: { Authorization: `Bearer ${state.accessToken}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const tracks: SpotifyTrack[] = data.items
        .filter((item: any) => item.track)
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists.map((a: any) => a.name).join(", "),
          album: item.track.album.name,
          albumArt: item.track.album.images?.[1]?.url || item.track.album.images?.[0]?.url || "",
          duration: item.track.duration_ms,
          uri: item.track.uri,
          previewUrl: item.track.preview_url,
        }));
      setState(prev => ({ ...prev, playlistTracks: tracks }));
    } catch {
      // Silently fail
    }
  }, [state.accessToken]);

  const search = useCallback(async (query: string) => {
    if (!state.accessToken || !query.trim()) {
      setState(prev => ({ ...prev, searchResults: [] }));
      return;
    }
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
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

    // If we have an SDK device, use it
    if (state.deviceId) {
      try {
        const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${state.deviceId}`, {
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
        console.error("Failed to play via SDK device");
      }
    }

    // Fallback: try without device_id
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
      // Fall through
    }
  }, [state.accessToken, state.deviceId]);

  const playPlaylist = useCallback(async (playlistUri: string, offset = 0) => {
    if (!state.accessToken) return;
    const deviceParam = state.deviceId ? `?device_id=${state.deviceId}` : "";
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/play${deviceParam}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context_uri: playlistUri, offset: { position: offset } }),
      });
      if (res.ok || res.status === 204) {
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch {
      // Silently fail
    }
  }, [state.accessToken, state.deviceId]);

  const togglePlay = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.togglePlay();
      return;
    }

    if (!state.accessToken) return;
    try {
      const deviceParam = state.deviceId ? `?device_id=${state.deviceId}` : "";
      const endpoint = state.isPlaying
        ? `https://api.spotify.com/v1/me/player/pause${deviceParam}`
        : `https://api.spotify.com/v1/me/player/play${deviceParam}`;
      await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    } catch {
      // Silently fail
    }
  }, [state.accessToken, state.isPlaying, state.deviceId]);

  const skipNext = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.nextTrack();
      return;
    }
    if (!state.accessToken) return;
    try {
      const deviceParam = state.deviceId ? `?device_id=${state.deviceId}` : "";
      await fetch(`https://api.spotify.com/v1/me/player/next${deviceParam}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    } catch { /* ignore */ }
  }, [state.accessToken, state.deviceId]);

  const skipPrev = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.previousTrack();
      return;
    }
    if (!state.accessToken) return;
    try {
      const deviceParam = state.deviceId ? `?device_id=${state.deviceId}` : "";
      await fetch(`https://api.spotify.com/v1/me/player/previous${deviceParam}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    } catch { /* ignore */ }
  }, [state.accessToken, state.deviceId]);

  const seek = useCallback(async (positionMs: number) => {
    if (playerRef.current) {
      await playerRef.current.seek(positionMs);
      setState(prev => ({ ...prev, progress: positionMs }));
      return;
    }
    if (!state.accessToken) return;
    try {
      await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
      setState(prev => ({ ...prev, progress: positionMs }));
    } catch { /* ignore */ }
  }, [state.accessToken]);

  const setVolume = useCallback(async (volumePercent: number) => {
    if (playerRef.current) {
      await playerRef.current.setVolume(volumePercent / 100);
      return;
    }
    if (!state.accessToken) return;
    try {
      await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.round(volumePercent)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    } catch { /* ignore */ }
  }, [state.accessToken]);

  return {
    ...state,
    isLoading,
    connect,
    disconnect,
    search,
    playTrack,
    playPlaylist,
    togglePlay,
    skipNext,
    skipPrev,
    seek,
    setVolume,
    fetchPlaylists,
    fetchPlaylistTracks,
  };
};
