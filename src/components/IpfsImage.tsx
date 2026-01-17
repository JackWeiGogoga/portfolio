import { useState, useMemo } from "react";
import { ipfsToHttp } from "@/lib/ipfs";
import { cn } from "@/lib/utils";

interface IpfsImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 图片 URL，支持 IPFS 和普通 HTTP URL */
  src?: string;
  /** 图片加载失败时的后备内容 */
  fallback?: React.ReactNode;
  /** 图片加载失败时的后备 URL */
  fallbackSrc?: string;
  /** 图片容器类名 */
  containerClassName?: string;
  /** 是否显示加载状态 */
  showLoading?: boolean;
}

/**
 * 支持 IPFS 的图片组件
 *
 * 功能：
 * - 自动转换 IPFS URL (ipfs://) 为网关地址
 * - 处理图片加载错误
 * - 支持 fallback 显示
 * - 支持加载状态
 *
 * @example
 * ```tsx
 * // 基本使用
 * <IpfsImage src="ipfs://QmXXX..." alt="IPFS Image" />
 *
 * // 自定义 fallback
 * <IpfsImage
 *   src="ipfs://QmXXX..."
 *   fallback={<span>🖼️</span>}
 *   className="w-32 h-32"
 * />
 *
 * // 使用 fallback URL
 * <IpfsImage
 *   src="ipfs://QmXXX..."
 *   fallbackSrc="https://example.com/default.png"
 * />
 * ```
 */
export default function IpfsImage({
  src,
  alt,
  fallback,
  fallbackSrc,
  className,
  containerClassName,
  showLoading = false,
  ...props
}: IpfsImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 转换 IPFS URL
  const imageUrl = useMemo(() => {
    if (hasError && fallbackSrc) {
      return fallbackSrc;
    }
    return ipfsToHttp(src || "");
  }, [src, hasError, fallbackSrc]);

  // 如果没有 src 且有 fallback，直接显示 fallback
  if (!src && fallback) {
    return (
      <div
        className={cn("flex items-center justify-center", containerClassName)}
      >
        {fallback}
      </div>
    );
  }

  // 如果加载失败且有 fallback
  if (hasError && !fallbackSrc && fallback) {
    return (
      <div
        className={cn("flex items-center justify-center", containerClassName)}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className={cn("relative", containerClassName)}>
      {showLoading && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      )}
      <img
        {...props}
        src={imageUrl}
        alt={alt || "Image"}
        className={cn(
          isLoading && showLoading ? "opacity-0" : "opacity-100",
          "transition-opacity duration-200",
          className
        )}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          // 如果有 fallbackSrc 且还没尝试过，重试一次
          if (fallbackSrc && !hasError) {
            setHasError(true);
          } else {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}

/**
 * 简化版的头像组件
 */
export function IpfsAvatar({
  src,
  alt,
  size = "md",
  fallback,
  className,
  ...props
}: IpfsImageProps & {
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <IpfsImage
      src={src}
      alt={alt}
      fallback={fallback || <span className="text-2xl">👤</span>}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
      containerClassName={cn(
        "rounded-full overflow-hidden bg-muted",
        sizeClasses[size]
      )}
      {...props}
    />
  );
}

/**
 * 项目图标组件
 */
export function ProjectIcon({
  src,
  alt,
  size = "md",
  fallback,
  className,
  ...props
}: IpfsImageProps & {
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24 md:h-28 md:w-28",
    lg: "h-20 w-20 md:h-32 md:w-32",
    xl: "h-32 w-32 md:h-40 md:w-40",
  };

  return (
    <IpfsImage
      src={src}
      alt={alt}
      fallback={fallback || <span className="text-4xl">🧃</span>}
      className={cn("object-cover", className)}
      containerClassName={cn(
        "rounded-lg overflow-hidden bg-smoke-100 dark:bg-slate-700 flex items-center justify-center",
        sizeClasses[size]
      )}
      {...props}
    />
  );
}
