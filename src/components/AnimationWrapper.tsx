import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  margin?: string;
}

// 首次加载时的渐显动画组件
export function FadeInInitial({
  children,
  delay = 0,
  className = "",
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        delay,
        ease: "easeOut", // 更平滑的缓动曲线
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 滚动时触发的渐显动画组件
export function FadeInScroll({
  children,
  className = "",
  margin = "0px",
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin, amount: 0.2 }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
