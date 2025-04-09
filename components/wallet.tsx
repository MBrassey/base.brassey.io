import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Wallet() {
  const { address, isConnecting } = useAccount();
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
  });

  if (isConnecting || isLoadingBalance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect your wallet to view your balance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Address: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="text-sm text-muted-foreground">
            Balance: {balance?.formatted} {balance?.symbol}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 