import { coinbaseWallet, injected, metaMask, walletConnect } from "@wagmi/connectors";
import { defineChain, fallback } from "viem";
import { createConfig, http } from "wagmi";
import {
  mainnet as mainnetChain,
  arbitrum as arbitrumChain,
  avalanche as avalancheChain,
  base as baseChain,
  berachain as berachainChain,
  bsc as bscChain,
  cronos as cronosChain,
  gnosis as gnosisChain,
  hemi as hemiChain,
  linea as lineaChain,
  mantle as mantleChain,
  optimism as optimismChain,
  polygon as polygonChain,
  sonic as sonicChain,
  unichain as unichainChain,
  worldchain as worldchainChain,
  zksync as zksyncChain,
  zora as zoraChain,
} from "wagmi/chains";
import { tokenOrder, tokensBySlug } from "@/data/tokens";

function getRpcUrlEnv(name: string, fallback: string) {
  const raw = import.meta.env[name];
  if (typeof raw !== "string") {
    return fallback;
  }

  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function getRpcUrlListEnv(name: string, fallbacks: string[]) {
  const raw = import.meta.env[name];
  const envUrls =
    typeof raw === "string"
      ? raw
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

  return Array.from(new Set([...envUrls, ...fallbacks].filter(Boolean)));
}

const citreaChain = defineChain({
  id: 4114,
  name: "Citrea Mainnet",
  nativeCurrency: {
    name: "Citrea Bitcoin",
    symbol: "cBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.citrea.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Citrea Explorer",
      url: "https://explorer.mainnet.citrea.xyz",
    },
  },
});

const chains = [
  mainnetChain,
  citreaChain,
  baseChain,
  bscChain,
  zksyncChain,
  optimismChain,
  sonicChain,
  arbitrumChain,
  avalancheChain,
  polygonChain,
  lineaChain,
  mantleChain,
  cronosChain,
  unichainChain,
  gnosisChain,
  berachainChain,
  worldchainChain,
  hemiChain,
  zoraChain,
] as const;

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();

const connectors = [
  injected({ shimDisconnect: true }),
  metaMask({
    dappMetadata: {
      name: "XVGTokens",
      url: "https://xvgtokens.com/",
      iconUrl: "https://xvgtokens.com/images/favicon.ico",
    },
  }),
  coinbaseWallet({
    appName: "XVGTokens",
    appLogoUrl: "https://xvgtokens.com/images/favicon.ico",
  }),
  ...(walletConnectProjectId && walletConnectProjectId !== "YOUR_WALLETCONNECT_PROJECT_ID"
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            name: "XVGTokens",
            description: "Multi-chain XVG explorer, farms, swap, and portfolio tracker.",
            url: "https://xvgtokens.com/",
            icons: ["https://xvgtokens.com/images/favicon.ico"],
          },
          showQrModal: true,
        }),
      ]
    : []),
] as const;

const transports = Object.fromEntries(
  [
    [
      mainnetChain.id,
      http(getRpcUrlEnv("VITE_ETH_RPC_URL", "https://ethereum-rpc.publicnode.com")),
    ],
    ...tokenOrder.map((slug) => {
      const token = tokensBySlug[slug];
      const chainId = Number.parseInt(token.wallet.chainId, 16);

      if (chainId === baseChain.id) {
        return [
          chainId,
          fallback(
            getRpcUrlListEnv("VITE_BASE_RPC_URL", [
              token.wallet.rpcUrl,
              "https://base-rpc.publicnode.com",
              "https://base.llamarpc.com",
            ]).map((rpcUrl) => http(rpcUrl)),
          ),
        ];
      }

      if (chainId === bscChain.id) {
        return [
          chainId,
          fallback(
            getRpcUrlListEnv("VITE_BSC_RPC_URL", [
              token.wallet.rpcUrl,
              "https://bsc-rpc.publicnode.com",
              "https://bsc-dataseed1.bnbchain.org",
            ]).map((rpcUrl) => http(rpcUrl)),
          ),
        ];
      }

      return [chainId, http(token.wallet.rpcUrl)];
    }),
  ],
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
  ssr: false,
});
