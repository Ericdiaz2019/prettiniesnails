import {
  DEFAULT_STUDIO_TIMEZONE,
  formatDuration,
  formatPrice,
  parsePrice,
  type AcuityAddonRaw,
  type AcuityAppointmentTypeRaw,
  type AcuityCalendar,
  type AcuityCatalog,
  type AcuityForm,
  type AcuityMeRaw,
  type AppointmentConfirmation,
  type AvailableTimeSlot,
  type BookingAddon,
  type BookingService,
} from "@/lib/acuity-types"

const ACUITY_API_BASE = "https://acuityscheduling.com/api/v1"

export class AcuityApiError extends Error {
  readonly status: number
  readonly errorCode?: string

  constructor(message: string, status: number, errorCode?: string) {
    super(message)
    this.name = "AcuityApiError"
    this.status = status
    this.errorCode = errorCode
  }
}

export function isAcuityConfigured(): boolean {
  return Boolean(process.env.ACUITY_USER_ID?.trim() && process.env.ACUITY_API_KEY?.trim())
}

function getAuthHeader(): string {
  const userId = process.env.ACUITY_USER_ID?.trim()
  const apiKey = process.env.ACUITY_API_KEY?.trim()

  if (!userId || !apiKey) {
    throw new AcuityApiError(
      "Acuity Scheduling API credentials are not configured.",
      503,
      "not_configured",
    )
  }

  const token = Buffer.from(`${userId}:${apiKey}`).toString("base64")
  return `Basic ${token}`
}

type QueryParamValue = string | number | boolean | Array<string | number> | undefined | null

interface AcuityFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  query?: Record<string, QueryParamValue>
  body?: unknown
  /** Seconds to revalidate in Next.js cache, or false to disable caching (default: false). */
  revalidate?: number | false
}

