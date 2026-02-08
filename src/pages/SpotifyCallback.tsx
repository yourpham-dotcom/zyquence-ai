import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (code) {
      // Store code in localStorage so the main window can pick it up
      localStorage.setItem("spotify_callback_code", code);
    }

    if (error) {
      localStorage.setItem("spotify_callback_error", error);
    }

    // Close this tab/redirect back to studio
    // Small delay to ensure localStorage is written
    setTimeout(() => {
      window.close();
      // If window.close() doesn't work (e.g. not opened by script), redirect
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
