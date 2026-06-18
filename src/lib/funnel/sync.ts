/* ============================================================
   FUNNEL SYNC - Poll main app for user lifecycle events
   ============================================================
   Calls the main app's internal API to get new signups,
   first AI uses, and Pro upgrades. Upserts FunnelEvent records
   with deduplication by userId + eventType.
   ============================================================ */

import { prisma } from "@/lib/prisma";

// # Shape of events returned by the main app's internal API
interface RemoteFunnelEvent {
  userId: string;
  email: string;
  eventType: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  eventDate: string;
  metadata: Record<string, unknown> | null;
}

// # Sync funnel events from the main app
export async function syncFunnelEvents(): Promise<{ synced: number; errors: number }> {
  // # Read connection details from environment variables
  const apiUrl = process.env.JOBPILOT_API_URL;
  const apiSecret = process.env.JOBPILOT_API_SECRET;

  if (!apiUrl || !apiSecret) {
    console.error("JOBPILOT_API_URL or JOBPILOT_API_SECRET not configured");
    return { synced: 0, errors: 1 };
  }

  // # Find the most recent event date to use as "since" parameter
  const lastEvent = await prisma.funnelEvent.findFirst({
    orderBy: { eventDate: "desc" },
  });
  // # Default to 30 days ago if no events exist yet
  const since = lastEvent?.eventDate?.toISOString()
    || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let synced = 0;
  let errors = 0;

  try {
    // # Fetch events from the main app since the last known event
    const res = await fetch(
      `${apiUrl}/api/internal/funnel-events?since=${encodeURIComponent(since)}`,
      {
        headers: { Authorization: `Bearer ${apiSecret}` },
        // # No caching for sync calls — always get fresh data
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(`Funnel sync failed: ${res.status} ${res.statusText}`);
      return { synced: 0, errors: 1 };
    }

    const events: RemoteFunnelEvent[] = await res.json();

    // # Upsert each event — deduplicate by userId + eventType
    for (const evt of events) {
      try {
        await prisma.funnelEvent.upsert({
          where: {
            // # Composite unique key defined in Prisma schema
            userId_eventType: { userId: evt.userId, eventType: evt.eventType },
          },
          update: {
            // # Update all fields in case data changed
            email: evt.email,
            utmSource: evt.utmSource,
            utmMedium: evt.utmMedium,
            utmCampaign: evt.utmCampaign,
            utmTerm: evt.utmTerm,
            utmContent: evt.utmContent,
            // # Metadata is stored as a JSON string in the DB
            metadata: evt.metadata ? JSON.stringify(evt.metadata) : null,
            eventDate: new Date(evt.eventDate),
          },
          create: {
            userId: evt.userId,
            email: evt.email,
            eventType: evt.eventType,
            utmSource: evt.utmSource,
            utmMedium: evt.utmMedium,
            utmCampaign: evt.utmCampaign,
            utmTerm: evt.utmTerm,
            utmContent: evt.utmContent,
            metadata: evt.metadata ? JSON.stringify(evt.metadata) : null,
            eventDate: new Date(evt.eventDate),
          },
        });
        synced++;
      } catch (err) {
        console.error(`Failed to upsert event for ${evt.userId}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error("Funnel sync fetch failed:", err);
    return { synced: 0, errors: 1 };
  }

  return { synced, errors };
}
