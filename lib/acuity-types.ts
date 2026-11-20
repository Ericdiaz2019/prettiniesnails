export const DEFAULT_STUDIO_TIMEZONE = "America/Indiana/Indianapolis"

export interface AcuityAppointmentTypeRaw {
  id: number
  active?: boolean
  name: string
  description?: string
  duration: number
  price?: string | number
  category?: string
  color?: string
  private?: boolean
  type?: string
  calendarIDs?: number[]
  addonIDs?: number[]
  image?: string
}

export interface AcuityAddonRaw {
  id: number
  name: string
  duration: number
  price?: string | number
  private?: boolean
  appointmentTypeIDs?: number[]
}

export type AcuityFieldType =
  | "textbox"
  | "text"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "checkboxlist"
  | "yesno"
  | "address"
  | "file"
  | "hidden"
  | string

export interface AcuityFormField {
  id: number
  name: string
  required: boolean
  type: AcuityFieldType
  options?: string[]
  lines?: number | string
}

export interface AcuityForm {
  id: number
  name: string
  description?: string
  hidden?: boolean
  appointmentTypeIDs: number[]
  fields: AcuityFormField[]
}

export interface AcuityCalendar {
  id: number
  name: string
  description?: string
  email?: string
  location?: string
  timezone?: string
  image?: string
}

export interface AcuityMeRaw {
  id: number
  name?: string
  timezone?: string
  schedulingPage?: string
  currency?: string
}

export interface BookingAddon {
  id: number
  name: string
  duration: number
  price: number
  priceFormatted: string
}

export interface BookingService {
  id: number
  name: string
  description: string
  duration: number
  durationFormatted: string
  price: number
  priceFormatted: string
  category: string
  calendarIDs: number[]
  addons: BookingAddon[]
  forms: AcuityForm[]
  image?: string
}

export interface AcuityCatalog {
  configured: boolean
  error?: string
  timezone: string
  services: BookingService[]
  categories: string[]
  calendars: AcuityCalendar[]
}

export interface AvailableTimeSlot {
  time: string
  slotsAvailable?: number
}

export interface AppointmentConfirmation {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  datetime: string
  date: string
  time: string
  endTime: string
  duration: string
  type: string
  appointmentTypeID: number
  price: string
  calendar: string
  calendarID?: number
  location?: string
  timezone: string
  confirmationPage?: string
  addonIDs?: number[]
}

/**
 * Normalizes Acuity ISO-8601 timezone offsets like "-0500" -> "-05:00"
 * so Safari/WebKit and older JS engines parse them cleanly.
 */
export function normalizeIsoOffset(iso: string): string {
  return iso.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
}

export function parsePrice(price: string | number | null | undefined): number {
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : 0
  }
  if (!price) return 0
  const cleaned = String(price).replace(/[^0-9.-]/g, "")
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatPrice(price: string | number | null | undefined): string {
  const num = parsePrice(price)
  if (num <= 0) {
    return "$0"
  }
  const isWhole = Math.abs(num - Math.round(num)) < 0.001
  return isWhole ? `$${Math.round(num)}` : `$${num.toFixed(2)}`
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return ""
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
  if (hrs > 0) return `${hrs}h`
  return `${mins}m`
}

export function formatMonthParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export function formatDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Parses a YYYY-MM-DD date string into a local noon Date object
 * to avoid UTC midnight off-by-one shifts across timezones.
 */
export function parseDateParam(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0)
}

export function formatSlotTime(iso: string, timezone: string): string {
  const parsed = new Date(normalizeIsoOffset(iso))
  if (Number.isNaN(parsed.getTime())) return iso
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(parsed)
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(parsed)
  }
}

export function formatLongDate(dateStrOrIso: string, timezone: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStrOrIso)
  const parsed = isDateOnly
    ? parseDateParam(dateStrOrIso)
    : new Date(normalizeIsoOffset(dateStrOrIso))
  if (Number.isNaN(parsed.getTime())) return dateStrOrIso
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      ...(isDateOnly ? {} : { timeZone: timezone }),
    }).format(parsed)
  } catch {
    return dateStrOrIso
  }
}

export function getTimezoneDisplay(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "long",
    }).formatToParts(new Date())
    const longName = parts.find((p) => p.type === "timeZoneName")?.value

    const shortParts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date())
    const shortName = shortParts.find((p) => p.type === "timeZoneName")?.value

    if (longName && shortName && longName !== shortName) {
      return `${longName} (${shortName})`
    }
    return longName || shortName || timezone
  } catch {
    return timezone
  }
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function toIcsUtcStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}T` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  )
}

export function buildIcsContent(
  confirmation: AppointmentConfirmation,
  fallbackLocation: string,
): string {
  const start = new Date(normalizeIsoOffset(confirmation.datetime))
  const durationMinutes = Number.parseInt(confirmation.duration, 10) || 60
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const location = confirmation.location || fallbackLocation
  const descriptionLines = [
    `Service: ${confirmation.type}`,
    confirmation.price ? `Estimated total: ${formatPrice(confirmation.price)} (pay at studio)` : "",
    confirmation.confirmationPage ? `Manage or reschedule: ${confirmation.confirmationPage}` : "",
    "Studio phone: (574) 596-9371",
  ].filter(Boolean)

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prettiness Nails//Acuity Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:acuity-${confirmation.id}@prettinessnails.com`,
    `DTSTAMP:${toIcsUtcStamp(new Date())}`,
    `DTSTART:${toIcsUtcStamp(start)}`,
    `DTEND:${toIcsUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(`Prettiness Nails — ${confirmation.type}`)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(descriptionLines.join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
