import { ReactNode } from "react";
import { NavMenu } from "./NavMenu";
import { WalletButton } from "./WalletButton";

interface LayoutProps {
  children: ReactNode;
  variant?:
    | "default"
    | "portfolio"
    | "crowdfunding"
    | "gogoga"
    | "resume"
    | "lesson";
}

export default function Layout({ children, variant = "default" }: LayoutProps) {
  if (variant === "portfolio") {
    return (
      <main className="min-h-screen max-w-xl py-10 px-5 mx-auto my-0 font-sans bg-background">
        <NavMenu />
        {children}
      </main>
    );
  }

  if (variant === "crowdfunding") {
    return (
      <main className="relative min-h-screen max-w-4xl py-4 px-5 mx-auto my-0 bg-background">
        <NavMenu />
        <WalletButton />
        <div className="flex flex-col">{children}</div>
      </main>
    );
  }

  if (variant === "gogoga") {
    return (
      <main className="relative min-h-screen max-w-3xl py-4 px-5 mx-auto my-0 bg-background">
        <NavMenu />
        <WalletButton />
        <div className="flex flex-col">{children}</div>
      </main>
    );
  }

  if (variant === "resume") {
    return (
      <main className="min-h-screen bg-background font-sans">
        <NavMenu />
        {children}
      </main>
    );
  }

  if (variant === "lesson") {
    return (
      <main className="min-h-screen max-w-6xl py-10 px-6 mx-auto my-0 font-sans bg-background">
        <NavMenu />
        {children}
      </main>
    );
  }

  return (
    <div className="relative min-h-screen max-w-4xl py-4 px-5 mx-auto my-0 bg-background">
      <NavMenu />
      <WalletButton />
      <main className="flex-1">{children}</main>
    </div>
  );
}
