import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const OAUTH_RELOAD_KEY = "oauth-hard-reload-attempted";

const NotFound = () => {
  const location = useLocation();
  const isOAuthRoute = location.pathname.startsWith("/~oauth");
  const oauthUrl = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isOAuthRoute) {
      const previousAttempt = sessionStorage.getItem(OAUTH_RELOAD_KEY);

      if (previousAttempt !== oauthUrl) {
        sessionStorage.setItem(OAUTH_RELOAD_KEY, oauthUrl);
        window.location.assign(oauthUrl);
        return;
      }

      sessionStorage.removeItem(OAUTH_RELOAD_KEY);
      window.location.replace("/auth?oauth=retry");
      return;
    }

    sessionStorage.removeItem(OAUTH_RELOAD_KEY);
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [isOAuthRoute, oauthUrl, location.pathname]);

  if (isOAuthRoute) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

