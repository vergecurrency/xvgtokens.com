import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useAccount, useChains, useConnect, useConnectors, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getConnectorLabel(name: string) {
  if (name.toLowerCase() === "injected") {
    return "Browser Wallet";
  }

  return name;
}

export function WalletConnectTrigger() {
  const [open, setOpen] = useState(false);
  const { address, chainId, isConnected, isConnecting } = useAccount();
  const chains = useChains();
  const connectors = useConnectors();
  const connectorItems = connectors as unknown as ReadonlyArray<{
    id: string;
    name: string;
    uid?: string;
  }>;
  const { connect, isPending, error, variables } = useConnect({
    mutation: {
      onSuccess: () => setOpen(false),
    },
  });
  const { disconnect } = useDisconnect();
  const isSupportedChain = useMemo(
    () => (chainId ? chains.some((chain) => chain.id === chainId) : true),
    [chainId, chains],
  );

  if (isConnected && address) {
    return (
      <div className="site-nav__menu">
        <Button
          type="button"
          onClick={() => setOpen((current) => !current)}
          variant={isSupportedChain ? "default" : "outline"}
          className="w-full sm:w-auto"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isSupportedChain ? formatAddress(address) : "Wrong Network"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
        {open ? (
          <div className="site-nav__popover site-theme-menu">
            <button
              type="button"
              className="site-nav__token site-theme-menu__option"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="site-nav__menu">
      <Button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full sm:w-auto"
        disabled={isConnecting || isPending}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting || isPending ? "Connecting..." : "Connect Wallet"}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      {open ? (
        <div className="site-nav__popover site-theme-menu">
          {connectorItems.map((connector) => (
            <button
              key={connector.uid ?? connector.id}
              type="button"
              className="site-nav__token site-theme-menu__option"
              disabled={isPending}
              onClick={() => connect({ connector: connector as (typeof connectors)[number] })}
            >
              <Wallet className="h-4 w-4" />
              <span>{getConnectorLabel(connector.name)}</span>
              {variables?.connector === connector && isPending ? <small>Opening</small> : null}
            </button>
          ))}
          {error ? <small className="site-theme-menu__hint">{error.message}</small> : null}
        </div>
      ) : null}
    </div>
  );
}
