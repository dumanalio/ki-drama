import { createDraftPost } from "@/lib/actions/posts";

export default async function NewPostPage() {
  await createDraftPost();
  return null;
}
