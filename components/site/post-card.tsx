import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { isVideoPath } from "@/lib/media-constants";
import { formatBerlin } from "@/lib/time";
import type { Post } from "@/types/database";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group border-line bg-surface shadow-card hover:border-line-strong flex flex-col overflow-hidden rounded-xl border transition-colors duration-[120ms]"
    >
      <div className="bg-surface-alt aspect-16/9 w-full overflow-hidden">
        {post.cover_url && isVideoPath(post.cover_url) ? (
          <video
            src={post.cover_url}
            muted
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? ""}
            width={600}
            height={338}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Badge variant="soft" className="self-start">
          {post.category}
        </Badge>
        <h3 className="text-ink group-hover:text-accent text-[18px] font-semibold tracking-[-0.01em]">
          {post.title}
        </h3>
        <p className="text-ink-soft line-clamp-3 flex-1 text-[15px] leading-relaxed">
          {post.excerpt}
        </p>
        <div className="text-ink-muted text-[14px]">
          {post.published_at ? formatBerlin(post.published_at) : null}
          {post.published_at ? " · " : null}
          {post.reading_min} Min. Lesezeit
        </div>
      </div>
    </Link>
  );
}
