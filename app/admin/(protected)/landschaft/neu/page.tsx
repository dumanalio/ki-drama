import { createDraftTool } from "@/lib/actions/tools";

export default async function NewToolPage() {
  await createDraftTool();
  return null;
}
