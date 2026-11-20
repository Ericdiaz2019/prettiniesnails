import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { AcuityApiError, getAvailableTimes, isAcuityConfigured } from "@/lib/acuity"

export const dynamic = "force-dynamic"

const querySchema = z.object({
  appointmentTypeID: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be formatted as YYYY-MM-DD"),
  timezone: z.string().min(1).optional(),
  calendarID: z.coerce.number().int().positive().optional(),
})

function parseAddonIds(searchParams: URLSearchParams): number[] {
  const rawValues = [
    ...searchParams.getAll("addonIDs"),
    ...searchParams.getAll("addonIDs[]"),
  ]
  const ids = rawValues
    .flatMap((v) => v.split(","))
    .map((v) => Number.parseInt(v.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)
  return Array.from(new Set(ids))
}

export async function GET(request: NextRequest) {
  if (!isAcuityConfigured()) {
    return NextResponse.json(
      { error: "Acuity Scheduling API is not configured yet.", code: "not_configured" },
      { status: 503 },
    )
  }

  const { searchParams } = request.nextUrl
  const parsed = querySchema.safeParse({
    appointmentTypeID: searchParams.get("appointmentTypeID"),
    date: searchParams.get("date"),
    timezone: searchParams.get("timezone") || undefined,
    calendarID: searchParams.get("calendarID") || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid availability times request.", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const addonIDs = parseAddonIds(searchParams)

  try {
    const times = await getAvailableTimes({
      ...parsed.data,
      addonIDs,
    })
    return NextResponse.json({ times }, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    if (err instanceof AcuityApiError) {
      return NextResponse.json(
        { error: err.message, code: err.errorCode },
        { status: err.status >= 400 && err.status < 500 ? err.status : 502 },
      )
    }
    return NextResponse.json(
      { error: "Failed to load available times from Acuity." },
      { status: 500 },
    )
  }
}
