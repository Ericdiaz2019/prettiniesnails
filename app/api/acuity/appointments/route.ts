import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { AcuityApiError, createAppointment, isAcuityConfigured } from "@/lib/acuity"

export const dynamic = "force-dynamic"

const fieldAnswerSchema = z.object({
  id: z.number().int().positive(),
  value: z.string().max(4000),
})

const createAppointmentSchema = z.object({
  appointmentTypeID: z.number().int().positive(),
  datetime: z.string().min(10, "Please select an appointment time."),
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(40),
  timezone: z.string().trim().min(1).max(100).optional(),
  calendarID: z.number().int().positive().optional(),
  addonIDs: z.array(z.number().int().positive()).max(20).optional(),
  fields: z.array(fieldAnswerSchema).max(100).optional(),
})

export async function POST(request: NextRequest) {
  if (!isAcuityConfigured()) {
    return NextResponse.json(
      { error: "Acuity Scheduling API is not configured yet.", code: "not_configured" },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 })
  }

  const parsed = createAppointmentSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Please check your booking details."
    return NextResponse.json(
      { error: firstIssue, details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const appointment = await createAppointment(parsed.data)
    return NextResponse.json({ appointment }, { status: 201 })
  } catch (err) {
    if (err instanceof AcuityApiError) {
      const lowerMsg = err.message.toLowerCase()
      const isUnavailable =
        err.errorCode === "not_available" ||
        lowerMsg.includes("not available") ||
        lowerMsg.includes("no longer available")

      if (isUnavailable) {
        return NextResponse.json(
          {
            error: "That time slot was just taken. Please pick another available time.",
            code: "not_available",
          },
          { status: 409 },
        )
      }

      return NextResponse.json(
        { error: err.message, code: err.errorCode || "acuity_error" },
        { status: err.status >= 400 && err.status < 500 ? err.status : 502 },
      )
    }

    return NextResponse.json(
      { error: "Something went wrong while confirming your appointment. Please try again." },
      { status: 500 },
    )
  }
}
