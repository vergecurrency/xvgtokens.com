import { ChevronDown, Palette } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { WalletConnectTrigger } from "@/components/WalletConnectTrigger";
import type { SiteTheme } from "@/App";
import type { TokenDefinition } from "@/data/tokens";

type SiteHeaderProps = {
  currentPath: string;
  tokens: TokenDefinition[];
  theme: SiteTheme;
  onThemeChange: (theme: SiteTheme) => void;
  onNavigate: (path: string) => void;
};

const themeOptions: Array<{ label: string; value: SiteTheme }> = [
  { label: "Neon Orbit", value: "neon-orbit" },
  { label: "Sunset Grid", value: "sunset-grid" },
  { label: "Classic Arcade", value: "classic-arcade" },
  { label: "Terminal", value: "terminal" },
];

export function SiteHeader({ currentPath, tokens, theme, onThemeChange, onNavigate }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [farmMenuOpen, setFarmMenuOpen] = useState(false);
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const farmMenuRef = useRef<HTMLDivElement | null>(null);
  const chainMenuRef = useRef<HTMLDivElement | null>(null);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const farmMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const chainMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const themeMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const activeToken = tokens.find((token) => `/${token.slug}` === currentPath) ?? null;
  const farmTokens = tokens.filter((token) => token.farmSlug);
  const isPortfolioRoute = currentPath === "/portfolio";
  const isSwapRoute = currentPath === "/swap";
  const isGamesRoute = currentPath === "/games";
  const isUpdatesRoute = currentPath === "/updates";
  const themeLabel = themeOptions.find((option) => option.value === theme)?.label ?? "Neon Orbit";

  function closeAllMenus() {
    setMenuOpen(false);
    setFarmMenuOpen(false);
    setChainMenuOpen(false);
    setThemeMenuOpen(false);
  }

  function toggleFarmMenu() {
    setFarmMenuOpen((open) => {
      const nextOpen = !open;
      setMenuOpen(false);
      setChainMenuOpen(false);
      setThemeMenuOpen(false);
      return nextOpen;
    });
  }

  function toggleChainMenu() {
    setChainMenuOpen((open) => {
      const nextOpen = !open;
      setMenuOpen(false);
      setFarmMenuOpen(false);
      setThemeMenuOpen(false);
      return nextOpen;
    });
  }

  function toggleTokenMenu() {
    setMenuOpen((open) => {
      const nextOpen = !open;
      setFarmMenuOpen(false);
      setChainMenuOpen(false);
      setThemeMenuOpen(false);
      return nextOpen;
    });
  }

  function toggleThemeMenu() {
    setThemeMenuOpen((open) => {
      const nextOpen = !open;
      setMenuOpen(false);
      setFarmMenuOpen(false);
      setChainMenuOpen(false);
      return nextOpen;
    });
  }

  function getPopoverStyle(buttonRef: RefObject<HTMLButtonElement | null>): CSSProperties | undefined {
    if (typeof window === "undefined" || window.innerWidth > 720) {
      return undefined;
    }

    const button = buttonRef.current;
    if (!button) {
      return undefined;
    }

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const gutter = 16;
    const width = Math.min(288, viewportWidth - gutter * 2);
    const left = Math.min(Math.max(rect.right - width, gutter), viewportWidth - width - gutter);

    return {
      position: "fixed",
      top: rect.bottom + 12,
      right: "auto",
      left,
      width,
      maxHeight: "min(70vh, 32rem)",
      zIndex: 90,
    };
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }

      if (!farmMenuRef.current?.contains(event.target as Node)) {
        setFarmMenuOpen(false);
      }

      if (!chainMenuRef.current?.contains(event.target as Node)) {
        setChainMenuOpen(false);
      }

      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [currentPath]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button type="button" className="site-brand" onClick={() => onNavigate("/")}>
          <span className="site-brand__text">xvgtokens.com</span>
        </button>

        <nav className="site-nav">
          <button
            type="button"
            className={`site-nav__link ${currentPath === "/" ? "is-active" : ""}`}
            onClick={() => onNavigate("/")}
          >
            Home
          </button>
          <button
            type="button"
            className={`site-nav__link ${isPortfolioRoute ? "is-active" : ""}`}
            onClick={() => onNavigate("/portfolio")}
          >
            Portfolio
          </button>
          <div className="site-nav__menu" ref={farmMenuRef}>
            <button
              ref={farmMenuButtonRef}
              type="button"
              className={`site-nav__link ${farmMenuOpen ? "is-active" : ""}`}
              onClick={toggleFarmMenu}
            >
              Farm
            </button>
            {farmMenuOpen ? (
              <div className="site-nav__popover" style={getPopoverStyle(farmMenuButtonRef)}>
                {farmTokens.map((token) => (
                  <button
                    key={`farm-${token.slug}`}
                    type="button"
                    className={`site-nav__token ${
                      activeToken?.slug === token.slug ? "is-active" : ""
                    }`}
                    onClick={() => {
                      closeAllMenus();
                      onNavigate(`/${token.slug}`);
                    }}
                  >
                    <img src={token.icon} alt="" className="site-nav__token-icon" />
                    <span>${token.symbol}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={`site-nav__link ${isSwapRoute ? "is-active" : ""}`}
            onClick={() => onNavigate("/swap")}
          >
            Swap
          </button>
          <button
            type="button"
            className={`site-nav__link ${isGamesRoute ? "is-active" : ""}`}
            onClick={() => onNavigate("/games")}
          >
            Games
          </button>
          <div className="site-nav__menu" ref={chainMenuRef}>
            <button
              ref={chainMenuButtonRef}
              type="button"
              className={`site-nav__link ${chainMenuOpen ? "is-active" : ""}`}
              onClick={toggleChainMenu}
            >
              Chains
            </button>
            {chainMenuOpen ? (
              <div className="site-nav__popover" style={getPopoverStyle(chainMenuButtonRef)}>
                {tokens.map((token) => (
                  <button
                    key={`chain-${token.slug}`}
                    type="button"
                    className={`site-nav__token ${
                      activeToken?.slug === token.slug ? "is-active" : ""
                    }`}
                    onClick={() => {
                      closeAllMenus();
                      onNavigate(`/${token.slug}`);
                    }}
                  >
                    <img src={token.icon} alt="" className="site-nav__token-icon" />
                    <span>{token.chainMenuLabel}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="site-nav__menu" ref={menuRef}>
            <button
              ref={menuButtonRef}
              type="button"
              className={`site-nav__link ${menuOpen ? "is-active" : ""}`}
              onClick={toggleTokenMenu}
            >
              Tokens
            </button>
            {menuOpen ? (
              <div className="site-nav__popover" style={getPopoverStyle(menuButtonRef)}>
                <a
                  href="https://xvgeth.xvgtokens.com"
                  target="_blank"
                  rel="noreferrer"
                  className="site-nav__token"
                  onClick={closeAllMenus}
                >
                  <img
                    src="/images/xvgeth.jpg"
                    alt=""
                    className="site-nav__token-icon site-nav__token-icon--round"
                  />
                  <span>$XVGETH</span>
                </a>
                {tokens.map((token) => (
                  <button
                    key={token.slug}
                    type="button"
                    className={`site-nav__token ${
                      activeToken?.slug === token.slug ? "is-active" : ""
                    }`}
                    onClick={() => {
                      closeAllMenus();
                      onNavigate(`/${token.slug}`);
                    }}
                  >
                    <img src={token.icon} alt="" className="site-nav__token-icon" />
                    <span>${token.symbol}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={`site-nav__link ${isUpdatesRoute ? "is-active" : ""}`}
            onClick={() => onNavigate("/updates")}
          >
            Updates
          </button>
          <div className="site-nav__menu" ref={themeMenuRef}>
            <button
              ref={themeMenuButtonRef}
              type="button"
              className={`site-nav__link site-theme-toggle ${themeMenuOpen ? "is-active" : ""}`}
              aria-label={`Theme menu. Current theme: ${themeLabel}.`}
              aria-expanded={themeMenuOpen}
              onClick={toggleThemeMenu}
            >
              <Palette className="site-theme-toggle__icon" aria-hidden="true" />
              <span>{themeLabel}</span>
              <ChevronDown className="site-theme-toggle__chevron" aria-hidden="true" />
            </button>
            {themeMenuOpen ? (
              <div className="site-nav__popover site-theme-menu" style={getPopoverStyle(themeMenuButtonRef)}>
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`site-nav__token site-theme-menu__option ${
                      option.value === theme ? "is-active" : ""
                    }`}
                    onClick={() => {
                      onThemeChange(option.value);
                      closeAllMenus();
                    }}
                  >
                    <span className={`site-theme-menu__swatch site-theme-menu__swatch--${option.value}`} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </nav>
        <div className="site-header__wallet">
          <WalletConnectTrigger />
        </div>
      </div>
    </header>
  );
}
