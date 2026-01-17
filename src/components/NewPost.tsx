import { useEffect, useState } from "react";

interface Post {
  title: string;
  pubDate: string;
  link: string;
}

async function getLatestPost(): Promise<Post | null> {
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
        pubDate: new Date(data.items[0].pubDate).toLocaleDateString(),
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
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestPost()
      .then((post) => {
        setLatestPost(post);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !latestPost) return null;

  return (
    <div className="bg-muted px-3 py-2 rounded-md my-5 font-mono border border-outline w-fit text-xs">
      <span className="text-graytext">{latestPost.pubDate} - </span>
      <span>
        New post:{" "}
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
