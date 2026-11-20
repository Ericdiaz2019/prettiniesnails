import { ChevronDown } from "lucide-react"
import { faqs } from "@/lib/faqs"

export default function FAQ() {
  return (
    <section id="faq" className="bg-muted/35 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground sm:mt-3 sm:text-base">
            Hours, booking policies, payments, and what to expect at our Granger studio.
          </p>
        </div>

        <div className="mt-7 divide-y divide-border overflow-hidden rounded-2xl border bg-card shadow-sm sm:mt-10">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40 sm:px-6 sm:py-5 sm:text-base [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-5">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
