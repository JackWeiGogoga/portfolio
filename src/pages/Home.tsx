import { Suspense } from "react";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import NewPost from "@/components/NewPost";
import Profile from "@/components/Profile";
import Works from "@/components/Works";
import Skills from "@/components/Skills";
import SideProjects from "@/components/SideProjects";
import Experiences from "@/components/Experiences";
import Contact from "@/components/Contact";
import { FadeInInitial, FadeInScroll } from "@/components/AnimationWrapper";

export default function Home() {
  return (
    <Layout variant="portfolio">
      <div className="flex flex-col">
        {/* 首次加载时自动显示的内容 - 不需要滚动 */}
        <FadeInInitial delay={0.1}>
          <Profile />
        </FadeInInitial>

        {/* NewPost 使用 Suspense 包裹，避免动画容器影响异步加载 */}
        <Suspense fallback={null}>
          <FadeInInitial delay={0.3}>
            <NewPost />
          </FadeInInitial>
        </Suspense>

        <FadeInInitial delay={0.5}>
          <Intro />
        </FadeInInitial>

        <FadeInInitial delay={0.5}>
          <Skills />
        </FadeInInitial>

        {/* 滚动时才显示的内容 */}
        <FadeInScroll>
          <Works />
        </FadeInScroll>

        <FadeInScroll>
          <SideProjects />
        </FadeInScroll>

        <FadeInScroll>
          <Experiences />
        </FadeInScroll>

        <FadeInScroll margin="-100px">
          <Contact />
        </FadeInScroll>

        <FadeInScroll margin="-50px">
          <Footer />
        </FadeInScroll>
      </div>
    </Layout>
  );
}
