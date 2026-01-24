import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Post {
  title: string;
  pubDate: string;
  link: string;
}

async function getLatestPost(locale: string): Promise<Post | null> {
  try {
    // 添加超时控制，避免长时间等待
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://jackwei996.substack.com/feed",
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return {
        title: data.items[0].title,
        pubDate: new Date(data.items[0].pubDate).toLocaleDateString(locale),
        link: data.items[0].link,
      };
    }
    return null;
  } catch (error) {
    console.warn("Unable to fetch Substack post:", error);
    return null;
  }
}

export default function NewPost() {
  const { t, i18n } = useTranslation("home");
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = i18n.language.startsWith("zh") ? "zh-CN" : "en-US";

  useEffect(() => {
    getLatestPost(locale)
      .then((post) => {
        setLatestPost(post);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [locale]);

  if (loading || !latestPost) return null;

  return (
    <div className="bg-muted px-3 py-2 rounded-md my-5 font-mono border border-outline w-fit text-xs">
      <span className="text-graytext">{latestPost.pubDate} - </span>
      <span>
        {t("newPost.label")}{" "}
        <a
          href={latestPost.link}
          className="hover:underline cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
        >
          {latestPost.title}
        </a>
      </span>
    </div>
  );
}
