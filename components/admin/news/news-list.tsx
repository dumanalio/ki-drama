"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import { deletePost } from "@/lib/actions/posts";
import { formatBerlin } from "@/lib/time";
import type { Post } from "@/types/database";

const STATUS_LABELS: Record<Post["status"], string> = {
  entwurf: "Entwurf",
  veroeffentlicht: "Veröffentlicht",
};

function PostRow({ post }: { post: Post }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deletePost(post.id);
      if (result.ok) {
        setConfirmOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <tr className="border-line border-b last:border-b-0">
      <td className="px-4 py-3">
        <div className="bg-surface-alt relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {post.cover_url ? (
            <Image
              src={post.cover_url}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <ImageOff className="text-ink-muted size-5" aria-hidden="true" />
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/admin/news/${post.id}`}
          className="text-ink hover:text-accent focus-visible:ring-accent rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {post.title || "Ohne Titel"}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="text-ink-soft text-[14px]">{post.category}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={post.status === "veroeffentlicht" ? "success" : "soft"}>
          {STATUS_LABELS[post.status]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-ink-soft text-[14px]">
          {formatBerlin(post.published_at ?? post.updated_at, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/news/${post.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Bearbeiten
          </Link>
          <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
            <ModalTrigger
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Beitrag löschen"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ModalTrigger>
            <ModalContent
              title="Beitrag löschen?"
              footer={
                <>
                  <ModalClose
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Zurück
                  </ModalClose>
                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    Ja, löschen
                  </Button>
                </>
              }
            >
              Dieser Beitrag wird endgültig gelöscht. Das lässt sich nicht
              rückgängig machen.
            </ModalContent>
          </Modal>
        </div>
        {error ? (
          <p role="alert" className="text-danger mt-1.5 text-[13px]">
            {error}
          </p>
        ) : null}
      </td>
    </tr>
  );
}

export function NewsList({ posts }: { posts: Post[] }) {
  return (
    <div className="border-line overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-line bg-surface-alt border-b">
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Cover
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Titel
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Kategorie
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Status
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Datum
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
