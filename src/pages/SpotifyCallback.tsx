import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (code) {
      // Primary: postMessage to opener (works across storage partitions)
      if (window.opener) {
        window.opener.postMessage({ type: "spotify_callback", code }, "*");
      }
      // Fallback: localStorage (works if same storage partition)
      try { localStorage.setItem("spotify_callback_code", code); } catch {}
    }

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: "spotify_callback_error", error }, "*");
      }
      try { localStorage.setItem("spotify_callback_error", error); } catch {}
    }

    // Close this tab/redirect back
    setTimeout(() => {
      window.close();
      navigate("/studio");
    }, 500);
  }, [searchParams, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-foreground font-medium">Connecting to Spotify...</p>
        <p className="text-sm text-muted-foreground">This window will close automatically.</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
