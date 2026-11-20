"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  ZoomIn,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookingIntakeFields,
  buildIntakePayload,
  validateIntakeFields,
  type IntakeAnswers,
} from "@/components/booking-intake-fields"
import {
  buildIcsContent,
  formatDateParam,
  formatDuration,
  formatLongDate,
  formatMonthParam,
  formatPrice,
  formatSlotTime,
  getTimezoneDisplay,
  parseDateParam,
  type AcuityCatalog,
  type AppointmentConfirmation,
  type AvailableTimeSlot,
  type BookingService,
} from "@/lib/acuity-types"
import { BUSINESS } from "@/lib/business"
import { fadeUp, stagger, viewportOnce } from "@/lib/motion"
import { cn } from "@/lib/utils"

type BookingStep = "service" | "datetime" | "details" | "confirmed"

const PHONE_DISPLAY = BUSINESS.phoneDisplay
const PHONE_TEL = BUSINESS.phoneTel
const ADDRESS = BUSINESS.address.formatted
const MAPS_URL = BUSINESS.maps.googlePlaceUrl
const APPLE_MAPS_URL = BUSINESS.maps.appleMapsUrl
const MAPS_EMBED_URL = BUSINESS.maps.googleEmbedUrl
const hours = BUSINESS.hoursGrouped
const goodToKnow = BUSINESS.policies

const STEPS: Array<{
  id: Exclude<BookingStep, "confirmed">
  number: number
  label: string
  shortLabel: string
}> = [
  { id: "service", number: 1, label: "Service", shortLabel: "Service" },
  { id: "datetime", number: 2, label: "Date & Time", shortLabel: "Time" },
  { id: "details", number: 3, label: "Your Details", shortLabel: "Details" },
]

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

