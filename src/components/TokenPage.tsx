import { Activity, Check, ChevronLeft, Copy, ExternalLink, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { socials, type TokenDefinition } from "@/data/tokens";
import { SwapWidget } from "@/components/SwapWidget";
import { getAssetsForChain, getDefaultSellAsset } from "@/lib/swap";

type TokenPageProps = {
  token: TokenDefinition;
  tokens: TokenDefinition[];
  onNavigate: (path: string) => void;
  children?: ReactNode;
};

type MarketChartPoint = {
  timestamp: number;
  price: number;
};

type MarketChartState = {
  points: MarketChartPoint[];
  loading: boolean;
  error: string | null;
};

type MarketStatsState = {
  stats: MarketStats | null;
  loading: boolean;
  error: string | null;
};

type MarketStats = {
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange24hPercent: number | null;
  fdvUsd: number | null;
  marketCapUsd: number | null;
  pairLabel: string | null;
  poolName: string | null;
  transactions24h: number | null;
};

type GeckoTerminalPool = {
  network: string;
  poolAddress: string;
};

type CachedMarketChart = {
  cachedAt: number;
  points: MarketChartPoint[];
  source: "coingecko" | "geckoterminal";
};

const TOKEN_BALANCE_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

const chartWidth = 720;
const chartHeight = 260;
const chartPadding = 18;
const marketChartCacheTtlMs = 10 * 60 * 1000;
const marketStatsCacheTtlMs = 5 * 60 * 1000;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 6,
    maximumFractionDigits: value >= 1 ? 2 : 8,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(value) >= 100_000 ? "compact" : "standard",
    minimumFractionDigits: value >= 1 ? 2 : 6,
    maximumFractionDigits: value >= 1 ? 2 : 8,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 100_000 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseFiniteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatAxisPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 0.01 ? 2 : 6,
    maximumFractionDigits: value >= 0.01 ? 4 : 8,
  }).format(value);
}

function formatChartDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function formatTokenBalance(value: bigint) {
  const formatted = Number.parseFloat(formatUnits(value, 18));

  if (!Number.isFinite(formatted) || formatted <= 0) {
    return "0.00";
  }

  if (formatted >= 1000) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(formatted);
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(formatted);
}

