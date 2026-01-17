import { useState, ReactNode } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useEnsName } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BLOCK_EXPLORER_URL } from "@/config/constants";

interface CopyableTextProps {
  /** 要展示的文本内容 */
  text: string;
  /** 显示的文本，如果不提供则使用 text */
  displayText?: string;
  /** 是否支持复制 */
  copyable?: boolean;
  /** 复制成功的提示文本 */
  copySuccessTitle?: string;
  /** 复制成功的描述文本 */
  copySuccessDescription?: string;
  /** 是否显示为链接 */
  href?: string;
  /** 是否在新标签页打开链接 */
  openInNewTab?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** Tooltip 内容的样式类名 */
  tooltipClassName?: string;
  /** 是否使用 code 标签包裹 */
  asCode?: boolean;
  /** 自定义 Tooltip 内容，如果提供则忽略默认的完整文本展示 */
  tooltipContent?: ReactNode;
  /** 是否显示外部链接图标 */
  showExternalIcon?: boolean;
}

export default function CopyableText({
  text,
  displayText,
  copyable = true,
  copySuccessTitle = "Copied",
  copySuccessDescription = "Content has been copied to clipboard",
  href,
  openInNewTab = true,
  className,
  tooltipClassName,
  asCode = true,
  tooltipContent,
  showExternalIcon = true,
}: CopyableTextProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // 复制文本到剪贴板
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: copySuccessTitle,
      description: copySuccessDescription,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const display = displayText || text;

  const baseClassName = cn(
    "px-2 py-1 rounded bg-muted text-xs transition-colors inline-flex items-center gap-1",
    href && "hover:bg-muted/80 hover:text-primary cursor-pointer no-underline",
    className
  );

  // 构建显示内容
  const content = (
    <>
      {display}
      {href && showExternalIcon && openInNewTab && (
        <ExternalLink className="h-3 w-3" />
      )}
    </>
  );

  // 构建触发元素
  let triggerElement;
  if (href) {
    triggerElement = (
      <a
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        className={baseClassName}
      >
        {content}
      </a>
    );
  } else if (asCode) {
    triggerElement = <code className={baseClassName}>{content}</code>;
  } else {
    triggerElement = <span className={baseClassName}>{content}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
      <TooltipContent
        className={cn("flex items-center gap-2 max-w-md", tooltipClassName)}
      >
        {tooltipContent ? (
          tooltipContent
        ) : (
          <>
            <div className="text-xs break-all flex-1">
              {asCode ? <code>{text}</code> : text}
            </div>
            {copyable && (
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded transition-all shrink-0 group"
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary-foreground group-hover:scale-110 transition-all" />
                )}
              </button>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * 专门用于地址展示的便捷组件（支持 ENS）
 */
export function AddressDisplay({
  address,
  showLink = true,
  explorerUrl = `${BLOCK_EXPLORER_URL}/address`,
  format = "short",
  className,
  showEns = true,
}: {
  address: string;
  showLink?: boolean;
  explorerUrl?: string;
  format?: "short" | "full";
  className?: string;
  /** 是否显示 ENS 名称（如果存在） */
  showEns?: boolean;
}) {
  // 使用 wagmi 的 useEnsName hook 获取 ENS 名称
  // 注意：ENS 主要在主网上使用，Sepolia 测试网可能没有 ENS
  // 如果需要在主网查询，需要指定 chainId: 1
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1, // 在主网查询 ENS，因为 Sepolia 测试网没有 ENS
    query: {
      enabled: showEns && !!address, // 只在启用 ENS 且地址存在时查询
      // 禁用自动重试，减少不必要的网络请求
      retry: false,
      // 设置较长的缓存时间，避免重复查询
      staleTime: 1000 * 60 * 60, // 1 小时
    },
  });

  // 优先显示 ENS 名称，如果没有则显示地址
  const displayText = ensName
    ? ensName
    : format === "short"
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  return (
    <CopyableText
      text={address}
      displayText={displayText}
      href={showLink ? `${explorerUrl}/${address}` : undefined}
      copySuccessTitle="Address Copied"
      copySuccessDescription="Address has been copied to clipboard"
      className={className}
      showExternalIcon={false}
      // 不使用自定义 tooltipContent，让默认行为显示完整地址和复制按钮
    />
  );
}
