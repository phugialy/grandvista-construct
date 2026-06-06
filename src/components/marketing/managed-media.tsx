import Image from "next/image";

type ManagedMediaProps = {
  altFallback: string;
  className?: string;
  media?: {
    public_url: string;
    media_type: "image" | "video";
    alt_text: string | null;
  } | null;
  priority?: boolean;
  sizes?: string;
  videoControls?: boolean;
};

export function ManagedMedia({
  altFallback,
  className = "object-cover",
  media,
  priority = false,
  sizes = "100vw",
  videoControls = false,
}: ManagedMediaProps) {
  if (!media?.public_url) {
    return null;
  }

  if (media.media_type === "video") {
    return (
      <video
        autoPlay={!videoControls}
        className={`absolute inset-0 h-full w-full ${className}`}
        controls={videoControls}
        loop={!videoControls}
        muted
        playsInline
        src={media.public_url}
      />
    );
  }

  return (
    <Image
      alt={media.alt_text ?? altFallback}
      className={className}
      fill
      priority={priority}
      sizes={sizes}
      src={media.public_url}
    />
  );
}
