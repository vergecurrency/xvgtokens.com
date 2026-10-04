import type { FarmSlug } from "@/lib/farms";

type TokenGlow = "sky" | "emerald" | "amber" | "violet" | "cyan" | "rose";
type LinkKind = "explorer" | "market" | "dex" | "farm";

type TokenLink = {
  label: string;
  href: string;
  kind: LinkKind;
};

type WalletConfig = {
  networkName: string;
  chainId: string;
  rpcUrl: string;
  nativeSymbol: string;
  explorerUrl: string;
};

export type TokenSlug =
  | "xvgzke"
  | "xvgcbtc"
  | "xvgbase"
  | "xvgopt"
  | "xvgson"
  | "xvgarb"
  | "xvgava"
  | "xvgpoly"
  | "xvglin"
  | "xvgbsc"
  | "xvgmnt"
  | "xvgcro"
  | "xvguni"
  | "xvggnosis"
  | "xvgbera"
  | "xvgworld"
  | "xvghemi"
  | "xvgzora";

export type TokenDefinition = {
  slug: TokenSlug;
  symbol: string;
  chainName: string;
  chainMenuLabel: string;
  chainWebsite: string;
  marketChartId?: string;
  contractAddress: string;
  description: string;
  icon: string;
  glow: TokenGlow;
  landingGlow: string;
  landingGlowSecondary?: string;
  landingGlowMode?: "solid" | "rainbow" | "dual";
  farmSlug?: FarmSlug;
  links: TokenLink[];
  wallet: WalletConfig;
};

export const sharedContractAddress = "0xe061aa40be525a13296cb4bf69f513242349d708";

export const tokenOrder: TokenSlug[] = [
  "xvgzke",
  "xvgcbtc",
  "xvgbase",
  "xvgopt",
  "xvgson",
  "xvgarb",
  "xvgava",
  "xvgpoly",
  "xvglin",
  "xvgbsc",
  "xvgmnt",
  "xvgcro",
  "xvguni",
  "xvggnosis",
  "xvgbera",
  "xvgworld",
  "xvghemi",
  "xvgzora",
];

