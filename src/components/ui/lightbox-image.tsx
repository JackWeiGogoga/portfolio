import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LightboxImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  buttonClassName?: string;
  imageClassName?: string;
  captionClassName?: string;
}

export function LightboxImage({
  src,
  alt,
  caption,
  className,
  buttonClassName,
  imageClassName,
  captionClassName,
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <figure className={cn("space-y-3", className)}>
      <button
        type="button"
        className={cn(
          "group relative block w-full overflow-hidden rounded-lg border border-outline bg-card-background",
          "transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring  cursor-zoom-in",
          buttonClassName
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Open image in full size"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]",
            imageClassName
          )}
        />
      </button>

      {caption ? (
        <figcaption className={cn("text-sm text-graytext", captionClassName)}>
          {caption}
        </figcaption>
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white text-sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
          <div
            className="flex w-full max-w-5xl flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-full rounded-xl border border-outline bg-background object-contain"
            />
            {caption ? (
              <div className="text-center text-sm text-white/80">{caption}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </figure>
  );
}
