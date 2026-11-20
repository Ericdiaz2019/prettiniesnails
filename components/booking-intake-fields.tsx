"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { AcuityForm, AcuityFormField } from "@/lib/acuity-types"

export type IntakeAnswers = Record<number, string>

export function validateIntakeFields(
  forms: AcuityForm[],
  answers: IntakeAnswers,
): Record<number, string> {
  const errors: Record<number, string> = {}

  for (const form of forms) {
    for (const field of form.fields) {
      if (!field.required) continue
      const val = (answers[field.id] ?? "").trim()
      if (!val || (field.type === "checkbox" && val !== "yes")) {
        errors[field.id] = "This field is required."
      }
    }
  }

  return errors
}

export function buildIntakePayload(
  forms: AcuityForm[],
  answers: IntakeAnswers,
): Array<{ id: number; value: string }> {
  const payload: Array<{ id: number; value: string }> = []

  for (const form of forms) {
    for (const field of form.fields) {
      const val = (answers[field.id] ?? "").trim()
      if (val) {
        payload.push({ id: field.id, value: val })
      }
    }
  }

  return payload
}

function isMultiLineTextbox(field: AcuityFormField): boolean {
  if (field.type === "textarea" || field.type === "address") return true
  if (field.lines === "large" || field.lines === "medium") return true
  if (typeof field.lines === "number" && field.lines > 1) return true
  return false
}

export function BookingIntakeFields({
  forms,
  answers,
  errors,
  onChange,
  disabled,
}: {
  forms: AcuityForm[]
  answers: IntakeAnswers
  errors: Record<number, string>
  onChange: (fieldId: number, value: string) => void
  disabled?: boolean
}) {
  if (!forms.length) return null

  return (
    <div className="space-y-6">
      {forms.map((form) => (
        <div key={form.id} className="space-y-4 rounded-xl border border-border/70 bg-muted/35 p-4 sm:p-5">
          {(form.name || form.description) && (
            <div className="space-y-1">
              {form.name && (
                <h4 className="font-serif text-base font-semibold text-foreground">{form.name}</h4>
              )}
              {form.description && (
                <p className="whitespace-pre-line text-xs text-muted-foreground">
                  {form.description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {form.fields.map((field) => {
              const value = answers[field.id] ?? ""
              const error = errors[field.id]
              const fieldHtmlId = `acuity-field-${field.id}`

              if (field.type === "checkbox") {
                const checked = value === "yes"
                return (
                  <div key={field.id} className="space-y-1.5">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={fieldHtmlId}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(next) => onChange(field.id, next === true ? "yes" : "")}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={fieldHtmlId}
                        className="cursor-pointer text-sm leading-snug font-normal text-foreground"
                      >
                        <span>
                          {field.name}
                          {field.required && <span className="ml-1 text-destructive">*</span>}
                        </span>
                      </Label>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                )
              }

              if (field.type === "yesno") {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      <span>
                        {field.name}
                        {field.required && <span className="ml-1 text-destructive">*</span>}
                      </span>
                    </Label>
                    <div className="flex gap-2">
                      {(["yes", "no"] as const).map((opt) => {
                        const selected = value === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(field.id, opt)}
                            className={cn(
                              "flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/60",
                            )}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                )
              }

              if (field.type === "checkboxlist" && Array.isArray(field.options) && field.options.length > 0) {
                const selectedValues = value
                  ? value
                      .split(", ")
                      .map((v) => v.trim())
                      .filter(Boolean)
                  : []

                const handleToggleOption = (option: string, checked: boolean) => {
                  const next = checked
                    ? Array.from(new Set([...selectedValues, option]))
                    : selectedValues.filter((item) => item !== option)
                  onChange(field.id, next.join(", "))
                }

                return (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      <span>
                        {field.name}
                        {field.required && <span className="ml-1 text-destructive">*</span>}
                      </span>
                    </Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {field.options.map((option) => {
                        const optId = `${fieldHtmlId}-${option}`
                        const checked = selectedValues.includes(option)
                        return (
                          <label
                            key={option}
                            htmlFor={optId}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors",
                              checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                            )}
                          >
                            <Checkbox
                              id={optId}
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={(next) => handleToggleOption(option, next === true)}
                            />
                            <span className="text-foreground">{option}</span>
                          </label>
                        )
                      })}
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                )
              }

              if (field.type === "dropdown" && Array.isArray(field.options) && field.options.length > 0) {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={fieldHtmlId} className="text-sm font-medium text-foreground">
                      <span>
                        {field.name}
                        {field.required && <span className="ml-1 text-destructive">*</span>}
                      </span>
                    </Label>
                    <Select
                      value={value || undefined}
                      disabled={disabled}
                      onValueChange={(next) => onChange(field.id, next)}
                    >
                      <SelectTrigger id={fieldHtmlId} className="w-full bg-card">
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                )
              }

              if (field.type === "file") {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={fieldHtmlId} className="text-sm font-medium text-foreground">
                      <span>
                        {field.name}
                        {field.required && <span className="ml-1 text-destructive">*</span>}
                      </span>
                    </Label>
                    <Input
                      id={fieldHtmlId}
                      type="url"
                      value={value}
                      disabled={disabled}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      placeholder="Paste a link to your inspo photo (or text it to Amy after booking)"
                      className="bg-card"
                    />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>
                )
              }

              return (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={fieldHtmlId} className="text-sm font-medium text-foreground">
                    <span>
                      {field.name}
                      {field.required && <span className="ml-1 text-destructive">*</span>}
                    </span>
                  </Label>
                  {isMultiLineTextbox(field) ? (
                    <Textarea
                      id={fieldHtmlId}
                      value={value}
                      disabled={disabled}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      rows={3}
                      className="bg-card"
                    />
                  ) : (
                    <Input
                      id={fieldHtmlId}
                      type="text"
                      value={value}
                      disabled={disabled}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className="bg-card"
                    />
                  )}
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
