import { useEffect, useState } from "react";
import { FarmDashboard } from "@/components/FarmDashboard";
import { GamesPage } from "@/components/GamesPage";
import { HomePage } from "@/components/HomePage";
import { PortfolioPage } from "@/components/PortfolioPage";
import { SiteHeader } from "@/components/SiteHeader";
import { SwapPage } from "@/components/SwapPage";
import { TetrisPage } from "@/components/TetrisPage";
import { TokenPage } from "@/components/TokenPage";
import { UpdatesPage } from "@/components/UpdatesPage";
import { FarmProvider } from "@/lib/farm-context";
import { farmConfigs, type FarmSlug } from "@/lib/farms";
import { tokenOrder, tokensBySlug, type TokenSlug } from "@/data/tokens";

export type SiteTheme = "neon-orbit" | "sunset-grid" | "classic-arcade" | "terminal";

const HOME_ROUTE = "/";
const PORTFOLIO_ROUTE = "/portfolio";
const SWAP_ROUTE = "/swap";
const GAMES_ROUTE = "/games";
const UPDATES_ROUTE = "/updates";
const TETRIS_ROUTE = "/games/tetris";
const THEME_STORAGE_KEY = "xvgtokens-theme";

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || HOME_ROUTE;

  if (
    normalized === HOME_ROUTE ||
    normalized === PORTFOLIO_ROUTE ||
    normalized === SWAP_ROUTE ||
    normalized === GAMES_ROUTE ||
    normalized === UPDATES_ROUTE ||
    normalized === TETRIS_ROUTE
  ) {
    return normalized;
  }
  const slug = normalized.replace(/^\/+/, "") as TokenSlug;

  return tokensBySlug[slug] ? `/${slug}` : HOME_ROUTE;
}

function getTokenSlugFromPath(pathname: string): TokenSlug | null {
  if (
    pathname === HOME_ROUTE ||
    pathname === PORTFOLIO_ROUTE ||
    pathname === SWAP_ROUTE ||
    pathname === GAMES_ROUTE ||
    pathname === UPDATES_ROUTE ||
    pathname === TETRIS_ROUTE
  ) {
    return null;
  }

  const slug = pathname.replace(/^\/+/, "") as TokenSlug;
  return tokensBySlug[slug] ? slug : null;
}

function getStoredTheme(): SiteTheme {
  if (typeof window === "undefined") {
    return "neon-orbit";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return storedTheme === "sunset-grid" ||
    storedTheme === "classic-arcade" ||
    storedTheme === "terminal"
    ? storedTheme
    : "neon-orbit";
}

export default function App() {
  const [pathname, setPathname] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectedPath = params.get("__redirect");

    if (redirectedPath) {
      const normalizedRedirect = normalizePath(redirectedPath);
      const nextUrl = `${normalizedRedirect}${window.location.hash}`;

      window.history.replaceState({}, "", nextUrl);
      return normalizedRedirect;
    }

    return normalizePath(window.location.pathname);
  });
  const [theme, setTheme] = useState<SiteTheme>(getStoredTheme);
  const tokens = tokenOrder.map((slug) => tokensBySlug[slug]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const activeTokenSlug = getTokenSlugFromPath(pathname);
    const activeFarmSlug = (activeTokenSlug &&
      (activeTokenSlug === "xvgbase" || activeTokenSlug === "xvgbsc")
      ? activeTokenSlug
      : null) as FarmSlug | null;

    document.documentElement.dataset.farmTheme = activeFarmSlug ?? "home";
    document.body.dataset.farmTheme = activeFarmSlug ?? "home";
    document.documentElement.dataset.view =
      pathname === PORTFOLIO_ROUTE
        ? "portfolio"
        : pathname === SWAP_ROUTE
          ? "swap"
        : pathname === UPDATES_ROUTE
          ? "updates"
        : pathname === GAMES_ROUTE || pathname === TETRIS_ROUTE
          ? "games"
          : activeTokenSlug
            ? "token"
            : "home";
    document.body.dataset.view =
      pathname === PORTFOLIO_ROUTE
        ? "portfolio"
        : pathname === SWAP_ROUTE
          ? "swap"
        : pathname === UPDATES_ROUTE
          ? "updates"
        : pathname === GAMES_ROUTE || pathname === TETRIS_ROUTE
          ? "games"
          : activeTokenSlug
            ? "token"
            : "home";
  }, [pathname]);

  useEffect(() => {
    function syncViewport() {
      const viewportHeight = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        window.setTimeout(syncViewport, 50);
      }
    }

    function handlePopState() {
      setPathname(normalizePath(window.location.pathname));
    }

    syncViewport();
    window.addEventListener("pageshow", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function navigate(nextPath: string) {
    const normalized = normalizePath(nextPath);
    if (normalized === pathname) {
      return;
    }

    window.history.pushState({}, "", normalized);
    setPathname(normalized);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeTokenSlug = getTokenSlugFromPath(pathname);
  const activeToken = activeTokenSlug ? tokensBySlug[activeTokenSlug] : null;
  const activeFarmSlug = activeToken?.farmSlug ?? null;
  const isPortfolioRoute = pathname === PORTFOLIO_ROUTE;
  const isSwapRoute = pathname === SWAP_ROUTE;
  const isUpdatesRoute = pathname === UPDATES_ROUTE;
  const isGamesRoute = pathname === GAMES_ROUTE;
  const isTetrisRoute = pathname === TETRIS_ROUTE;

  return (
    <>
      <SiteHeader
        currentPath={pathname}
        tokens={tokens}
        theme={theme}
        onThemeChange={setTheme}
        onNavigate={navigate}
      />
      {isPortfolioRoute ? (
        <PortfolioPage tokens={tokens} onNavigate={navigate} />
      ) : isSwapRoute ? (
        <SwapPage onNavigate={navigate} />
      ) : isUpdatesRoute ? (
        <UpdatesPage />
      ) : isTetrisRoute ? (
        <TetrisPage onNavigate={navigate} />
      ) : isGamesRoute ? (
        <GamesPage onNavigate={navigate} />
      ) : activeToken ? (
        <TokenPage
          key={activeToken.slug}
          token={activeToken}
          tokens={tokens}
          onNavigate={navigate}
        >
          {activeFarmSlug ? (
            <FarmProvider config={farmConfigs[activeFarmSlug]}>
              <FarmDashboard />
            </FarmProvider>
          ) : null}
        </TokenPage>
      ) : (
        <HomePage
          tokens={tokens}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
