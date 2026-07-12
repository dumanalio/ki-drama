import { NextResponse } from "next/server";

import { getAvailability } from "@/lib/queries/availability";

export async function GET() {
  try {
    const availability = await getAvailability();
    return NextResponse.json({
      availability: Object.fromEntries(availability),
    });
  } catch (error) {
    console.error("[api/availability] Fehler:", error);
    return NextResponse.json(
      { error: "Verfügbarkeit konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}