export async function acuityFetch<T>(
  path: string,
  options: AcuityFetchOptions = {},
): Promise<T> {
  const { method = "GET", query, body, revalidate = false } = options
  const url = new URL(`${ACUITY_API_BASE}${path.startsWith("/") ? path : `/${path}`}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(`${key}[]`, String(item))
        }
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: Record<string, string> = {
    Authorization: getAuthHeader(),
    Accept: "application/json",
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  const init: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }

  if (method === "GET" && typeof revalidate === "number" && revalidate > 0) {
    init.next = { revalidate }
  } else {
    init.cache = "no-store"
  }

  const response = await fetch(url.toString(), init)
  const text = await response.text()

  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = null
    }
  }

  if (!response.ok) {
    const errObj =
      parsed && typeof parsed === "object"
        ? (parsed as { message?: string; error?: string; status_code?: number })
        : null
    const message =
      errObj?.message ||
      (response.status === 401
        ? "Acuity API authentication failed. Check ACUITY_USER_ID and ACUITY_API_KEY."
        : `Acuity API request failed (${response.status}).`)
    throw new AcuityApiError(message, response.status, errObj?.error)
  }

  return parsed as T
}

function resolveAddonsForService(
  service: AcuityAppointmentTypeRaw,
  allAddons: AcuityAddonRaw[],
): BookingAddon[] {
  const publicAddons = allAddons.filter((addon) => !addon.private)
  const serviceAddonIds = Array.isArray(service.addonIDs) ? service.addonIDs : null

  const matched = publicAddons.filter((addon) => {
    if (serviceAddonIds && serviceAddonIds.length > 0) {
      return serviceAddonIds.includes(addon.id)
    }
    if (Array.isArray(addon.appointmentTypeIDs) && addon.appointmentTypeIDs.length > 0) {
      return addon.appointmentTypeIDs.includes(service.id)
    }
    return false
  })

  return matched.map((addon) => {
    const price = parsePrice(addon.price)
    return {
      id: addon.id,
      name: addon.name,
      duration: Number(addon.duration) || 0,
      price,
      priceFormatted: formatPrice(price),
    }
  })
}

function resolveFormsForService(serviceId: number, allForms: AcuityForm[]): AcuityForm[] {
  return allForms
    .filter((form) => !form.hidden)
    .filter((form) => {
      const ids = Array.isArray(form.appointmentTypeIDs) ? form.appointmentTypeIDs : []
      return ids.length === 0 || ids.includes(serviceId)
    })
    .map((form) => ({
      ...form,
      fields: (form.fields || []).filter((field) => field.type !== "hidden"),
    }))
    .filter((form) => form.fields.length > 0)
}

export async function getAcuityCatalog(): Promise<AcuityCatalog> {
  const fallbackTimezone = process.env.ACUITY_TIMEZONE?.trim() || DEFAULT_STUDIO_TIMEZONE

  if (!isAcuityConfigured()) {
    return {
      configured: false,
      timezone: fallbackTimezone,
      services: [],
      categories: [],
      calendars: [],
    }
  }

  try {
    const [appointmentTypes, addons, forms, calendars, me] = await Promise.all([
      acuityFetch<AcuityAppointmentTypeRaw[]>("/appointment-types", { revalidate: 120 }),
      acuityFetch<AcuityAddonRaw[]>("/appointment-addons", { revalidate: 120 }).catch(() => []),
      acuityFetch<AcuityForm[]>("/forms", { revalidate: 120 }).catch(() => []),
      acuityFetch<AcuityCalendar[]>("/calendars", { revalidate: 120 }).catch(() => []),
      acuityFetch<AcuityMeRaw>("/me", { revalidate: 300 }).catch(() => null),
    ])

    const resolvedTimezone =
      process.env.ACUITY_TIMEZONE?.trim() ||
      calendars.find((c) => c.timezone)?.timezone ||
      me?.timezone ||
      DEFAULT_STUDIO_TIMEZONE

    const publicTypes = (Array.isArray(appointmentTypes) ? appointmentTypes : []).filter(
      (item) =>
        item &&
        item.private !== true &&
        item.active !== false &&
        item.type !== "class",
    )

    const hasAnyCategory = publicTypes.some((t) => Boolean(t.category?.trim()))
    const categories: string[] = []

    const services: BookingService[] = publicTypes.map((raw) => {
      const category = raw.category?.trim() || (hasAnyCategory ? "Other Services" : "Services")
      if (!categories.includes(category)) {
        categories.push(category)
      }

      const price = parsePrice(raw.price)
      const duration = Number(raw.duration) || 0

      return {
        id: raw.id,
        name: raw.name.trim(),
        description: raw.description?.trim() || "",
        duration,
        durationFormatted: formatDuration(duration),
        price,
        priceFormatted: formatPrice(price),
        category,
        calendarIDs: Array.isArray(raw.calendarIDs) ? raw.calendarIDs : [],
        addons: resolveAddonsForService(raw, Array.isArray(addons) ? addons : []),
        forms: resolveFormsForService(raw.id, Array.isArray(forms) ? forms : []),
        image: raw.image || undefined,
      }
    })

    const preferredOrder = ["acrylic full sets", "acrylic fills"]
    const orderedCategories = [...categories].sort((a, b) => {
      const idxA = preferredOrder.indexOf(a.toLowerCase())
      const idxB = preferredOrder.indexOf(b.toLowerCase())
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return 0
    })

    return {
      configured: true,
      timezone: resolvedTimezone,
      services,
      categories: orderedCategories,
      calendars: Array.isArray(calendars) ? calendars : [],
    }
  } catch (err) {
    const message =
      err instanceof AcuityApiError
        ? err.message
        : "Unable to connect to Acuity Scheduling right now."
    return {
      configured: true,
      error: message,
      timezone: fallbackTimezone,
      services: [],
      categories: [],
      calendars: [],
    }
  }
}

export async function getAvailableDates(params: {
  appointmentTypeID: number
  month: string
  timezone?: string
  calendarID?: number
  addonIDs?: number[]
}): Promise<string[]> {
  const result = await acuityFetch<Array<{ date: string }>>("/availability/dates", {
    query: {
      appointmentTypeID: params.appointmentTypeID,
      month: params.month,
      timezone: params.timezone,
      calendarID: params.calendarID,
      addonIDs: params.addonIDs && params.addonIDs.length > 0 ? params.addonIDs : undefined,
    },
    revalidate: false,
  })

  if (!Array.isArray(result)) return []
  return result.map((entry) => entry.date).filter(Boolean)
}

export async function getAvailableTimes(params: {
  appointmentTypeID: number
  date: string
  timezone?: string
  calendarID?: number
  addonIDs?: number[]
}): Promise<AvailableTimeSlot[]> {
  const result = await acuityFetch<AvailableTimeSlot[]>("/availability/times", {
    query: {
      appointmentTypeID: params.appointmentTypeID,
      date: params.date,
      timezone: params.timezone,
      calendarID: params.calendarID,
      addonIDs: params.addonIDs && params.addonIDs.length > 0 ? params.addonIDs : undefined,
    },
    revalidate: false,
  })

  if (!Array.isArray(result)) return []
  return result.filter(
    (slot) => Boolean(slot?.time) && (slot.slotsAvailable === undefined || slot.slotsAvailable > 0),
  )
}

export interface CreateAppointmentInput {
  datetime: string
  appointmentTypeID: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  timezone?: string
  calendarID?: number
  addonIDs?: number[]
  fields?: Array<{ id: number; value: string }>
}

interface AcuityAppointmentRawResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  datetime: string
  date?: string
  time?: string
  endTime?: string
  duration?: string | number
  type: string
  appointmentTypeID: number
  price?: string
  calendar?: string
  calendarID?: number
  location?: string
  timezone?: string
  confirmationPage?: string
  addonIDs?: number[]
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentConfirmation> {
  const payload: Record<string, unknown> = {
    datetime: input.datetime,
    appointmentTypeID: input.appointmentTypeID,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
  }

  if (input.phone?.trim()) {
    payload.phone = input.phone.trim()
  }
  if (input.timezone?.trim()) {
    payload.timezone = input.timezone.trim()
  }
  if (input.calendarID) {
    payload.calendarID = input.calendarID
  }
  if (input.addonIDs && input.addonIDs.length > 0) {
    payload.addonIDs = input.addonIDs
  }
  if (input.fields && input.fields.length > 0) {
    payload.fields = input.fields
  }

  const created = await acuityFetch<AcuityAppointmentRawResponse>("/appointments", {
    method: "POST",
    body: payload,
  })

  return {
    id: created.id,
    firstName: created.firstName,
    lastName: created.lastName,
    email: created.email,
    phone: created.phone || input.phone || "",
    datetime: created.datetime,
    date: created.date || "",
    time: created.time || "",
    endTime: created.endTime || "",
    duration: String(created.duration ?? ""),
    type: created.type,
    appointmentTypeID: created.appointmentTypeID,
    price: created.price || "",
    calendar: created.calendar || "",
    calendarID: created.calendarID,
    location: created.location,
    timezone: created.timezone || input.timezone || DEFAULT_STUDIO_TIMEZONE,
    confirmationPage: created.confirmationPage,
    addonIDs: created.addonIDs,
  }
}
