// 隐藏 number input 的加减按钮
export const numberInputStyles = `
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`;

// 格式化错误信息，让其更人性化
export const formatErrorMessage = (error: Error | null): string => {
  if (!error) return "Transaction failed";

  const message = error.message;

  if (message.includes("User rejected") || message.includes("User denied")) {
    return "Transaction cancelled by user";
  }

  if (message.includes("denied request signature")) {
    return "Transaction cancelled by user";
  }

  if (message.includes("insufficient funds")) {
    return "Insufficient funds for transaction";
  }

  if (message.includes("gas required exceeds")) {
    return "Transaction may fail - insufficient gas";
  }

  const firstLine = message.split("\n")[0];

  if (firstLine.length > 100) {
    if (message.includes("Details:")) {
      const details = message.split("Details:")[1]?.split("\n")[0]?.trim();
      if (details) return details;
    }
    if (message.includes("Error:")) {
      const errorPart = message.split("Error:")[1]?.split("\n")[0]?.trim();
      if (errorPart) return errorPart;
    }

    return `${firstLine.substring(0, 100)}...`;
  }

  return firstLine;
};

export const formatNumber = (value: string | number, decimals: number = 2) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