export default function Booking({ initialCatalog }: { initialCatalog: AcuityCatalog }) {
  const [catalog, setCatalog] = useState<AcuityCatalog>(initialCatalog)
  const [isRefreshingCatalog, setIsRefreshingCatalog] = useState(false)

  const [step, setStep] = useState<BookingStep>("service")
  const [activeCategory, setActiveCategory] = useState<string>(initialCatalog.categories[0] ?? "")
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<number | undefined>(undefined)

  // Expanded descriptions & photo preview lightbox
  const [expandedDescIds, setExpandedDescIds] = useState<Record<number, boolean>>({})
  const [previewService, setPreviewService] = useState<BookingService | null>(null)

  const cardTopRef = useRef<HTMLDivElement | null>(null)

  // Step 2: Date & Time state
  const todayStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    () => new Date(todayStart.getFullYear(), todayStart.getMonth(), 1),
  )
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [datesError, setDatesError] = useState<string | null>(null)

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<AvailableTimeSlot[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [timesError, setTimesError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null)

  const autoAdvancedKeyRef = useRef<string>("")

  // Step 3: Contact + dynamic intake fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [intakeAnswers, setIntakeAnswers] = useState<IntakeAnswers>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [intakeErrors, setIntakeErrors] = useState<Record<number, string>>({})
  const [submitError, setSubmitError] = useState<{ message: string; code?: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 4: Confirmed appointment
  const [confirmation, setConfirmation] = useState<AppointmentConfirmation | null>(null)

  const selectedService: BookingService | null = useMemo(
    () => catalog.services.find((s) => s.id === selectedServiceId) ?? null,
    [catalog.services, selectedServiceId],
  )

  const selectedAddons = useMemo(() => {
    if (!selectedService) return []
    return selectedService.addons.filter((addon) => selectedAddonIds.includes(addon.id))
  }, [selectedService, selectedAddonIds])

  const totalDuration = useMemo(() => {
    if (!selectedService) return 0
    return (
      selectedService.duration +
      selectedAddons.reduce((sum, addon) => sum + addon.duration, 0)
    )
  }, [selectedService, selectedAddons])

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0
    return (
      selectedService.price +
      selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    )
  }, [selectedService, selectedAddons])

  const eligibleCalendars = useMemo(() => {
    if (!selectedService || catalog.calendars.length <= 1) return []
    if (!selectedService.calendarIDs.length) return catalog.calendars
    return catalog.calendars.filter((cal) => selectedService.calendarIDs.includes(cal.id))
  }, [selectedService, catalog.calendars])

  const timezoneLabel = useMemo(
    () => getTimezoneDisplay(catalog.timezone),
    [catalog.timezone],
  )

  const addonsQueryValue = useMemo(
    () => [...selectedAddonIds].sort((a, b) => a - b).join(","),
    [selectedAddonIds],
  )

  const showCategoryTabs = catalog.categories.length > 1

  const filteredServices = useMemo(() => {
    if (!showCategoryTabs || !activeCategory) {
      return catalog.services
    }
    return catalog.services.filter((s) => s.category === activeCategory)
  }, [catalog.services, showCategoryTabs, activeCategory])

  useEffect(() => {
    if (catalog.categories.length > 0 && !catalog.categories.includes(activeCategory)) {
      setActiveCategory(catalog.categories[0])
    }
  }, [catalog.categories, activeCategory])

  const scrollCardIntoView = useCallback(() => {
    if (!cardTopRef.current) return
    const rect = cardTopRef.current.getBoundingClientRect()
    if (rect.top < 72 || rect.top > window.innerHeight * 0.45) {
      cardTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const refreshCatalog = useCallback(async () => {
    setIsRefreshingCatalog(true)
    try {
      const res = await fetch("/api/acuity/catalog", { cache: "no-store" })
      const data = (await res.json()) as AcuityCatalog
      setCatalog(data)
      if (data.categories.length > 0) {
        setActiveCategory((prev) => (data.categories.includes(prev) ? prev : data.categories[0]))
      }
    } catch {
      setCatalog((prev) => ({
        ...prev,
        error: "Unable to reach Acuity Scheduling right now. Please try again or call/text Amy.",
      }))
    } finally {
      setIsRefreshingCatalog(false)
    }
  }, [])

  const handleChooseService = useCallback(
    (service: BookingService) => {
      const isDifferent = service.id !== selectedServiceId
      setPreviewService(null)
      setSelectedServiceId(service.id)
      if (isDifferent) {
        setSelectedAddonIds([])
        setSelectedCalendarId(undefined)
        setSelectedDateStr(null)
        setSelectedSlot(null)
        setAvailableTimes([])
        setTimesError(null)
        setSubmitError(null)
        setIntakeErrors({})
        setConfirmation(null)
        setVisibleMonth(new Date(todayStart.getFullYear(), todayStart.getMonth(), 1))
        autoAdvancedKeyRef.current = ""
      }
      setStep("datetime")
      scrollCardIntoView()
    },
    [selectedServiceId, todayStart, scrollCardIntoView],
  )

  const handleToggleAddon = useCallback((addonId: number) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId],
    )
    setSelectedDateStr(null)
    setSelectedSlot(null)
    setAvailableTimes([])
    setTimesError(null)
    autoAdvancedKeyRef.current = ""
  }, [])

  const handleSelectCalendar = useCallback((calendarId: number | undefined) => {
    setSelectedCalendarId(calendarId)
    setSelectedDateStr(null)
    setSelectedSlot(null)
    setAvailableTimes([])
    setTimesError(null)
    autoAdvancedKeyRef.current = ""
  }, [])

  // Fetch available dates for the visible month
  const fetchMonthDates = useCallback(
    async (monthDate: Date, signal?: AbortSignal): Promise<string[] | null> => {
      if (!selectedService) return null
      const monthParam = formatMonthParam(monthDate)
      const params = new URLSearchParams({
        appointmentTypeID: String(selectedService.id),
        month: monthParam,
        timezone: catalog.timezone,
      })
      if (selectedCalendarId) {
        params.set("calendarID", String(selectedCalendarId))
      }
      if (addonsQueryValue) {
        params.set("addonIDs", addonsQueryValue)
      }

      const res = await fetch(`/api/acuity/availability/dates?${params.toString()}`, {
        cache: "no-store",
        signal,
      })
      const data = (await res.json()) as { dates?: string[]; error?: string }
      if (!res.ok) {
        throw new Error(data.error || "Unable to load open dates.")
      }
      return Array.isArray(data.dates) ? data.dates : []
    },
    [selectedService, catalog.timezone, selectedCalendarId, addonsQueryValue],
  )

  useEffect(() => {
    if (step !== "datetime" || !selectedService || !catalog.configured) return

    const controller = new AbortController()
    const selectionKey = `${selectedService.id}:${addonsQueryValue}:${selectedCalendarId ?? "any"}`
    const currentMonthParam = formatMonthParam(visibleMonth)

    let active = true
    setIsLoadingDates(true)
    setDatesError(null)

    ;(async () => {
      try {
        const dates = await fetchMonthDates(visibleMonth, controller.signal)
        if (!active || dates === null) return

        // If the current month has zero openings left on initial load,
        // automatically peek up to 2 months ahead so clients land on open dates.
        if (
          dates.length === 0 &&
          autoAdvancedKeyRef.current !== selectionKey &&
          currentMonthParam === formatMonthParam(todayStart)
        ) {
          autoAdvancedKeyRef.current = selectionKey
          for (let offset = 1; offset <= 2; offset += 1) {
            const nextMonth = addMonths(visibleMonth, offset)
            const nextDates = await fetchMonthDates(nextMonth, controller.signal)
            if (!active) return
            if (nextDates && nextDates.length > 0) {
              setVisibleMonth(nextMonth)
              setAvailableDates(nextDates)
              setSelectedDateStr(nextDates[0])
              return
            }
          }
        }

        autoAdvancedKeyRef.current = selectionKey
        setAvailableDates(dates)
        setSelectedDateStr((prev) => {
          if (prev && dates.includes(prev)) return prev
          return dates[0] ?? null
        })
      } catch (err) {
        if (!active || (err instanceof Error && err.name === "AbortError")) return
        setAvailableDates([])
        setDatesError(err instanceof Error ? err.message : "Unable to load available dates.")
      } finally {
        if (active) setIsLoadingDates(false)
      }
    })()

    return () => {
      active = false
      controller.abort()
    }
  }, [
    step,
    selectedService,
    catalog.configured,
    visibleMonth,
    addonsQueryValue,
    selectedCalendarId,
    fetchMonthDates,
    todayStart,
  ])

  // Fetch available times for the selected date
  const loadTimesForDate = useCallback(
    async (dateStr: string, signal?: AbortSignal) => {
      if (!selectedService) return
      setIsLoadingTimes(true)
      setTimesError(null)
      try {
        const params = new URLSearchParams({
          appointmentTypeID: String(selectedService.id),
          date: dateStr,
          timezone: catalog.timezone,
        })
        if (selectedCalendarId) {
          params.set("calendarID", String(selectedCalendarId))
        }
        if (addonsQueryValue) {
          params.set("addonIDs", addonsQueryValue)
        }
        const res = await fetch(`/api/acuity/availability/times?${params.toString()}`, {
          cache: "no-store",
          signal,
        })
        const data = (await res.json()) as { times?: AvailableTimeSlot[]; error?: string }
        if (!res.ok) {
          throw new Error(data.error || "Unable to load available times.")
        }
        setAvailableTimes(Array.isArray(data.times) ? data.times : [])
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        setAvailableTimes([])
        setTimesError(err instanceof Error ? err.message : "Unable to load available times.")
      } finally {
        setIsLoadingTimes(false)
      }
    },
    [selectedService, catalog.timezone, selectedCalendarId, addonsQueryValue],
  )

  useEffect(() => {
    if (step !== "datetime" || !selectedService || !selectedDateStr || !catalog.configured) {
      return
    }
    const controller = new AbortController()
    loadTimesForDate(selectedDateStr, controller.signal)
    return () => controller.abort()
  }, [step, selectedService, selectedDateStr, catalog.configured, loadTimesForDate])

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates])

  const selectedDateObj = useMemo(
    () => (selectedDateStr ? parseDateParam(selectedDateStr) : undefined),
    [selectedDateStr],
  )

  const handleStepNavigation = (targetStep: Exclude<BookingStep, "confirmed">) => {
    if (step === "confirmed") return
    if (targetStep === "service") {
      setStep("service")
    } else if (targetStep === "datetime" && selectedService) {
      setStep("datetime")
    } else if (targetStep === "details" && selectedService && selectedSlot) {
      setStep("details")
    }
  }

  const handleIntakeChange = (fieldId: number, value: string) => {
    setIntakeAnswers((prev) => ({ ...prev, [fieldId]: value }))
    setIntakeErrors((prev) => {
      if (!prev[fieldId]) return prev
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  const handleSubmitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService || !selectedSlot) return

    const nextFormErrors: Record<string, string> = {}
    if (!firstName.trim()) nextFormErrors.firstName = "First name is required."
    if (!lastName.trim()) nextFormErrors.lastName = "Last name is required."
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextFormErrors.email = "Please enter a valid email address."
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 7) {
      nextFormErrors.phone = "Please enter a valid phone number."
    }

    const nextIntakeErrors = validateIntakeFields(selectedService.forms, intakeAnswers)
    setFormErrors(nextFormErrors)
    setIntakeErrors(nextIntakeErrors)
    setSubmitError(null)

    if (Object.keys(nextFormErrors).length > 0 || Object.keys(nextIntakeErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/acuity/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentTypeID: selectedService.id,
          datetime: selectedSlot.time,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          timezone: catalog.timezone,
          calendarID: selectedCalendarId,
          addonIDs: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
          fields: buildIntakePayload(selectedService.forms, intakeAnswers),
        }),
      })

      const data = (await res.json()) as {
        appointment?: AppointmentConfirmation
        error?: string
        code?: string
      }

      if (!res.ok || !data.appointment) {
        setSubmitError({
          message: data.error || "Could not confirm your appointment. Please try again.",
          code: data.code,
        })
        return
      }

      setConfirmation(data.appointment)
      setStep("confirmed")
      scrollCardIntoView()
    } catch {
      setSubmitError({
        message: "Network error while confirming your appointment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadIcs = () => {
    if (!confirmation) return
    const ics = buildIcsContent(confirmation, ADDRESS)
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `prettiness-nails-${confirmation.id}.ics`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const handleBookAnother = () => {
    setConfirmation(null)
    setSelectedServiceId(null)
    setSelectedAddonIds([])
    setSelectedCalendarId(undefined)
    setSelectedDateStr(null)
    setSelectedSlot(null)
    setSubmitError(null)
    setFormErrors({})
    setIntakeErrors({})
    autoAdvancedKeyRef.current = ""
    setStep("service")
    scrollCardIntoView()
  }

  const activeStepIndex =
    step === "confirmed" ? 3 : STEPS.findIndex((item) => item.id === step)

  return (
    <section id="booking" className="scroll-mt-16 bg-background py-12 sm:py-20 lg:py-24">
      <div id="services" className="scroll-mt-20" />
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        {/* Unified Section Heading */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger}
          className="px-1 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Services &amp; Booking
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-2 text-pretty text-sm text-muted-foreground sm:mt-3 sm:text-lg"
          >
            Tap a service to see Amy&apos;s live openings — no deposit needed, pay at the studio.
          </motion.p>
          <motion.p variants={fadeUp} className="mt-1.5 text-xs font-medium text-foreground sm:text-sm">
            Note: I don&apos;t work on other nail techs&apos; work.
          </motion.p>
        </motion.div>

        {/* Compact side-by-side Call / Text bar on mobile */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3"
        >
          <motion.div variants={fadeUp}>
            <Button
              asChild
              className="h-11 w-full bg-primary text-sm text-primary-foreground hover:bg-primary/90 sm:h-12"
            >
              <a href={`tel:${PHONE_TEL}`} className="flex items-center justify-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">Call Amy</span>
                <span className="hidden sm:inline">Call {PHONE_DISPLAY}</span>
              </a>
            </Button>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Button asChild variant="outline" className="h-11 w-full bg-card text-sm sm:h-12">
              <a href={`sms:${PHONE_TEL}`} className="flex items-center justify-center gap-1.5">
                <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                Text Amy
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Unified Live Services + Booking Card */}
        <motion.div
          ref={cardTopRef}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 scroll-mt-20 overflow-hidden rounded-2xl border bg-card shadow-md sm:mt-8 sm:shadow-lg"
        >
          {!catalog.configured ? (
            <div className="p-6 text-center sm:p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground sm:text-2xl">
                Online Booking Ready to Connect
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Add{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                  ACUITY_USER_ID
                </code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                  ACUITY_API_KEY
                </code>{" "}
                in your environment variables to load Amy&apos;s live services and calendar.
              </p>
            </div>
          ) : catalog.error || catalog.services.length === 0 ? (
            <div className="p-6 text-center sm:p-12">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                {catalog.error
                  ? "Couldn't reach Acuity Scheduling"
                  : "No bookable services available yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {catalog.error ||
                  "Please refresh in a moment, or call/text Amy directly to grab a spot."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRefreshingCatalog}
                  onClick={refreshCatalog}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshingCatalog && "animate-spin")} />
                  {isRefreshingCatalog ? "Retrying..." : "Retry"}
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href={`tel:${PHONE_TEL}`}>Call {PHONE_DISPLAY}</a>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Compact Mobile-First Step Progress Bar */}
              {step !== "confirmed" && (
                <div className="border-b bg-muted/40 px-3 py-3 sm:px-8 sm:py-4">
                  <ol className="mx-auto flex max-w-2xl items-center justify-between gap-1.5 sm:gap-3">
                    {STEPS.map((item, idx) => {
                      const isCurrent = step === item.id
                      const isCompleted = idx < activeStepIndex
                      const isClickable =
                        item.id === "service" ||
                        (item.id === "datetime" && Boolean(selectedService)) ||
                        (item.id === "details" && Boolean(selectedService && selectedSlot))

                      return (
                        <li key={item.id} className="flex flex-1 items-center gap-1.5 last:flex-none sm:gap-2">
                          <button
                            type="button"
                            disabled={!isClickable}
                            onClick={() => handleStepNavigation(item.id)}
                            className={cn(
                              "flex min-h-[36px] items-center gap-1.5 text-left transition-colors sm:gap-2",
                              isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-7 sm:w-7",
                                isCurrent && "bg-primary text-primary-foreground shadow-xs",
                                isCompleted && "bg-primary/15 text-primary",
                                !isCurrent && !isCompleted && "border bg-card text-muted-foreground",
                              )}
                            >
                              {isCompleted ? <Check className="h-3.5 w-3.5" /> : item.number}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium whitespace-nowrap sm:text-sm",
                                isCurrent ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              <span className="sm:hidden">{item.shortLabel}</span>
                              <span className="hidden sm:inline">{item.label}</span>
                            </span>
                          </button>
                          {idx < STEPS.length - 1 && (
                            <div
                              aria-hidden
                              className={cn(
                                "h-px flex-1",
                                isCompleted ? "bg-primary/50" : "bg-border",
                              )}
                            />
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}

              {/* Step Content */}
              <div className="p-3.5 sm:p-7 lg:p-8">
                <AnimatePresence mode="wait">
                  {/* STEP 1: LIVE SERVICES & PRICING MENU WITH ACUITY PHOTOS */}
                  {step === "service" && (
                    <motion.div
                      key="step-service"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      {/* Horizontal swipeable category pills on phone, centered wrap on sm+ */}
                      {showCategoryTabs && (
                        <div className="-mx-3.5 sm:mx-0">
                          <div
                            role="tablist"
                            aria-label="Service categories"
                            className="flex flex-nowrap items-center gap-1.5 overflow-x-auto px-3.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:rounded-2xl sm:bg-muted/70 sm:p-1.5"
                          >
                            {catalog.categories.map((category) => {
                              const isActive = category === activeCategory
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  role="tab"
                                  aria-selected={isActive}
                                  onClick={() => setActiveCategory(category)}
                                  className={cn(
                                    "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-all sm:rounded-xl sm:px-4 sm:text-sm",
                                    isActive
                                      ? "bg-primary text-primary-foreground shadow-xs sm:bg-card sm:text-foreground sm:ring-1 sm:ring-border"
                                      : "border border-border/70 bg-muted/50 text-muted-foreground hover:text-foreground sm:border-transparent sm:bg-transparent",
                                  )}
                                >
                                  {category}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeCategory || "all"}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-4"
                        >
                          {filteredServices.map((service) => {
                            const isLongDesc = service.description.length > 125
                            const isExpanded = Boolean(expandedDescIds[service.id])

                            return (
                              <article
                                key={service.id}
                                className="flex flex-col justify-between rounded-xl border border-border/75 bg-background/60 p-3.5 transition-all hover:border-primary/40 hover:shadow-md sm:p-4"
                              >
                                <div>
                                  <div className="flex items-start gap-3 sm:gap-4">
                                    {/* Acuity Portrait Service Photo (tap to zoom) */}
                                    {service.image && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewService(service)}
                                        aria-label={`View larger photo of ${service.name}`}
                                        className="group relative h-[116px] w-[86px] shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/70 transition-transform active:scale-[0.98] sm:h-[136px] sm:w-[102px]"
                                      >
                                        <Image
                                          src={service.image}
                                          alt={service.name}
                                          fill
                                          sizes="(max-width: 640px) 86px, 102px"
                                          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <span
                                          aria-hidden
                                          className="absolute right-1.5 bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-xs"
                                        >
                                          <ZoomIn className="h-3.5 w-3.5" />
                                        </span>
                                      </button>
                                    )}

                                    {/* Title, Price, Duration, Meta */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-serif text-[16px] leading-snug font-semibold text-foreground sm:text-lg">
                                          {service.name}
                                        </h3>
                                        {!service.image && service.price > 0 && (
                                          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                                            {service.priceFormatted}
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {service.image && service.price > 0 && (
                                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                                            {service.priceFormatted}
                                          </span>
                                        )}
                                        {service.durationFormatted && (
                                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                                            <Clock className="h-3.5 w-3.5" />
                                            {service.durationFormatted}
                                          </span>
                                        )}
                                        {service.addons.length > 0 && (
                                          <Badge
                                            variant="secondary"
                                            className="gap-0.5 px-2 py-0.5 text-[11px] font-normal"
                                          >
                                            <Plus className="h-3 w-3" />
                                            Add-ons
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Description on desktop/tablet when photo is present; also shown cleanly below */}
                                      {service.description && (
                                        <div className="mt-2.5">
                                          <p
                                            className={cn(
                                              "whitespace-pre-line text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm",
                                              !isExpanded && isLongDesc && "line-clamp-2",
                                            )}
                                          >
                                            {service.description}
                                          </p>
                                          {isLongDesc && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setExpandedDescIds((prev) => ({
                                                  ...prev,
                                                  [service.id]: !prev[service.id],
                                                }))
                                              }
                                              className="mt-1 text-xs font-medium text-primary hover:underline"
                                            >
                                              {isExpanded ? "Show less" : "Read more"}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  onClick={() => handleChooseService(service)}
                                  className="mt-3.5 h-11 w-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:mt-4"
                                >
                                  Book This
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </article>
                            )
                          })}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* STEP 2: OPTIONAL ADD-ONS + LIVE CALENDAR & TIME SLOTS */}
                  {step === "datetime" && selectedService && (
                    <motion.div
                      key="step-datetime"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5 sm:space-y-6"
                    >
                      {/* Selected service summary */}
                      <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 sm:items-center sm:p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {selectedService.image && (
                            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/70">
                              <Image
                                src={selectedService.image}
                                alt={selectedService.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                              Selected Service
                            </p>
                            <p className="mt-0.5 font-serif text-base leading-snug font-semibold text-foreground sm:text-lg">
                              {selectedService.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                              {totalDuration > 0 && formatDuration(totalDuration)}
                              {totalDuration > 0 && totalPrice > 0 && " · "}
                              {totalPrice > 0 && `${formatPrice(totalPrice)} at studio`}
                              {selectedAddons.length > 0 &&
                                ` · + ${selectedAddons.map((a) => a.name).join(", ")}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setStep("service")}
                          className="h-9 shrink-0 bg-card px-2.5 text-xs sm:px-3 sm:text-sm"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">All services</span>
                          <span className="sm:hidden">Change</span>
                        </Button>
                      </div>

                      {/* Optional add-ons */}
                      {selectedService.addons.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Optional add-ons
                            </p>
                            {selectedAddons.length > 0 && (
                              <span className="text-xs font-medium text-primary">
                                {selectedAddons.length} added
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {selectedService.addons.map((addon) => {
                              const active = selectedAddonIds.includes(addon.id)
                              return (
                                <button
                                  key={addon.id}
                                  type="button"
                                  onClick={() => handleToggleAddon(addon.id)}
                                  className={cn(
                                    "flex min-h-[48px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all",
                                    active
                                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                      : "border-border bg-background/60 hover:border-primary/40",
                                  )}
                                >
                                  <div className="flex min-w-0 items-center gap-2.5">
                                    <span
                                      className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                        active
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-muted-foreground/40 text-muted-foreground",
                                      )}
                                    >
                                      {active ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Plus className="h-3 w-3" />
                                      )}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {addon.name}
                                      </p>
                                      {addon.duration > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          +{formatDuration(addon.duration)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {addon.price > 0 && (
                                    <span className="shrink-0 text-sm font-semibold text-primary">
                                      +{addon.priceFormatted}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Calendar selector (only shown if multiple calendars exist in Acuity) */}
                      {eligibleCalendars.length > 1 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Calendar / Nail Tech
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectCalendar(undefined)}
                              className={cn(
                                "h-10 rounded-lg border px-3.5 text-sm font-medium transition-colors",
                                !selectedCalendarId
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card text-foreground hover:border-primary/40",
                              )}
                            >
                              Any Available
                            </button>
                            {eligibleCalendars.map((cal) => (
                              <button
                                key={cal.id}
                                type="button"
                                onClick={() => handleSelectCalendar(cal.id)}
                                className={cn(
                                  "h-10 rounded-lg border px-3.5 text-sm font-medium transition-colors",
                                  selectedCalendarId === cal.id
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-foreground hover:border-primary/40",
                                )}
                              >
                                {cal.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Calendar + Time Slots grid */}
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                        {/* Calendar */}
                        <div className="rounded-xl border bg-background/60 p-3 sm:p-4 lg:col-span-6">
                          <div className="mb-2 flex items-center justify-between sm:mb-3">
                            <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">
                              1. Choose a date
                            </h3>
                            {isLoadingDates && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                Checking...
                              </span>
                            )}
                          </div>

                          <div className="flex justify-center">
                            <Calendar
                              mode="single"
                              startMonth={
                                new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)
                              }
                              month={visibleMonth}
                              onMonthChange={(nextMonth) => {
                                setVisibleMonth(
                                  new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
                                )
                              }}
                              selected={selectedDateObj}
                              onSelect={(day) => {
                                if (!day) return
                                const ds = formatDateParam(day)
                                if (!availableDateSet.has(ds)) return
                                setSelectedDateStr(ds)
                                setSelectedSlot(null)
                              }}
                              disabled={(day) => {
                                if (day < todayStart) return true
                                return !availableDateSet.has(formatDateParam(day))
                              }}
                              modifiers={{
                                available: (day) => availableDateSet.has(formatDateParam(day)),
                              }}
                              modifiersClassNames={{
                                available:
                                  "font-semibold text-foreground [&_button]:bg-primary/10 [&_button]:hover:bg-primary/20 [&_button[data-selected-single=true]]:bg-primary [&_button[data-selected-single=true]]:text-primary-foreground",
                              }}
                              className="w-full max-w-[330px] p-1 sm:max-w-[340px] sm:p-3 [--cell-size:--spacing(10)]"
                            />
                          </div>

                          {datesError ? (
                            <Alert variant="destructive" className="mt-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{datesError}</AlertDescription>
                            </Alert>
                          ) : !isLoadingDates && availableDates.length === 0 ? (
                            <div className="mt-3 rounded-lg bg-muted/70 p-3 text-center text-xs text-muted-foreground">
                              <p>No openings left in this month.</p>
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="mt-1 h-auto p-0 text-primary"
                                onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
                              >
                                Check next month →
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground sm:mt-3">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-primary/25 ring-1 ring-primary/40" />
                                Available
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Time Slots */}
                        <div className="flex flex-col rounded-xl border bg-background/60 p-3 sm:p-4 lg:col-span-6">
                          <div>
                            <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">
                              2. Choose a time
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {selectedDateStr
                                ? formatLongDate(selectedDateStr, catalog.timezone)
                                : "Pick a highlighted date on the calendar."}
                            </p>
                          </div>

                          <div className="mt-3.5 flex-1 sm:mt-4">
                            {!selectedDateStr ? (
                              <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                                <CalendarIcon className="mb-2 h-6 w-6 text-primary/60" />
                                Select a highlighted date to see open times.
                              </div>
                            ) : isLoadingTimes ? (
                              <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                  <Skeleton key={idx} className="h-11 rounded-lg bg-muted" />
                                ))}
                              </div>
                            ) : timesError ? (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="flex flex-col gap-2">
                                  <span>{timesError}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-fit"
                                    onClick={() => loadTimesForDate(selectedDateStr)}
                                  >
                                    Retry
                                  </Button>
                                </AlertDescription>
                              </Alert>
                            ) : availableTimes.length === 0 ? (
                              <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                                <Clock className="mb-2 h-6 w-6 text-muted-foreground/70" />
                                No time slots left on this date. Try another highlighted day!
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2">
                                {availableTimes.map((slot) => {
                                  const isPicked = selectedSlot?.time === slot.time
                                  return (
                                    <button
                                      key={slot.time}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot)}
                                      className={cn(
                                        "min-h-[44px] rounded-lg border px-2 py-2.5 text-sm font-medium transition-all",
                                        isPicked
                                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                          : "border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary/5",
                                      )}
                                    >
                                      {formatSlotTime(slot.time, catalog.timezone)}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          <p className="mt-3.5 text-xs text-muted-foreground">
                            Times shown in {timezoneLabel}
                          </p>
                        </div>
                      </div>

                      {/* Navigation Footer */}
                      <div className="flex flex-col-reverse items-stretch justify-between gap-2.5 border-t pt-4 sm:flex-row sm:items-center sm:pt-5">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 sm:h-10"
                          onClick={() => setStep("service")}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Services
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          disabled={!selectedSlot}
                          onClick={() => {
                            setStep("details")
                            scrollCardIntoView()
                          }}
                          className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 sm:h-11"
                        >
                          Continue to Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: CLIENT DETAILS & DYNAMIC ACUITY INTAKE FORMS */}
                  {step === "details" && selectedService && selectedSlot && (
                    <motion.div
                      key="step-details"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleSubmitBooking} noValidate className="space-y-5 sm:space-y-6">
                        {/* Booking Summary Banner */}
                        <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 sm:items-center sm:p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {selectedService.image && (
                              <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/70">
                                <Image
                                  src={selectedService.image}
                                  alt={selectedService.name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-serif text-base font-semibold text-foreground sm:text-lg">
                                  {selectedService.name}
                                </span>
                                {totalPrice > 0 && (
                                  <Badge variant="secondary" className="font-semibold text-primary">
                                    {formatPrice(totalPrice)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-foreground sm:text-sm">
                                {formatLongDate(selectedSlot.time, catalog.timezone)} ·{" "}
                                <span className="font-semibold">
                                  {formatSlotTime(selectedSlot.time, catalog.timezone)}
                                </span>
                                {totalDuration > 0 && ` (${formatDuration(totalDuration)})`}
                              </p>
                              {selectedAddons.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Add-ons: {selectedAddons.map((a) => a.name).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => setStep("datetime")}
                            className="h-9 shrink-0 bg-card px-2.5 text-xs sm:px-3 sm:text-sm"
                          >
                            Change
                          </Button>
                        </div>

                        {submitError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Couldn&apos;t complete booking</AlertTitle>
                            <AlertDescription className="space-y-2">
                              <p>{submitError.message}</p>
                              {submitError.code === "not_available" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSlot(null)
                                    setSubmitError(null)
                                    setStep("datetime")
                                    if (selectedDateStr) {
                                      loadTimesForDate(selectedDateStr)
                                    }
                                  }}
                                >
                                  Choose a different time
                                </Button>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-3.5 sm:space-y-4">
                          <h3 className="font-serif text-lg font-semibold text-foreground sm:text-xl">
                            Your Contact Information
                          </h3>
                          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="booking-first-name">
                                First Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="booking-first-name"
                                autoComplete="given-name"
                                required
                                disabled={isSubmitting}
                                value={firstName}
                                onChange={(e) => {
                                  setFirstName(e.target.value)
                                  if (formErrors.firstName) {
                                    setFormErrors((prev) => ({ ...prev, firstName: "" }))
                                  }
                                }}
                                aria-invalid={Boolean(formErrors.firstName)}
                                placeholder="Jane"
                                className="h-11 sm:h-10"
                              />
                              {formErrors.firstName && (
                                <p className="text-xs text-destructive">{formErrors.firstName}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="booking-last-name">
                                Last Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="booking-last-name"
                                autoComplete="family-name"
                                required
                                disabled={isSubmitting}
                                value={lastName}
                                onChange={(e) => {
                                  setLastName(e.target.value)
                                  if (formErrors.lastName) {
                                    setFormErrors((prev) => ({ ...prev, lastName: "" }))
                                  }
                                }}
                                aria-invalid={Boolean(formErrors.lastName)}
                                placeholder="Doe"
                                className="h-11 sm:h-10"
                              />
                              {formErrors.lastName && (
                                <p className="text-xs text-destructive">{formErrors.lastName}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="booking-email">
                                Email <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="booking-email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                required
                                disabled={isSubmitting}
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value)
                                  if (formErrors.email) {
                                    setFormErrors((prev) => ({ ...prev, email: "" }))
                                  }
                                }}
                                aria-invalid={Boolean(formErrors.email)}
                                placeholder="you@example.com"
                                className="h-11 sm:h-10"
                              />
                              {formErrors.email && (
                                <p className="text-xs text-destructive">{formErrors.email}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="booking-phone">
                                Phone Number <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="booking-phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                required
                                disabled={isSubmitting}
                                value={phone}
                                onChange={(e) => {
                                  setPhone(e.target.value)
                                  if (formErrors.phone) {
                                    setFormErrors((prev) => ({ ...prev, phone: "" }))
                                  }
                                }}
                                aria-invalid={Boolean(formErrors.phone)}
                                placeholder="(574) 555-0123"
                                className="h-11 sm:h-10"
                              />
                              {formErrors.phone && (
                                <p className="text-xs text-destructive">{formErrors.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Acuity Intake Forms */}
                        <BookingIntakeFields
                          forms={selectedService.forms}
                          answers={intakeAnswers}
                          errors={intakeErrors}
                          onChange={handleIntakeChange}
                          disabled={isSubmitting}
                        />

                        {/* Studio reminders */}
                        <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 text-xs text-muted-foreground sm:p-4">
                          <p className="font-medium text-foreground">Before you book:</p>
                          <p className="mt-1 leading-relaxed">
                            No card or deposit is required online — payment is taken in person at
                            the studio. Please give 24 hours notice for cancellations, and feel free
                            to text inspo photos to{" "}
                            <span className="font-medium text-foreground">{PHONE_DISPLAY}</span>{" "}
                            after booking.
                          </p>
                        </div>

                        {/* Submit Footer */}
                        <div className="flex flex-col-reverse items-stretch justify-between gap-2.5 border-t pt-4 sm:flex-row sm:items-center sm:pt-5">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            className="h-11 sm:h-10"
                            onClick={() => setStep("datetime")}
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Date &amp; Time
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 sm:h-11"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Confirming...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Confirm Appointment
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* STEP 4: BOOKING CONFIRMED */}
                  {step === "confirmed" && confirmation && (
                    <motion.div
                      key="step-confirmed"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mx-auto max-w-2xl py-2 text-center sm:py-4"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                        You&apos;re booked, {confirmation.firstName}!
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        A confirmation email has been sent to{" "}
                        <span className="font-medium text-foreground">{confirmation.email}</span>.
                      </p>

                      <div className="mt-5 rounded-2xl border bg-muted/35 p-4 text-left sm:mt-6 sm:p-6">
                        <dl className="grid grid-cols-1 gap-3.5 text-sm sm:grid-cols-2 sm:gap-4">
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Service
                            </dt>
                            <dd className="mt-1 font-serif text-base font-semibold text-foreground">
                              {confirmation.type}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Date &amp; Time
                            </dt>
                            <dd className="mt-1 font-medium text-foreground">
                              {formatLongDate(confirmation.datetime, confirmation.timezone)}
                              <br />
                              {formatSlotTime(confirmation.datetime, confirmation.timezone)}
                              {confirmation.endTime && ` – ${confirmation.endTime}`}
                            </dd>
                          </div>

                          {confirmation.price && Number.parseFloat(confirmation.price) > 0 && (
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Estimated Total
                              </dt>
                              <dd className="mt-1 font-medium text-foreground">
                                {formatPrice(confirmation.price)}{" "}
                                <span className="text-xs font-normal text-muted-foreground">
                                  (pay at studio)
                                </span>
                              </dd>
                            </div>
                          )}

                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Studio Location
                            </dt>
                            <dd className="mt-1 font-medium text-foreground">
                              {confirmation.location || ADDRESS}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center">
                        <Button
                          type="button"
                          onClick={handleDownloadIcs}
                          className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 sm:h-10"
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Add to Calendar
                        </Button>

                        {confirmation.confirmationPage && (
                          <Button asChild variant="outline" className="h-11 sm:h-10">
                            <a
                              href={confirmation.confirmationPage}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Manage or Reschedule
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}

                        <Button asChild variant="outline" className="h-11 sm:h-10">
                          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                            <MapPin className="h-4 w-4" />
                            Get Directions
                          </a>
                        </Button>
                      </div>

                      <div className="mt-5 border-t pt-4 sm:mt-6 sm:pt-5">
                        <Button type="button" variant="ghost" onClick={handleBookAnother}>
                          Book another appointment
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>

        {/* Studio Location, Map, Hours & Good-to-Know */}
        <motion.div
          id="location"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-8 scroll-mt-20 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3"
        >
          <motion.div variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Studio Location</h3>
            </div>
            <address className="not-italic text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{BUSINESS.name}</span>
              <br />
              {ADDRESS}
            </address>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Easy parking right outside. Minutes from South Bend, Mishawaka, Elkhart &amp; Goshen.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border bg-muted">
              <iframe
                src={MAPS_EMBED_URL}
                width="400"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-36 w-full sm:h-40"
                title="Prettiness Nails by Amy on Google Maps — 51509 Bittersweet Rd, Granger, IN"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" className="h-10 bg-transparent">
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-10 bg-transparent">
                <a href={APPLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Apple Maps
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Studio Hours</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">{h.day}</span>
                  <span
                    className={
                      h.closed ? "font-medium text-muted-foreground" : "text-muted-foreground"
                    }
                  >
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
              Closed Sunday &amp; Monday. Tuesday through Saturday hours are by appointment only.
              Pay in person with cash, card, Apple Pay, or Tap to Pay.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <h3 className="mb-2.5 font-serif text-lg font-semibold sm:mb-3">Good to know</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {goodToKnow.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Tap-to-Zoom Service Photo Lightbox */}
      <Dialog
        open={Boolean(previewService)}
        onOpenChange={(open) => {
          if (!open) setPreviewService(null)
        }}
      >
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-3 sm:max-w-md sm:p-5">
          {previewService && (
            <div className="space-y-3.5">
              {previewService.image && (
                <div className="relative aspect-[3/4] max-h-[60dvh] w-full overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={previewService.image}
                    alt={previewService.name}
                    fill
                    sizes="(max-width: 640px) 92vw, 420px"
                    className="object-cover object-center"
                  />
                </div>
              )}

              <div className="space-y-1.5 px-1">
                <div className="flex items-start justify-between gap-2">
                  <DialogTitle className="font-serif text-lg leading-snug font-semibold text-foreground">
                    {previewService.name}
                  </DialogTitle>
                  {previewService.price > 0 && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                      {previewService.priceFormatted}
                    </span>
                  )}
                </div>
                {previewService.durationFormatted && (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {previewService.durationFormatted}
                  </p>
                )}
                {previewService.description && (
                  <DialogDescription className="whitespace-pre-line text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {previewService.description}
                  </DialogDescription>
                )}
              </div>

              <Button
                type="button"
                onClick={() => handleChooseService(previewService)}
                className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Book This{previewService.price > 0 ? ` · ${previewService.priceFormatted}` : ""}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
