"use client"

import type React from "react"
import { useState } from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock } from "lucide-react"
import { services } from "@/lib/services"

export default function Services() {
  const [activeTab, setActiveTab] = useState<"fills" | "full-sets" | "overlay" | "manicure" | "soak-off">("fills")

  const handleBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.querySelector("#booking")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  const filteredServices = services.filter((service) => service.category === activeTab)

  const categoryLabels = {
    fills: "Acrylic Fills",
    "full-sets": "Full Sets",
    overlay: "Overlay",
    manicure: "Manicure",
    "soak-off": "Soak Off",
  }

  return (
    <section id="services" className="bg-muted py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Our Services</h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">
            Browse our complete menu of nail services
            <br />
            <strong className="text-foreground">I don't work on other nails tech work!!!</strong>
          </p>
        </div>

        <div className="mt-12">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-3 gap-1 sm:grid-cols-5">
              <TabsTrigger value="fills" className="text-sm font-bold sm:text-base">
                Fills
              </TabsTrigger>
              <TabsTrigger value="full-sets" className="text-sm font-bold sm:text-base">
                Full Sets
              </TabsTrigger>
              <TabsTrigger value="overlay" className="text-sm font-bold sm:text-base">
                Overlay
              </TabsTrigger>
              <TabsTrigger value="manicure" className="text-sm font-bold sm:text-base">
                Manicure
              </TabsTrigger>
              <TabsTrigger value="soak-off" className="text-sm font-bold sm:text-base">
                Soak Off
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              <h3 className="mb-6 text-center font-serif text-2xl font-medium text-foreground">
                {categoryLabels[activeTab]}
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="flex flex-col transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="font-serif text-xl">{service.name}</CardTitle>
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-pretty text-muted-foreground">{service.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full bg-primary text-foreground hover:bg-primary-hover">
                        <a href="#booking" onClick={handleBookClick}>
                          Book Now
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