function getCoinGeckoCoinId(token: TokenDefinition) {
  const marketLink = token.links.find(
    (link) => link.kind === "market" && link.label === "CoinGecko" && link.href.includes("/coins/"),
  );

  if (!marketLink) {
    return null;
  }

  const match = marketLink.href.match(/\/coins\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function getGeckoTerminalPool(token: TokenDefinition): GeckoTerminalPool | null {
  const geckoTerminalLink = token.links.find(
    (link) => link.href.includes("geckoterminal.com/") && link.href.includes("/pools/"),
  );

  if (!geckoTerminalLink) {
    return null;
  }

  const match = geckoTerminalLink.href.match(/geckoterminal\.com\/([^/?#]+)\/pools\/(0x[a-fA-F0-9]{40,})/i);

  if (!match) {
    return null;
  }

  return {
    network: match[1],
    poolAddress: match[2].toLowerCase(),
  };
}

function buildChartPath(points: MarketChartPoint[]) {
  if (points.length === 0) {
    return { linePath: "", areaPath: "", minPrice: 0, maxPrice: 0 };
  }

  const prices = points.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSpan = Math.max(maxPrice - minPrice, maxPrice * 0.02, 1e-9);
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  const coordinates = points.map((point, index) => {
    const x =
      chartPadding + (points.length === 1 ? usableWidth / 2 : (index / (points.length - 1)) * usableWidth);
    const y =
      chartPadding + (1 - (point.price - minPrice) / priceSpan) * usableHeight;

    return { x, y };
  });

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];
  const baseline = chartHeight - chartPadding;
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(2)} ${baseline} L ${firstPoint.x.toFixed(2)} ${baseline} Z`;

  return { linePath, areaPath, minPrice, maxPrice };
}

function getMarketChartCacheKey(token: TokenDefinition) {
  return `token-market-chart:${token.slug}`;
}

function getMarketStatsCacheKey(token: TokenDefinition) {
  return `token-market-stats:${token.slug}`;
}

function readCachedMarketStats(token: TokenDefinition) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getMarketStatsCacheKey(token));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { cachedAt?: number; stats?: MarketStats };

    if (
      !Number.isFinite(parsed.cachedAt) ||
      Date.now() - Number(parsed.cachedAt) > marketStatsCacheTtlMs ||
      !parsed.stats
    ) {
      return null;
    }

    return parsed.stats;
  } catch {
    return null;
  }
}

function writeCachedMarketStats(token: TokenDefinition, stats: MarketStats) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getMarketStatsCacheKey(token),
      JSON.stringify({
        cachedAt: Date.now(),
        stats,
      }),
    );
  } catch {
    // Ignore storage failures. The stats can still render from the live response.
  }
}

function readCachedMarketChart(token: TokenDefinition, source: CachedMarketChart["source"]) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getMarketChartCacheKey(token));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedMarketChart;

    if (
      parsed.source !== source ||
      !Array.isArray(parsed.points) ||
      !Number.isFinite(parsed.cachedAt) ||
      Date.now() - parsed.cachedAt > marketChartCacheTtlMs
    ) {
      return null;
    }

    const points = parsed.points.filter(
      (point) => point && Number.isFinite(point.timestamp) && Number.isFinite(point.price),
    );

    return points.length ? points : null;
  } catch {
    return null;
  }
}

function writeCachedMarketChart(
  token: TokenDefinition,
  source: CachedMarketChart["source"],
  points: MarketChartPoint[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: CachedMarketChart = {
      cachedAt: Date.now(),
      points,
      source,
    };

    window.sessionStorage.setItem(getMarketChartCacheKey(token), JSON.stringify(payload));
  } catch {
    // Ignore storage failures. The chart can still render from the live response.
  }
}

async function addTokenToWallet(token: TokenDefinition) {
  const wallet = (window as Window & {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }).ethereum as
    | { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    | undefined;

  if (!wallet) {
    window.alert("MetaMask or another EVM wallet was not detected in this browser.");
    return;
  }

  try {
    await wallet.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: token.wallet.chainId,
          chainName: token.wallet.networkName,
          rpcUrls: [token.wallet.rpcUrl],
          nativeCurrency: {
            name: token.wallet.nativeSymbol,
            symbol: token.wallet.nativeSymbol,
            decimals: 18,
          },
          blockExplorerUrls: [token.wallet.explorerUrl],
        },
      ],
    });
  } catch (error) {
    console.error(`Failed adding ${token.symbol} network`, error);
  }

  try {
    await wallet.request({
      method: "wallet_watchAsset",
      params: [
        {
          type: "ERC20",
          options: {
            address: token.contractAddress,
            symbol: token.symbol,
            decimals: 18,
            image: `${window.location.origin}${token.icon}`,
          },
        },
      ],
    });
  } catch (error) {
    console.error(`Failed adding ${token.symbol} token`, error);
  }
}

export function TokenPage({ token, tokens, onNavigate, children }: TokenPageProps) {
  const { address, chain, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const currentIndex = tokens.findIndex((item) => item.slug === token.slug);
  const previousToken = currentIndex > 0 ? tokens[currentIndex - 1] : null;
  const nextToken = currentIndex < tokens.length - 1 ? tokens[currentIndex + 1] : null;
  const targetChainId = Number.parseInt(token.wallet.chainId, 16);
  const wrongTokenChain = Boolean(chain && chain.id !== targetChainId);
  const autoSwitchAttemptRef = useRef<string | null>(null);
  const [contractCopied, setContractCopied] = useState(false);
  const [spotPriceUsd, setSpotPriceUsd] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const geckoTerminalPool = getGeckoTerminalPool(token);
  const geckoTerminalNetwork = geckoTerminalPool?.network ?? null;
  const geckoTerminalPoolAddress = geckoTerminalPool?.poolAddress ?? null;
  const swapChainAssets = getAssetsForChain(targetChainId);
  const swapSellAsset = getDefaultSellAsset(targetChainId);
  const hasMiniSwap = Boolean(swapSellAsset && swapSellAsset.tokenSlug === token.slug && swapChainAssets.length > 1);
  const hasMarketChart = Boolean(token.marketChartId || geckoTerminalPoolAddress);
  const chartSourceName = token.marketChartId ? "CoinGecko" : geckoTerminalPoolAddress ? "GeckoTerminal" : "Market";
  const [marketChart, setMarketChart] = useState<MarketChartState>({
    points: [],
    loading: hasMarketChart,
    error: null,
  });
  const [marketStats, setMarketStats] = useState<MarketStatsState>({
    stats: null,
    loading: Boolean(geckoTerminalPoolAddress),
    error: null,
  });

  useEffect(() => {
    async function handleSwitchChain() {
      if (!switchChainAsync) {
        return;
      }

      try {
        await switchChainAsync({ chainId: targetChainId });
      } catch (error) {
        console.error(`Failed to switch wallet to ${token.chainName}.`, error);
      }
    }

    if (!isConnected || !wrongTokenChain || !chain?.id) {
      autoSwitchAttemptRef.current = null;
      return;
    }

    const switchAttemptKey = `${chain.id}:${targetChainId}`;

    if (autoSwitchAttemptRef.current === switchAttemptKey) {
      return;
    }

    autoSwitchAttemptRef.current = switchAttemptKey;
    void handleSwitchChain();
  }, [chain?.id, isConnected, switchChainAsync, targetChainId, token.chainName, wrongTokenChain]);

  useEffect(() => {
    if (!address || wrongTokenChain) {
      setTokenBalance(null);
      setIsBalanceLoading(false);
      return;
    }

    const account = address;
    const client = createPublicClient({
      transport: http(token.wallet.rpcUrl, {
        timeout: 12_000,
      }),
      batch: {
        multicall: false,
      },
    });
    let cancelled = false;

    async function loadTokenBalance() {
      setIsBalanceLoading(true);

      try {
        const balance = await client.readContract({
          abi: TOKEN_BALANCE_ABI,
          address: token.contractAddress as `0x${string}`,
          functionName: "balanceOf",
          args: [account],
        });

        if (!cancelled) {
          setTokenBalance(typeof balance === "bigint" ? balance : 0n);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(`Failed loading ${token.symbol} wallet balance`, error);
          setTokenBalance(null);
        }
      } finally {
        if (!cancelled) {
          setIsBalanceLoading(false);
        }
      }
    }

    void loadTokenBalance();

    return () => {
      cancelled = true;
    };
  }, [address, token.contractAddress, token.symbol, token.wallet.rpcUrl, wrongTokenChain]);

  useEffect(() => {
    const nextCoinId = getCoinGeckoCoinId(token);

    if (!nextCoinId) {
      setSpotPriceUsd(null);
      return;
    }

    const coinId = nextCoinId;

    const controller = new AbortController();

    async function loadSpotPrice() {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${encodeURIComponent(coinId)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`CoinGecko request failed with ${response.status}`);
        }

        const payload = (await response.json()) as Record<string, { usd?: number }>;
        const nextPrice = payload[coinId]?.usd;
        setSpotPriceUsd(typeof nextPrice === "number" ? nextPrice : null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(`Failed loading ${token.symbol} spot price`, error);
        setSpotPriceUsd(null);
      }
    }

    void loadSpotPrice();

    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!token.marketChartId && !geckoTerminalNetwork && !geckoTerminalPoolAddress) {
      setMarketChart({ points: [], loading: false, error: null });
      return;
    }

    const controller = new AbortController();

    async function loadMarketChart() {
      setMarketChart((current) => ({ ...current, loading: true, error: null }));

      try {
        let points: MarketChartPoint[] = [];

        if (token.marketChartId) {
          const cachedPoints = readCachedMarketChart(token, "coingecko");

          if (cachedPoints) {
            setMarketChart({
              points: cachedPoints,
              loading: false,
              error: null,
            });
            return;
          }

          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${token.marketChartId}/market_chart?vs_currency=usd&days=30`,
            { signal: controller.signal },
          );

          if (!response.ok) {
            throw new Error(`CoinGecko request failed with ${response.status}`);
          }

          const payload = (await response.json()) as {
            prices?: Array<[number, number]>;
          };

          points = (payload.prices ?? [])
            .filter((entry): entry is [number, number] => Array.isArray(entry) && entry.length === 2)
            .map(([timestamp, price]) => ({ timestamp, price }))
            .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(point.price));

          if (points.length) {
            writeCachedMarketChart(token, "coingecko", points);
          }
        } else if (geckoTerminalNetwork && geckoTerminalPoolAddress) {
          const cachedPoints = readCachedMarketChart(token, "geckoterminal");

          if (cachedPoints) {
            setMarketChart({
              points: cachedPoints,
              loading: false,
              error: null,
            });
            return;
          }

          const response = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/${geckoTerminalNetwork}/pools/${geckoTerminalPoolAddress}/ohlcv/day?aggregate=1&limit=30&currency=usd&token=${encodeURIComponent(token.contractAddress.toLowerCase())}`,
            { signal: controller.signal },
          );

          if (!response.ok) {
            throw new Error(`GeckoTerminal request failed with ${response.status}`);
          }

          const payload = (await response.json()) as {
            data?: {
              attributes?: {
                ohlcv_list?: Array<[number, number, number, number, number, number]>;
              };
            };
          };

          points = (payload.data?.attributes?.ohlcv_list ?? [])
            .filter(
              (entry): entry is [number, number, number, number, number, number] =>
                Array.isArray(entry) && entry.length >= 5,
            )
            .map(([timestamp, _open, _high, _low, close]) => ({
              timestamp: timestamp * 1000,
              price: close,
            }))
            .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(point.price))
            .reverse();

          if (points.length) {
            writeCachedMarketChart(token, "geckoterminal", points);
          }
        }

        setMarketChart({
          points,
          loading: false,
          error: points.length ? null : "No chart data available right now.",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(`Failed loading ${token.symbol} market chart`, error);
        setMarketChart({
          points: [],
          loading: false,
          error: "Chart data is temporarily unavailable.",
        });
      }
    }

    void loadMarketChart();

    return () => controller.abort();
  }, [geckoTerminalNetwork, geckoTerminalPoolAddress, token.contractAddress, token.marketChartId, token.slug, token.symbol]);

  useEffect(() => {
    if (!geckoTerminalNetwork || !geckoTerminalPoolAddress) {
      setMarketStats({ stats: null, loading: false, error: null });
      return;
    }

    const cachedStats = readCachedMarketStats(token);

    if (cachedStats) {
      setMarketStats({ stats: cachedStats, loading: false, error: null });
      return;
    }

    const controller = new AbortController();

    async function loadMarketStats() {
      setMarketStats((current) => ({ ...current, loading: true, error: null }));

      try {
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${geckoTerminalNetwork}/pools/${geckoTerminalPoolAddress}?include=base_token,quote_token`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`GeckoTerminal stats request failed with ${response.status}`);
        }

        const payload = (await response.json()) as {
          data?: {
            attributes?: {
              name?: string;
              base_token_price_usd?: string;
              quote_token_price_usd?: string;
              reserve_in_usd?: string;
              fdv_usd?: string;
              market_cap_usd?: string;
              volume_usd?: { h24?: string };
              price_change_percentage?: { h24?: string };
              transactions?: { h24?: { buys?: number; sells?: number } };
            };
            relationships?: {
              base_token?: { data?: { id?: string } };
              quote_token?: { data?: { id?: string } };
            };
          };
          included?: Array<{
            id?: string;
            attributes?: {
              symbol?: string;
            };
          }>;
        };

        const attributes = payload.data?.attributes;
        const tokenAddress = token.contractAddress.toLowerCase();
        const baseTokenId = payload.data?.relationships?.base_token?.data?.id?.toLowerCase() ?? "";
        const quoteTokenId = payload.data?.relationships?.quote_token?.data?.id?.toLowerCase() ?? "";
        const baseToken = payload.included?.find((item) => item.id?.toLowerCase() === baseTokenId);
        const quoteToken = payload.included?.find((item) => item.id?.toLowerCase() === quoteTokenId);
        const baseSymbol = baseToken?.attributes?.symbol?.toUpperCase();
        const quoteSymbol = quoteToken?.attributes?.symbol?.toUpperCase();
        const transactions24h =
          typeof attributes?.transactions?.h24?.buys === "number" &&
          typeof attributes.transactions.h24.sells === "number"
            ? attributes.transactions.h24.buys + attributes.transactions.h24.sells
            : null;
        const stats: MarketStats = {
          priceUsd: baseTokenId.includes(tokenAddress)
            ? parseFiniteNumber(attributes?.base_token_price_usd)
            : quoteTokenId.includes(tokenAddress)
              ? parseFiniteNumber(attributes?.quote_token_price_usd)
              : null,
          liquidityUsd: parseFiniteNumber(attributes?.reserve_in_usd),
          volume24hUsd: parseFiniteNumber(attributes?.volume_usd?.h24),
          priceChange24hPercent: parseFiniteNumber(attributes?.price_change_percentage?.h24),
          fdvUsd: parseFiniteNumber(attributes?.fdv_usd),
          marketCapUsd: parseFiniteNumber(attributes?.market_cap_usd),
          pairLabel: baseSymbol && quoteSymbol ? `${baseSymbol} / ${quoteSymbol}` : null,
          poolName: attributes?.name ?? null,
          transactions24h,
        };

        writeCachedMarketStats(token, stats);
        setMarketStats({ stats, loading: false, error: null });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(`Failed loading ${token.symbol} market stats`, error);
        setMarketStats({
          stats: null,
          loading: false,
          error: "Market stats are temporarily unavailable.",
        });
      }
    }

    void loadMarketStats();

    return () => controller.abort();
  }, [geckoTerminalNetwork, geckoTerminalPoolAddress, token]);

  const chartPoints = marketChart.points;
  const firstPoint = chartPoints[0];
  const lastPoint = chartPoints[chartPoints.length - 1];
  const chartChange = firstPoint && lastPoint ? lastPoint.price - firstPoint.price : 0;
  const chartChangePercent =
    firstPoint && firstPoint.price > 0 ? (chartChange / firstPoint.price) * 100 : 0;
  const { linePath, areaPath, minPrice, maxPrice } = buildChartPath(chartPoints);
  const midPrice = minPrice + (maxPrice - minPrice) / 2;
  const isPositiveChart = chartChange >= 0;
  const tokenBalanceDecimal = Number.parseFloat(formatUnits(tokenBalance ?? 0n, 18));
  const derivedSpotPriceUsd = spotPriceUsd ?? lastPoint?.price ?? null;
  const tokenBalanceUsd =
    Number.isFinite(tokenBalanceDecimal) && derivedSpotPriceUsd !== null ? tokenBalanceDecimal * derivedSpotPriceUsd : null;
  const chartAreaGradientId = `${token.slug}-price-area`;
  const chartLineGradientId = `${token.slug}-price-line`;
  const chartGlowGradientId = `${token.slug}-price-glow`;
  const stats = marketStats.stats;
  const statsChange = stats?.priceChange24hPercent ?? null;
  const isPositiveStatsChange = statsChange === null || statsChange >= 0;

  async function handleSwitchChain() {
    if (!switchChainAsync) {
      return;
    }

    try {
      await switchChainAsync({ chainId: targetChainId });
    } catch (error) {
      console.error(`Failed to switch wallet to ${token.chainName}.`, error);
    }
  }

  async function handleCopyContract() {
    try {
      await navigator.clipboard.writeText(token.contractAddress);
      setContractCopied(true);
      window.setTimeout(() => setContractCopied(false), 1800);
    } catch (error) {
      console.error(`Failed copying ${token.symbol} contract`, error);
    }
  }

  return (
    <main className="token-page">
      <section className="token-page__hero">
        <div className="token-page__hero-copy">
          <button type="button" className="token-back-link" onClick={() => onNavigate("/")}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="token-page__eyebrow">{token.chainName}</div>
          <h1 className="token-page__title">${token.symbol}</h1>
          <p className="token-page__description">{token.description}</p>
          <div className="token-page__meta">
            <div className="token-page__meta-card">
              <span>Contract</span>
              <button
                type="button"
                className={`token-page__contract-copy ${contractCopied ? "is-copied" : ""}`}
                onClick={() => void handleCopyContract()}
              >
                <strong>{token.contractAddress}</strong>
                <span className="token-page__contract-copy-action">
                  {contractCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {contractCopied ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
            <div className="token-page__meta-card">
              <span>Farm</span>
              <strong>{token.farmSlug ? "Live on this page" : "Not yet live"}</strong>
            </div>
            <div className="token-page__meta-card token-page__meta-card--network">
              <span>Network</span>
              <strong>Visit the main {token.chainName} website:</strong>
              <a
                href={token.chainWebsite}
                target="_blank"
                rel="noreferrer"
                className="token-page__meta-action"
              >
                {token.chainWebsite}
              </a>
            </div>
            <div className="token-page__meta-card token-page__meta-card--balance">
              <span>Wallet Balance</span>
              {address ? (
                wrongTokenChain ? (
                  <>
                    <strong>Switch to {token.chainName}</strong>
                    <button
                      type="button"
                      className="token-page__meta-action"
                      onClick={() => void handleSwitchChain()}
                    >
                      Switch network
                    </button>
                  </>
                ) : isBalanceLoading ? (
                  <>
                    <strong>Checking...</strong>
                  </>
                ) : (
                  <>
                    <strong>{formatTokenBalance(tokenBalance ?? 0n)} {token.symbol}</strong>
                    {tokenBalanceUsd !== null ? (
                      <div className="token-page__meta-value">{formatCurrency(tokenBalanceUsd)}</div>
                    ) : null}
                  </>
                )
              ) : (
                <>
                  <strong>Connect from navbar</strong>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className={`token-page__art token-page__art--${token.glow}`}
          style={
            {
              "--token-landing-glow": token.landingGlow,
              "--token-landing-glow-secondary": token.landingGlowSecondary ?? token.landingGlow,
            } as CSSProperties
          }
          data-glow-mode={token.landingGlowMode ?? "solid"}
        >
          <div className="token-page__art-halo" />
          <img src={token.icon} alt="" className="token-page__art-icon" />
          <div className="token-page__art-chain">{token.chainName}</div>
        </div>
      </section>

      <section className="token-page__resources">
        <div className="token-page__section-head">
          <div>
            <div className="token-page__section-eyebrow">
              <Sparkles className="h-4 w-4" />
              Resources
            </div>
            <h2>Everything for ${token.symbol}</h2>
          </div>
          <button
            type="button"
            className="token-resource token-resource--wallet"
            onClick={() => void addTokenToWallet(token)}
          >
            <Wallet className="h-4 w-4" />
            Add to wallet
          </button>
        </div>

        <div className="token-resource-grid">
          {token.links.map((link) => {
            const isInternal = link.href.startsWith("#");

            return (
              <a
                key={`${token.slug}-${link.label}`}
                href={link.href}
                target={isInternal ? undefined : "_blank"}
                rel={isInternal ? undefined : "noreferrer"}
                className={`token-resource token-resource--${link.kind}`}
              >
                <span>{link.label}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </section>

      {hasMiniSwap ? (
        <section className="token-page__resources token-page__swap-section">
          <div className="token-page__section-head">
            <div>
              <div className="token-page__section-eyebrow">
                <Sparkles className="h-4 w-4" />
                Swap
              </div>
              <h2>Swap on {token.chainName}</h2>
            </div>
          </div>
          <SwapWidget
            mode="compact"
            fixedChainId={targetChainId}
            defaultSellAssetId={swapSellAsset?.id}
            eyebrow={token.chainName}
            heading={`Swap ${token.symbol}`}
          />
        </section>
      ) : null}

      {geckoTerminalPoolAddress ? (
        <section
          className="token-page__resources token-page__market-stats"
          style={
            {
              "--token-landing-glow": token.landingGlow,
              "--token-landing-glow-secondary": token.landingGlowSecondary ?? token.landingGlow,
            } as CSSProperties
          }
        >
          <div className="token-page__section-head">
            <div>
              <div className="token-page__section-eyebrow">
                <Activity className="h-4 w-4" />
                Token Data
              </div>
              <h2>Market Stats</h2>
            </div>
            {stats?.pairLabel ? (
              <a
                href={`https://www.geckoterminal.com/${geckoTerminalNetwork}/pools/${geckoTerminalPoolAddress}`}
                target="_blank"
                rel="noreferrer"
                className="token-page__stats-source"
              >
                {stats.pairLabel}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          {marketStats.loading ? (
            <div className="token-page__chart-state">Loading live pool stats...</div>
          ) : marketStats.error ? (
            <div className="token-page__chart-state token-page__chart-state--error">{marketStats.error}</div>
          ) : stats ? (
            <div className="token-page__stats-shell">
              <div className="token-page__stats-hero">
                <span className="token-page__stats-label">Token Price</span>
                <strong>{stats.priceUsd !== null ? formatCompactCurrency(stats.priceUsd) : "-"}</strong>
                {statsChange !== null ? (
                  <span className={isPositiveStatsChange ? "is-positive" : "is-negative"}>
                    {isPositiveStatsChange ? "+" : ""}
                    {statsChange.toFixed(2)}% 24h
                  </span>
                ) : null}
              </div>
              <div className="token-page__stats-grid">
                <div className="token-page__stat">
                  <span>Liquidity</span>
                  <strong>{stats.liquidityUsd !== null ? formatCompactCurrency(stats.liquidityUsd) : "-"}</strong>
                </div>
                <div className="token-page__stat">
                  <span>Volume 24h</span>
                  <strong>{stats.volume24hUsd !== null ? formatCompactCurrency(stats.volume24hUsd) : "-"}</strong>
                </div>
                <div className="token-page__stat">
                  <span>{stats.marketCapUsd !== null ? "Market Cap" : "FDV"}</span>
                  <strong>
                    {stats.marketCapUsd !== null
                      ? formatCompactCurrency(stats.marketCapUsd)
                      : stats.fdvUsd !== null
                        ? formatCompactCurrency(stats.fdvUsd)
                        : "-"}
                  </strong>
                </div>
                <div className="token-page__stat">
                  <span>Swaps 24h</span>
                  <strong>{stats.transactions24h !== null ? formatCompactNumber(stats.transactions24h) : "-"}</strong>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {hasMarketChart ? (
        <section className="token-page__resources token-page__chart-section">
          <div className="token-page__section-head">
            <div>
              <div className="token-page__section-eyebrow">
                <TrendingUp className="h-4 w-4" />
                Market
              </div>
              <h2>30 Day Price Chart</h2>
            </div>
            {lastPoint ? (
              <div className="token-page__chart-summary">
                <strong>{formatCurrency(lastPoint.price)}</strong>
                <span className={isPositiveChart ? "is-positive" : "is-negative"}>
                  {isPositiveChart ? "+" : ""}
                  {chartChangePercent.toFixed(2)}%
                </span>
              </div>
            ) : null}
          </div>

          {marketChart.loading ? (
            <div className="token-page__chart-state">Loading {chartSourceName} chart data...</div>
          ) : marketChart.error ? (
            <div className="token-page__chart-state token-page__chart-state--error">{marketChart.error}</div>
          ) : (
            <>
              <div className="token-page__chart-metrics">
                <div className="token-page__chart-metric">
                  <span>Current</span>
                  <strong>{lastPoint ? formatCurrency(lastPoint.price) : "-"}</strong>
                </div>
                <div className="token-page__chart-metric">
                  <span>30D Change</span>
                  <strong className={isPositiveChart ? "is-positive" : "is-negative"}>
                    {isPositiveChart ? "+" : ""}
                    {formatCurrency(chartChange)} ({chartChangePercent.toFixed(2)}%)
                  </strong>
                </div>
                <div className="token-page__chart-metric">
                  <span>Range</span>
                  <strong>
                    {formatCurrency(minPrice)} to {formatCurrency(maxPrice)}
                  </strong>
                </div>
              </div>

              <div className="token-page__chart-shell">
                <div className="token-page__chart-axis">
                  <span>{formatAxisPrice(maxPrice)}</span>
                  <span>{formatAxisPrice(midPrice)}</span>
                  <span>{formatAxisPrice(minPrice)}</span>
                </div>

                <div className="token-page__chart-canvas">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="token-page__chart-svg"
                    role="img"
                    aria-label={`${token.symbol} 30 day price chart`}
                  >
                    <defs>
                      <linearGradient id={chartAreaGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.24)" />
                        <stop offset="22%" stopColor="rgba(255, 139, 214, 0.26)" />
                        <stop offset="58%" stopColor="rgba(124, 58, 237, 0.22)" />
                        <stop offset="100%" stopColor="rgba(12, 10, 27, 0)" />
                      </linearGradient>
                      <linearGradient id={chartLineGradientId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ff5faa" />
                        <stop offset="48%" stopColor="#7c3aed" />
                        <stop offset="82%" stopColor="#d8d4ff" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                      <linearGradient id={chartGlowGradientId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255, 95, 170, 0.6)" />
                        <stop offset="48%" stopColor="rgba(124, 58, 237, 0.55)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.5)" />
                      </linearGradient>
                    </defs>
                    <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} className="token-page__chart-grid" />
                    <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} className="token-page__chart-grid" />
                    <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} className="token-page__chart-grid" />
                    <path d={areaPath} fill={`url(#${chartAreaGradientId})`} />
                    <path d={linePath} className="token-page__chart-line-glow" stroke={`url(#${chartGlowGradientId})`} />
                    <path
                      d={linePath}
                      className="token-page__chart-line"
                      stroke={`url(#${chartLineGradientId})`}
                    />
                    {lastPoint ? (
                      <circle
                        cx={chartWidth - chartPadding}
                        cy={
                          chartPoints.length === 1
                            ? chartHeight / 2
                            : chartPadding +
                              (1 - (lastPoint.price - minPrice) / Math.max(maxPrice - minPrice, maxPrice * 0.02, 1e-9)) *
                                (chartHeight - chartPadding * 2)
                        }
                        r="5"
                        className="token-page__chart-point"
                        fill={`url(#${chartLineGradientId})`}
                      />
                    ) : null}
                  </svg>

                  <div className="token-page__chart-dates">
                    <span>{firstPoint ? formatChartDate(firstPoint.timestamp) : "-"}</span>
                    <span>{lastPoint ? formatChartDate(lastPoint.timestamp) : "-"}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      ) : null}

      {children ? (
        <section id="farm" className="token-page__farm">
          <div className="token-page__section-head">
            <div>
              <div className="token-page__section-eyebrow">
                <Sparkles className="h-4 w-4" />
                Farm
              </div>
              <h2>${token.symbol} Farm</h2>
            </div>
          </div>
          {children}
        </section>
      ) : null}

      <footer className="token-page__footer">
        <div className="token-page__pager">
          {previousToken ? (
            <button type="button" className="token-pager" onClick={() => onNavigate(`/${previousToken.slug}`)}>
              <span>Previous</span>
              <strong>${previousToken.symbol}</strong>
            </button>
          ) : <span />}
          {nextToken ? (
            <button type="button" className="token-pager token-pager--next" onClick={() => onNavigate(`/${nextToken.slug}`)}>
              <span>Next</span>
              <strong>${nextToken.symbol}</strong>
            </button>
          ) : null}
        </div>

        <div className="token-page__socials">
          {socials.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
              {social.label}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
