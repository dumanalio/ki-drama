import { AvailabilityEditor } from "@/components/admin/termine/availability-editor";
import { BookingList } from "@/components/admin/termine/booking-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import {
  getAvailabilityEditorData,
  getBookingsList,
} from "@/lib/queries/admin-termine";

export default async function AdminTerminePage() {
  let bookings: Awaited<ReturnType<typeof getBookingsList>> = [];
  let editorData: Awaited<ReturnType<typeof getAvailabilityEditorData>> | null =
    null;
  let loadError = false;

  try {
    [bookings, editorData] = await Promise.all([
      getBookingsList(),
      getAvailabilityEditorData(),
    ]);
  } catch {
    loadError = true;
  }

  if (loadError || !editorData) {
    return (
      <>
        <AdminPageHeader title="Termine" />
        <ErrorState
          title="Termine konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Termine" />

      <Tabs defaultValue="buchungen">
        <TabsList>
          <TabsTab value="buchungen">Buchungen</TabsTab>
          <TabsTab value="verfuegbarkeit">Verfügbarkeit</TabsTab>
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="buchungen">
          <BookingList bookings={bookings} />
        </TabsPanel>

        <TabsPanel value="verfuegbarkeit">
          <AvailabilityEditor data={editorData} />
        </TabsPanel>
      </Tabs>
    </>
  );
}
