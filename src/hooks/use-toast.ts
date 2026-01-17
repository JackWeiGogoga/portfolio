import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
};

export const useToast = () => {
  const toast = useCallback((props: ToastProps) => {
    const { title, description, variant = "default" } = props;

    // 根据不同的 variant 配置不同的样式
    const getToastOptions = () => {
      const baseClassNames = {
        description: "!text-current/90",
      };

      switch (variant) {
        case "destructive":
          return {
            description,
            classNames: {
              ...baseClassNames,
              toast:
                "!bg-red-50 !border-red-200 dark:!bg-red-950/50 dark:!border-red-800/50",
              title: "!text-red-900 dark:!text-red-100",
              description: "!text-red-800/90 dark:!text-red-200/90",
              icon: "!text-red-600 dark:!text-red-400",
            },
          };
        case "success":
          return {
            description,
            classNames: {
              ...baseClassNames,
              toast:
                "!bg-green-50 !border-green-200 dark:!bg-green-950/50 dark:!border-green-800/50",
              title: "!text-green-900 dark:!text-green-100",
              description: "!text-green-800/90 dark:!text-green-200/90",
              icon: "!text-green-600 dark:!text-green-400",
            },
          };
        case "info":
          return {
            description,
            classNames: {
              ...baseClassNames,
              toast:
                "!bg-blue-50 !border-blue-200 dark:!bg-blue-950/50 dark:!border-blue-800/50",
              title: "!text-blue-900 dark:!text-blue-100",
              description: "!text-blue-800/90 dark:!text-blue-200/90",
              icon: "!text-blue-600 dark:!text-blue-400",
            },
          };
        case "warning":
          return {
            description,
            classNames: {
              ...baseClassNames,
              toast:
                "!bg-amber-50 !border-amber-200 dark:!bg-amber-950/50 dark:!border-amber-800/50",
              title: "!text-amber-900 dark:!text-amber-100",
              description: "!text-amber-800/90 dark:!text-amber-200/90",
              icon: "!text-amber-600 dark:!text-amber-400",
            },
          };
        default:
          return {
            description,
            classNames: {
              ...baseClassNames,
              toast:
                "!bg-gray-50 !border-gray-200 dark:!bg-gray-900/50 dark:!border-gray-700/50",
              title: "!text-gray-900 dark:!text-gray-100",
              description: "!text-gray-700/90 dark:!text-gray-300/90",
            },
          };
      }
    };

    const toastOptions = getToastOptions();

    switch (variant) {
      case "destructive":
        sonnerToast.error(title, toastOptions);
        break;
      case "success":
        sonnerToast.success(title, toastOptions);
        break;
      case "info":
        sonnerToast.info(title, toastOptions);
        break;
      case "warning":
        sonnerToast.warning(title, toastOptions);
        break;
      default:
        sonnerToast(title, toastOptions);
    }
  }, []);

  return { toast };
};
