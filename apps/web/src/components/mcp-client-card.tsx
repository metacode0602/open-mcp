import { Users } from "lucide-react"
import type React from "react"

import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"

interface McpClientCardProps {
  title: string
  description: string
  content: string
  icon?: React.ReactNode
}

export function McpClientCard({ title, description, content, icon }: McpClientCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon || <Users className="h-5 w-5" />}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p>{content}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  )
}

