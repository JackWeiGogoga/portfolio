import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { wagmiConfig } from "@/config/wagmi";
import { useChainGuard } from "@/hooks/useChainGuard";
import { ROUTES } from "@/config/constants";

// Pages
import Home from "@/pages/Home";
import Resume from "@/pages/Resume";
import SideProjectsPage from "@/pages/side-projects";
import WhatIsItPage from "@/pages/what-is-it";
import JvmLessonPage from "@/pages/what-is-it/jvm";
import JavaLocksLessonPage from "@/pages/what-is-it/java-locks";
import {
  CrowdfundingProject,
  CrowdfundingProjectDetail,
  GogogaTokenProject,
  GogogaNft,
  VotingPage,
} from "@/pages/sideprojects";

import "@rainbow-me/rainbowkit/styles.css";
import Flowlet from "@/pages/works/Flowlet";

const queryClient = new QueryClient();

// 内部组件，用于添加链守卫
function AppContent() {
  // 使用链守卫防止用户切换到主网
  useChainGuard();

  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={ROUTES.RESUME} element={<Resume />} />
          <Route path={ROUTES.SIDE_PROJECTS} element={<SideProjectsPage />} />
          <Route path={ROUTES.WHAT_IS_IT} element={<WhatIsItPage />} />
          <Route path={ROUTES.WHAT_IS_IT_JVM} element={<JvmLessonPage />} />
          <Route
            path={ROUTES.WHAT_IS_IT_JAVA_LOCKS}
            element={<JavaLocksLessonPage />}
          />

          <Route path={ROUTES.WORK_FLOWLET} element={<Flowlet />} />

          <Route path={ROUTES.PROJECTS} element={<CrowdfundingProject />} />
          <Route
            path={`${ROUTES.PROJECT_DETAIL}/:address`}
            element={<CrowdfundingProjectDetail />}
          />
          <Route path={ROUTES.GOGOGA_TOKEN} element={<GogogaTokenProject />} />
          <Route path={ROUTES.GOGOGA_NFT} element={<GogogaNft />} />
          <Route path={ROUTES.VOTING} element={<VotingPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
