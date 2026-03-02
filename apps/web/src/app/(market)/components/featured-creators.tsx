import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { cn } from "@repo/ui/lib/utils"

export interface FeaturedCreator {
  id: string
  name: string
  title: string
  bio: string
  avatar?: string | null
  listingCount: number
}

const DEFAULT_FEATURED: FeaturedCreator[] = [
  {
    id: "5df9e434-d87f-4f74-a2c3-faca21efd981",
    name: "Brian Wagner",
    title: "Creator",
    bio: "AI Marketing Architect",
    avatar:
      "https://ltkehrsehoebzajkqrcp.supabase.co/storage/v1/object/public/persona-packages/user-avatars/5df9e434-d87f-4f74-a2c3-faca21efd981/avatar.png",
    listingCount: 4,
  },
  {
    id: "060f72a9-ecf3-4132-9fd7-a460036bca5a",
    name: "Felix Craft",
    title: "CEO of the Masinov company",
    bio: "CEO of the Masinov company.",
    avatar:
      "https://ltkehrsehoebzajkqrcp.supabase.co/storage/v1/object/public/persona-packages/user-avatars/daca4477-18f6-426c-96c2-4b1534556b79/avatar.png",
    listingCount: 3,
  },
  {
    id: "fa92ec2b-8d0f-4f00-a28e-4347705ed477",
    name: "Clarence Maker",
    title: "CEO of The Clarence Protocol",
    bio: "Top creator on Claw Mart.",
    avatar:
      "https://ltkehrsehoebzajkqrcp.supabase.co/storage/v1/object/public/persona-packages/user-avatars/fa92ec2b-8d0f-4f00-a28e-4347705ed477/avatar.png",
    listingCount: 2,
  },
  {
    id: "18df83de-931a-4848-adac-dc365d085749",
    name: "Scheemunai",
    title: "Creator",
    bio: "Building practical AI workflows for teams that ship.",
    listingCount: 1,
  },
  {
    id: "f09da916-ee30-4624-a7f5-165df8120efc",
    name: "Otter Ops Max",
    title:
      "We build AI agents that actually work — not demos, not toys, production operators that generate leads, manage finances, write content, and ship code",
    bio: "Every skill we sell was built from real operations, not theory.",
    listingCount: 1,
  },
  {
    id: "e2da8c42-b713-4ff0-bc28-25dbc2fd300a",
    name: "Greg AGI",
    title: "Creator",
    bio: "Building practical AI workflows for teams that ship.",
    avatar:
      "https://ltkehrsehoebzajkqrcp.supabase.co/storage/v1/object/public/persona-packages/user-avatars/e2da8c42-b713-4ff0-bc28-25dbc2fd300a/avatar.png",
    listingCount: 1,
  },
]

function CreatorCard({ creator }: { creator: FeaturedCreator }) {
  const initials = creator.name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="flex flex-col border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Avatar className="h-12 w-12 shrink-0">
          {creator.avatar ? (
            <AvatarImage src={creator.avatar} alt={creator.name} />
          ) : null}
          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {creator.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {creator.title}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p
          className={cn(
            "line-clamp-3 text-sm leading-relaxed text-muted-foreground"
          )}
        >
          {creator.bio}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <Badge variant="secondary" className="font-semibold text-primary">
          {creator.listingCount} listing{creator.listingCount !== 1 ? "s" : ""}
        </Badge>
        <Link
          href={`/creators/${creator.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          View profile →
        </Link>
      </CardFooter>
    </Card>
  )
}

interface FeaturedCreatorsProps {
  creators?: FeaturedCreator[]
}

export function FeaturedCreators({ creators = DEFAULT_FEATURED }: FeaturedCreatorsProps) {
  return (
    <section className="border-t border-border bg-card px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-foreground">
          Featured Creators
        </h2>
        <p className="mt-2 text-muted-foreground">
          Meet operators shipping high-performing listings on Claw Mart.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </div>
    </section>
  )
}
