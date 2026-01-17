import { useEffect, useRef } from "react";
import { useConnection, useSwitchChain } from "wagmi";
import { ALLOWED_CHAIN_IDS, MAINNET_CHAIN_ID } from "@/config/wagmi";
import { useToast } from "./use-toast";

/**
 * 链守卫 Hook
 * 监听当前链，如果用户切换到主网，自动切换回测试网并提示
 */
export function useChainGuard() {
  const { chain, isConnected } = useConnection();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // 只在已连接且当前链是主网时触发
    if (isConnected && chain && chain.id === MAINNET_CHAIN_ID) {
      // 防止重复显示提示
      if (!hasShownToast.current) {
        hasShownToast.current = true;

        // 显示警告提示
        toast({
          title: "⚠️ 主网暂未部署合约",
          description: "已自动切换至测试网络，请在测试网环境下使用",
          variant: "destructive",
        });
      }

      // 自动切换回第一个允许的测试网
      if (switchChain && ALLOWED_CHAIN_IDS.length > 0) {
        switchChain({ chainId: ALLOWED_CHAIN_IDS[0] });
      }
    } else {
      // 重置标志，允许下次切换到主网时再次显示
      hasShownToast.current = false;
    }
  }, [chain, isConnected, switchChain, toast]);
}
