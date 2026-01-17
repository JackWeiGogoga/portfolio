import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  return (
    <div className="mb-6 flex justify-end">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button onClick={openConnectModal} variant="default">
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive">
                      Network Error
                    </Button>
                  );
                }

                return (
                  <div className="flex gap-2">
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      size="sm"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          className="w-4 h-4 mr-2"
                        />
                      )}
                      {chain.name}
                    </Button>
                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      size="sm"
                    >
                      {account.displayName}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