export const tokensBySlug: Record<TokenSlug, TokenDefinition> = {
  xvgzke: {
    slug: "xvgzke",
    symbol: "XVGZKE",
    chainName: "zkSync Era",
    chainMenuLabel: "zkSync Era",
    chainWebsite: "https://www.zksync.io/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgzke.png",
    glow: "sky",
    landingGlow: "#262768",
    description:
      "XVGZKE takes Verge into the zkSync Era, where zero-knowledge rollups enable private, scalable, and gas-efficient transactions. It is ideal for users looking to transact securely and swiftly while keeping fees low. This token was one of six included in the XVGSuite Pinksale.",
    links: [
      { label: "View Explorer", href: "https://era.zksync.network/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/xvgzke", kind: "market" },
      { label: "Phemex", href: "https://phemex.com/price/xvgzke", kind: "market" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/zksync/pair-explorer/0x1466d87bc4b100ac7c3d0dbeb2ba7a46f1bc59b2", kind: "dex" },
    ],
    wallet: {
      networkName: "zkSync Era Mainnet",
      chainId: "0x144",
      rpcUrl: "https://mainnet.era.zksync.io",
      nativeSymbol: "ETH",
      explorerUrl: "https://era.zksync.io",
    },
  },
  xvgcbtc: {
    slug: "xvgcbtc",
    symbol: "XVGCBTC",
    chainName: "Citrea",
    chainMenuLabel: "Citrea",
    chainWebsite: "https://citrea.xyz/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgcbtc.png",
    glow: "amber",
    landingGlow: "#f7931a",
    description:
      "XVGCBTC extends Verge onto Citrea, a Bitcoin-secured zkEVM network designed to bring EVM apps and low-fee execution closer to the Bitcoin ecosystem.",
    links: [
      { label: "View Explorer", href: "https://explorer.mainnet.citrea.xyz/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
    ],
    wallet: {
      networkName: "Citrea Mainnet",
      chainId: "0x1012",
      rpcUrl: "https://rpc.mainnet.citrea.xyz",
      nativeSymbol: "cBTC",
      explorerUrl: "https://explorer.mainnet.citrea.xyz",
    },
  },
  xvgbase: {
    slug: "xvgbase",
    symbol: "XVGBASE",
    chainName: "Base",
    chainMenuLabel: "Base Network",
    chainWebsite: "https://www.base.org/",
    marketChartId: "xvgbase",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgbase.png",
    glow: "emerald",
    landingGlow: "blue",
    farmSlug: "xvgbase",
    description:
      "XVGBASE launches XVG into Coinbase's Base chain, a secure developer-friendly L2 built to onboard the next billion users. It fuses Verge's legacy with Base's high-performance, low-gas infrastructure for fast everyday use. This token's entire supply was airdropped for free to all XVGETH holders.",
    links: [
      { label: "View Explorer", href: "https://basescan.org/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/xvgbase", kind: "market" },
      { label: "CoinStats", href: "https://coinstats.app/coins/xvgbase/", kind: "market" },
      { label: "View on Coinbase", href: "https://www.coinbase.com/price/xvgbase-base-0xe061aa40be525a13296cb4bf69f513242349d708-token", kind: "market" },
      { label: "Wall Of Fame", href: "https://xvgbase.walloffame.finance", kind: "market" },
      { label: "Tangem", href: "https://tangem.com/en/how-to-buy/xvgbase/", kind: "market" },
      { label: "Jump to Farm", href: "#farm", kind: "farm" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/base/pools/0x7f09fde136dafc1222ef22d4d15f434a0161aa50", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/base/pair-explorer/0x7f09fde136dafc1222ef22d4d15f434a0161aa50", kind: "dex" },
    ],
    wallet: {
      networkName: "Base Mainnet",
      chainId: "0x2105",
      rpcUrl: "https://mainnet.base.org",
      nativeSymbol: "ETH",
      explorerUrl: "https://basescan.org",
    },
  },
  xvgopt: {
    slug: "xvgopt",
    symbol: "XVGOPT",
    chainName: "Optimism",
    chainMenuLabel: "Optimism",
    chainWebsite: "https://www.optimism.io/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgopt.png",
    glow: "cyan",
    landingGlow: "red",
    description:
      "XVGOPT unlocks Verge utility on Optimism, a chain designed for fast Ethereum-compatible transactions with significantly lower costs. This positions XVG at the center of the Optimism Superchain vision and was one of six tokens included in the XVGSuite Pinksale.",
    links: [
      { label: "View Explorer", href: "https://optimistic.etherscan.io/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/xvgopt", kind: "market" },
      { label: "Phemex", href: "https://phemex.com/price/xvgopt", kind: "market" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/optimism/pools/0x08ad80b07b28ea2d40a031150cecb71b59ebb174b663bb3e341cd816dae37ba7", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/optimism/pair-explorer/0x08ad80b07b28ea2d40a031150cecb71b59ebb174b663bb3e341cd816dae37ba7", kind: "dex" },
    ],
    wallet: {
      networkName: "Optimism",
      chainId: "0xA",
      rpcUrl: "https://mainnet.optimism.io",
      nativeSymbol: "ETH",
      explorerUrl: "https://optimistic.etherscan.io",
    },
  },
  xvgson: {
    slug: "xvgson",
    symbol: "XVGSON",
    chainName: "Sonic",
    chainMenuLabel: "Sonic",
    chainWebsite: "https://www.soniclabs.com/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgson.png",
    glow: "violet",
    landingGlow: "white",
    description:
      "XVGSON is at the forefront of experimental high-throughput chains, benefiting from Sonic Labs' modular design and rapid block times. It brings Verge's mission to a next-gen environment optimized for speed, scale, and smart contract flexibility.",
    links: [
      { label: "View Explorer", href: "https://sonicscan.org/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/xvgson", kind: "market" },
      { label: "Phemex", href: "https://phemex.com/price/xvgson", kind: "market" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/sonic/pools/0xb93d90b0f0947f2f7a31effbd686a3995db5db35", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/sonic/pair-explorer/0xb93d90b0f0947f2f7a31effbd686a3995db5db35", kind: "dex" },
    ],
    wallet: {
      networkName: "Sonic Mainnet",
      chainId: "0x92",
      rpcUrl: "https://1rpc.io/sonic",
      nativeSymbol: "S",
      explorerUrl: "https://sonicscan.org",
    },
  },
  xvgarb: {
    slug: "xvgarb",
    symbol: "XVGARB",
    chainName: "Arbitrum",
    chainMenuLabel: "Arbitrum",
    chainWebsite: "https://arbitrum.io/",
    marketChartId: "xvgarb",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgarb.png",
    glow: "sky",
    landingGlow: "skyblue",
    description:
      "XVGARB thrives on Arbitrum One, offering lightning-fast transactions and low fees powered by one of the most adopted rollups in Web3. This launch connects Verge holders with a vast DeFi ecosystem and efficient Layer 2 UX.",
    links: [
      { label: "View Explorer", href: "https://arbiscan.io/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/xvgarb", kind: "market" },
      { label: "CoinStats", href: "https://coinstats.app/coins/xvgarb/", kind: "market" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/arbitrum/pools/0xeda17fad99924e44030ed6900cf20beb888ce2fc7f50e0ad4ffd584eb84ca5e5", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/arbitrum/pair-explorer/0xeda17fad99924e44030ed6900cf20beb888ce2fc7f50e0ad4ffd584eb84ca5e5", kind: "dex" },
    ],
    wallet: {
      networkName: "Arbitrum One",
      chainId: "0xA4B1",
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      nativeSymbol: "ETH",
      explorerUrl: "https://arbiscan.io",
    },
  },
  xvgava: {
    slug: "xvgava",
    symbol: "XVGAVA",
    chainName: "Avalanche",
    chainMenuLabel: "Avalanche",
    chainWebsite: "https://www.avax.network/",
    marketChartId: "xvgava",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgava.png",
    glow: "rose",
    landingGlow: "#fe6666",
    description:
      "XVGAVA taps into Avalanche's sub-second finality and eco-friendly proof-of-stake consensus, delivering near-instant value transfer and dApp performance across Avalanche's thriving C-Chain DeFi ecosystem.",
    links: [
      { label: "View Explorer", href: "https://snowtrace.io/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/xvgava", kind: "market" },
      { label: "CoinStats", href: "https://coinstats.app/coins/xvgava/", kind: "market" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/avax/pools/0x09ae78182a2183a8ffbbca73bde007bb907cdd7022b06b3bda6379d8effff3f1", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/avalanche/pair-explorer/0x09ae78182a2183a8ffbbca73bde007bb907cdd7022b06b3bda6379d8effff3f1", kind: "dex" },
    ],
    wallet: {
      networkName: "Avalanche Network C-Chain",
      chainId: "0xA86A",
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      nativeSymbol: "AVAX",
      explorerUrl: "https://snowtrace.io",
    },
  },
  xvgpoly: {
    slug: "xvgpoly",
    symbol: "XVGPOLY",
    chainName: "Polygon",
    chainMenuLabel: "Polygon",
    chainWebsite: "https://polygon.technology/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgpoly.png",
    glow: "emerald",
    landingGlow: "#6c00f6",
    description:
      "XVGPOLY brings Verge to Polygon's efficient Layer 2 environment, delivering low-cost transactions ideal for gaming, NFTs, and DeFi. This token's entire supply was airdropped free to XVGETH holders.",
    links: [
      { label: "View Explorer", href: "https://polygonscan.com/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/polygon/pair-explorer/0x7c58c7c78b8bfff31c03ddc1f3ae6fc09b372490500e0f39ac1d15e0dfd1e115", kind: "dex" },
    ],
    wallet: {
      networkName: "Polygon Mainnet",
      chainId: "0x89",
      rpcUrl: "https://polygon-bor-rpc.publicnode.com",
      nativeSymbol: "MATIC",
      explorerUrl: "https://polygonscan.com",
    },
  },
  xvglin: {
    slug: "xvglin",
    symbol: "XVGLIN",
    chainName: "Linea",
    chainMenuLabel: "Linea",
    chainWebsite: "https://linea.build/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvglin.png",
    glow: "sky",
    landingGlow: "teal",
    description:
      "XVGLIN brings the power of Verge to Linea's zkEVM Layer 2, combining ultra-low gas fees with Ethereum-level security and full EVM compatibility. It is the gateway for users who want to scale without compromise.",
    links: [
      { label: "View Explorer", href: "https://lineascan.build/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/linea/pools/0xee83fce74a0ef6efcdc63c0f7367819d485aef8d", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/linea/pair-explorer/0xee83fce74a0ef6efcdc63c0f7367819d485aef8d", kind: "dex" },
    ],
    wallet: {
      networkName: "Linea",
      chainId: "0xE708",
      rpcUrl: "https://rpc.linea.build",
      nativeSymbol: "ETH",
      explorerUrl: "https://lineascan.build",
    },
  },
  xvgbsc: {
    slug: "xvgbsc",
    symbol: "XVGBSC",
    chainName: "BNB Smart Chain",
    chainMenuLabel: "Binance Smart Chain",
    chainWebsite: "https://www.bnbchain.org/en/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgbsc.png",
    glow: "amber",
    landingGlow: "gold",
    farmSlug: "xvgbsc",
    description:
      "XVGBSC unlocks the power of XVG on Binance Smart Chain, known for blazing speed, massive liquidity, and ultra-low fees. It is a strong fit for traders, DEX users, and builders, and its entire supply was airdropped for free.",
    links: [
      { label: "View Explorer", href: "https://bscscan.com/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "Jump to Farm", href: "#farm", kind: "farm" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/bsc/pools/0x1aefd48cbfedecb3459ea7b1f6ad723227575527", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/bnb/pair-explorer/0x7c58c7c78b8bfff31c03ddc1f3ae6fc09b372490500e0f39ac1d15e0dfd1e115", kind: "dex" },
    ],
    wallet: {
      networkName: "Binance Smart Chain",
      chainId: "0x38",
      rpcUrl: "https://bsc-dataseed.bnbchain.org",
      nativeSymbol: "BNB",
      explorerUrl: "https://bscscan.com",
    },
  },
  xvgmnt: {
    slug: "xvgmnt",
    symbol: "XVGMNT",
    chainName: "Mantle",
    chainMenuLabel: "Mantle",
    chainWebsite: "https://www.mantle.xyz/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgmnt.png",
    glow: "cyan",
    landingGlow: "lightgreen",
    description:
      "XVGMNT brings Verge to Mantle's modular Ethereum Layer 2, combining rollup security with decentralized data availability and low fees. Its liquidity pool is paired solely with MNT and the token supply was airdropped for free.",
    links: [
      { label: "View Explorer", href: "https://explorer.mantle.xyz/token/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/mantle/pools/0x3f5db130faeb741b3131f51d9d48789e74b20d57", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/mantle/pair-explorer/0x3f5db130faeb741b3131f51d9d48789e74b20d57", kind: "dex" },
    ],
    wallet: {
      networkName: "Mantle",
      chainId: "0x1388",
      rpcUrl: "https://rpc.mantle.xyz",
      nativeSymbol: "MNT",
      explorerUrl: "https://explorer.mantle.xyz",
    },
  },
  xvgcro: {
    slug: "xvgcro",
    symbol: "XVGCRO",
    chainName: "Cronos",
    chainMenuLabel: "Cronos",
    chainWebsite: "https://cronos.org/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgcro.png",
    glow: "rose",
    landingGlow: "#3b4478",
    description:
      "XVGCRO is a Verge-branded token deployed natively on Cronos. Unlike wrapped assets or synthetic derivatives, it is fully native and anchored by a single liquidity pool paired exclusively with CRO.",
    links: [
      { label: "View Explorer", href: "https://cronoscan.com/token/0xe061Aa40Be525A13296CB4Bf69f513242349D708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/cro/pools/0xdcd1bd360155de2469e36f7f8095584de4d5f828", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/cronos/pair-explorer/0xdcd1bd360155de2469e36f7f8095584de4d5f828", kind: "dex" },
    ],
    wallet: {
      networkName: "Cronos",
      chainId: "0x19",
      rpcUrl: "https://evm.cronos.org",
      nativeSymbol: "CRO",
      explorerUrl: "https://cronoscan.com",
    },
  },
  xvguni: {
    slug: "xvguni",
    symbol: "XVGUNI",
    chainName: "Unichain",
    chainMenuLabel: "UniChain",
    chainWebsite: "https://docs.unichain.org/docs",
    contractAddress: sharedContractAddress,
    icon: "/images/xvguni.png",
    glow: "violet",
    landingGlow: "purple",
    description:
      "XVGUNI harnesses Uniswap's proprietary L2 chain to merge Verge's value with one of the largest DEX user bases in the world. It brings ultra-fast swaps, next-gen liquidity incentives, and direct access to the heart of DeFi innovation.",
    links: [
      { label: "View Explorer", href: "https://uniscan.xyz/address/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/unichain/pools/0x04b01734e4af42a33e6d89a4c42915a10f5237c19f99ea401a6ebed87e9693ce", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/unichain/pair-explorer/0x04b01734e4af42a33e6d89a4c42915a10f5237c19f99ea401a6ebed87e9693ce", kind: "dex" },
    ],
    wallet: {
      networkName: "Unichain",
      chainId: "0x82",
      rpcUrl: "https://mainnet.unichain.org",
      nativeSymbol: "ETH",
      explorerUrl: "https://uniscan.xyz",
    },
  },
  xvggnosis: {
    slug: "xvggnosis",
    symbol: "XVGGNOSIS",
    chainName: "Gnosis",
    chainMenuLabel: "Gnosis",
    chainWebsite: "https://www.gnosischain.com/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvggnosis.png",
    glow: "emerald",
    landingGlow: "darkgreen",
    description:
      "XVGGNOSIS extends the XVG ecosystem to Gnosis Chain, leveraging low fees and secure infrastructure while maintaining the same unified contract address as the other tokens. It gives users efficient cross-chain access to the Gnosis DeFi and payments ecosystem.",
    links: [
      { label: "View Explorer", href: "https://gnosis.blockscout.com/address/0xe061Aa40Be525A13296CB4Bf69f513242349D708?tab=contract", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/xdai/pools/0x0925aae4c0aa5bd31eb315dc1063247d9ea72b0f", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/gnosis/pair-explorer/0x0925aae4c0aa5bd31eb315dc1063247d9ea72b0f", kind: "dex" },
    ],
    wallet: {
      networkName: "Gnosis",
      chainId: "0x64",
      rpcUrl: "https://rpc.gnosischain.com",
      nativeSymbol: "XDAI",
      explorerUrl: "https://gnosisscan.io/",
    },
  },
  xvgbera: {
    slug: "xvgbera",
    symbol: "XVGBERA",
    chainName: "Berachain",
    chainMenuLabel: "BeraChain",
    chainWebsite: "https://docs.berachain.com/general/introduction/what-is-berachain",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgbera.png",
    glow: "amber",
    landingGlow: "brown",
    description:
      "XVGBERA brings the unified XVG token experience to Berachain by using the same contract address pattern, giving holders instant recognition while combining XVG liquidity with Berachain's scalable appchain design.",
    links: [
      { label: "View Explorer", href: "https://berascan.com/address/0xe061Aa40Be525A13296CB4Bf69f513242349D708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/berachain/pools/0x0eea4b4c5e02ce122276ab3a559837d498d6f43f", kind: "dex" },
      { label: "View on DexScreener", href: "https://dexscreener.com/berachain/0x0eea4b4c5e02ce122276ab3a559837d498d6f43f", kind: "dex" },
    ],
    wallet: {
      networkName: "Berachain",
      chainId: "0x138de",
      rpcUrl: "https://rpc.berachain.com",
      nativeSymbol: "BERA",
      explorerUrl: "https://berascan.com/",
    },
  },
  xvgworld: {
    slug: "xvgworld",
    symbol: "XVGWORLD",
    chainName: "World Chain",
    chainMenuLabel: "WorldChain",
    chainWebsite: "https://world.org/world-chain",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgworld.png",
    glow: "cyan",
    landingGlow: "red",
    landingGlowMode: "rainbow",
    description:
      "XVGWORLD brings the XVG brand to World Chain for faster transactions, lower fees, and broader utility. It ties XVG's value to World Chain's growth while giving holders new arbitrage, cross-chain, and dApp opportunities.",
    links: [
      { label: "View Explorer", href: "https://worldscan.org/token/0xe061Aa40Be525A13296CB4Bf69f513242349D708", kind: "explorer" },
      { label: "View on Worldplorer", href: "https://worldplorer.com/address/0xe061aa40be525a13296cb4bf69f513242349d708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/world-chain/pools/0x2a67b0973fae9192652891af33e457d43bd7e37b38376a3e2c235ddb078788af", kind: "dex" },
      { label: "View on DexTools", href: "https://www.dextools.io/app/en/worldchain/pair-explorer/0x2a67b0973fae9192652891af33e457d43bd7e37b38376a3e2c235ddb078788af", kind: "dex" },
    ],
    wallet: {
      networkName: "World Chain",
      chainId: "0x1e0",
      rpcUrl: "https://worldchain.drpc.org",
      nativeSymbol: "ETH",
      explorerUrl: "https://worldscan.org",
    },
  },
  xvghemi: {
    slug: "xvghemi",
    symbol: "XVGHEMI",
    chainName: "Hemi",
    chainMenuLabel: "Hemi",
    chainWebsite: "https://hemi.xyz/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvghemi.png",
    glow: "sky",
    landingGlow: "darkorange",
    landingGlowSecondary: "orange",
    landingGlowMode: "dual",
    description:
      "XVGHEMI is the Verge-branded token deployed on Hemi, extending the multi-chain XVG ecosystem into an EVM environment that embeds a fully verifiable Bitcoin node. It positions XVG as both a cross-chain asset and a showcase for BTC-aware DeFi.",
    links: [
      { label: "View Explorer", href: "https://explorer.hemi.xyz/address/0xe061Aa40Be525A13296CB4Bf69f513242349D708", kind: "explorer" },
      { label: "View on GeckoTerminal", href: "https://www.geckoterminal.com/hemi/pools/0x476a3ad9e167848812737214e380c1b4de405911", kind: "dex" },
    ],
    wallet: {
      networkName: "Hemi",
      chainId: "0xa867",
      rpcUrl: "https://rpc.hemi.network/rpc",
      nativeSymbol: "ETH",
      explorerUrl: "https://explorer.hemi.xyz/",
    },
  },
  xvgzora: {
    slug: "xvgzora",
    symbol: "XVGZORA",
    chainName: "Zora",
    chainMenuLabel: "Zora",
    chainWebsite: "https://zora.co/",
    contractAddress: sharedContractAddress,
    icon: "/images/xvgzora.png",
    glow: "rose",
    landingGlow: "blue",
    landingGlowSecondary: "purple",
    landingGlowMode: "dual",
    description:
      "XVGZORA brings Verge into the Zora ecosystem, tying Verge's privacy-first legacy to Zora's creative NFT-driven network. It preserves the same unified contract address identity used across the wider multi-chain XVG token family.",
    links: [
      { label: "View Explorer", href: "https://explorer.zora.energy/token/0xe061Aa40Be525A13296CB4Bf69f513242349D708", kind: "explorer" },
    ],
    wallet: {
      networkName: "Zora",
      chainId: "0x76adf1",
      rpcUrl: "https://zora.drpc.org",
      nativeSymbol: "ETH",
      explorerUrl: "https://explorer.zora.energy/token/0xe061Aa40Be525A13296CB4Bf69f513242349D708",
    },
  },
};

export const socials = [
  { label: "Discord", href: "https://discord.gg/vergecurrency" },
  { label: "X", href: "https://www.twitter.com/xvgeth" },
  { label: "Telegram", href: "https://t.me/officialxvg" },
  { label: "GitHub", href: "https://github.com/vergecurrency/erc20/" },
  { label: "YouTube", href: "https://www.youtube.com/vergecurrencyofficial" },
];
