import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "default" | "destructive";
}

export default function ErrorMessage({
  title = "出错了",
  message,
  onRetry,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <Alert variant={variant} className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              重试
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

// 空状态组件
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?:
    | {
        label: string;
        onClick: () => void;
      }
    | React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon || <XCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <>
          {typeof action === "object" && "label" in action ? (
            <Button onClick={action.onClick} variant="default">
              {action.label}
            </Button>
          ) : (
            action
          )}
        </>
      )}
    </div>
  );
}
