import { createDraftPage } from "@/lib/actions/pages";

export default async function NewPagePage() {
  await createDraftPage();
  return null;
}
