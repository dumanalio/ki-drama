import { MediaLibrary } from "@/components/admin/medien/media-library";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getMediaLibrary } from "@/lib/queries/admin-media";

export default async function AdminMedienPage() {
  let media: Awaited<ReturnType<typeof getMediaLibrary>> = [];
  let loadError = false;

  try {
    media = await getMediaLibrary();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader title="Medien" />

      {loadError ? (
        <ErrorState
          title="Medienbibliothek konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : (
        <MediaLibrary initialMedia={media} />
      )}
    </>
  );
}
