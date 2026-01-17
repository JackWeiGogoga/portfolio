import { useState, useEffect, useCallback, useRef } from "react";

interface PriceData {
  [currency: string]: number;
}

interface CoinGeckoPriceResponse {
  [coinId: string]: PriceData;
}

interface UseCoinGeckoPriceOptions {
  // 刷新间隔（毫秒），默认 60 秒
  refreshInterval?: number;
  // 是否启用自动刷新
  autoRefresh?: boolean;
  // 是否启用缓存
  enableCache?: boolean;
}

interface UseCoinGeckoPriceReturn {
  price: number | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  lastUpdated: Date | undefined;
  refetch: () => Promise<void>;
}

// 缓存存储
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 秒缓存

/**
 * 使用 CoinGecko API 查询代币价格
 *
 * @param coinId - CoinGecko 代币 ID（如 'ethereum', 'bitcoin'）
 * @param vsCurrency - 目标货币（如 'usd', 'eur'）
 * @param options - 配置选项
 * @returns 价格数据和状态
 *
 * @example
 * const { price, isLoading } = useCoinGeckoPrice('ethereum', 'usd');
 */
export function useCoinGeckoPrice(
  coinId: string,
  vsCurrency: string = "usd",
  options: UseCoinGeckoPriceOptions = {}
): UseCoinGeckoPriceReturn {
  const {
    refreshInterval = 60000,
    autoRefresh = true,
    enableCache = true,
  } = options;

  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchPrice = useCallback(async () => {
    const cacheKey = `${coinId}-${vsCurrency}`;

    // 检查缓存
    if (enableCache && priceCache.has(cacheKey)) {
      const cached = priceCache.get(cacheKey)!;
      const age = Date.now() - cached.timestamp;

      if (age < CACHE_DURATION) {
        setPrice(cached.price);
        setIsLoading(false);
        setIsError(false);
        setError(undefined);
        setLastUpdated(new Date(cached.timestamp));
        return;
      }
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setIsError(false);
      setError(undefined);

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CoinGeckoPriceResponse = await response.json();

      if (!data[coinId] || !data[coinId][vsCurrency]) {
        throw new Error(`Price not found for ${coinId} in ${vsCurrency}`);
      }

      const fetchedPrice = data[coinId][vsCurrency];
      const now = Date.now();

      setPrice(fetchedPrice);
      setLastUpdated(new Date(now));

      // 更新缓存
      if (enableCache) {
        priceCache.set(cacheKey, { price: fetchedPrice, timestamp: now });
      }
    } catch (err) {
      // 忽略 abort 错误
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error("Failed to fetch price:", err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [coinId, vsCurrency, enableCache]);

  // 初始加载
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchPrice();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchPrice]);

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    price,
    isLoading,
    isError,
    error,
    lastUpdated,
    refetch: fetchPrice,
  };
}

/**
 * 格式化价格显示
 *
 * @param price - 价格
 * @param currency - 货币符号
 * @returns 格式化后的价格字符串
 */
export function formatPrice(
  price: number | undefined,
  currency: string = "USD"
): string {
  if (price === undefined) return "-";

  // 根据价格大小决定小数位数
  let decimals = 2;
  if (price < 0.01) {
    decimals = 6;
  } else if (price < 1) {
    decimals = 4;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/**
 * 计算代币的美元价值
 *
 * @param tokenAmount - 代币数量
 * @param tokenPriceInEth - 代币的 ETH 价格
 * @param ethPriceInUsd - ETH 的美元价格
 * @returns 美元价值
 */
export function calculateUsdValue(
  tokenAmount: string | number,
  tokenPriceInEth: string | number,
  ethPriceInUsd: number | undefined
): number | undefined {
  if (!ethPriceInUsd) return undefined;

  const amount =
    typeof tokenAmount === "string" ? parseFloat(tokenAmount) : tokenAmount;
  const price =
    typeof tokenPriceInEth === "string"
      ? parseFloat(tokenPriceInEth)
      : tokenPriceInEth;

  if (isNaN(amount) || isNaN(price)) return undefined;

  return amount * price * ethPriceInUsd;
}
