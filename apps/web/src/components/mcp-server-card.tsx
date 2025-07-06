import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Server } from "lucide-react"
import type React from "react"

interface Feature {
  text: string
}

interface McpServerCardProps {
  title: string
  description: string
  content: string
  features: Feature[]
  icon?: React.ReactNode
}

export function McpServerCard({ title, description, content, features, icon }: McpServerCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon || <Server className="h-5 w-5" />}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p>{content}</p>
        <div className="mt-4 space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Documentation
        </Button>
        <Button className="flex-1">Install</Button>
      </CardFooter>
    </Card>
  )
}

