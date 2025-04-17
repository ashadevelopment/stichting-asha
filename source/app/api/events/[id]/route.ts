import { NextResponse, NextRequest } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Event from "../../../lib/models/Event"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/authOptions"
import { recordActivity } from "../../../lib/middleware/activityTracking"

function getIdFromUrl(request: NextRequest) {
  const url = new URL(request.url)
  const segments = url.pathname.split("/")
  return segments[segments.length - 1]
}

export async function GET(request: NextRequest) {
  const id = getIdFromUrl(request)
  await dbConnect()
  const event = await Event.findById(id)
  if (!event) {
    return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 })
  }
  return NextResponse.json(event)
}

export async function PUT(request: NextRequest) {
  // 1) Get the session
  const session = await getServerSession(authOptions)

  // 2) Guard: if no session or not an admin, bail out
  if (!session || session.user.role !== "beheerder") {
    return NextResponse.json(
      { error: "Geen toegang. Alleen beheerders kunnen evenementen bijwerken." },
      { status: 403 }
    )
  }

  // At this point TypeScript knows session is non‑null
  const id = getIdFromUrl(request)  // your helper to pull the [id] from the URL
  await dbConnect()

  const body = await request.json()
  // … validate body …

  const updatedEvent = await Event.findByIdAndUpdate(id, { $set: body }, { new: true })
  if (!updatedEvent) {
    return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 })
  }

  // 3) Record activity — session is guaranteed non‑null here
  await recordActivity({
    type: "update",
    entityType: "event",
    entityId: id,
    entityName: updatedEvent.title,
    performedBy: session.user.id || "unknown",       
    performedByName: session.user.name || "Onbekend",
  })

  return NextResponse.json(updatedEvent)
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "beheerder") {
    return NextResponse.json(
      { error: "Geen toegang. Alleen beheerders kunnen evenementen verwijderen." },
      { status: 403 }
    )
  }

  const id = getIdFromUrl(request)
  await dbConnect()

  const toDelete = await Event.findById(id)
  if (!toDelete) {
    return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 })
  }

  await Event.findByIdAndDelete(id)

  await recordActivity({
    type: "delete",
    entityType: "event",
    entityId: id,
    entityName: toDelete.title,
    performedBy: session.user.id || "unknown",
    performedByName: session.user.name || "Onbekend",
  })

  return NextResponse.json({ success: true })
}