"use client"
import { RankingApp } from "@repo/db/types"
import { Eye, GitFork, Star } from "lucide-react"
import Image from "next/image"


export default function RankingAppPage({ app: product, index }: { app: RankingApp, index: number }) {
  return (
    <div
      key={product.id}
      className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-bold">
        {index + 1}
      </div>
      <Image
        src={product.icon || "/placeholder.svg"}
        alt={product.name}
        width={64}
        height={64}
        className="rounded-lg"
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-medium">{product.name}</h3>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-amber-500" />
              {product.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="h-4 w-4 text-blue-500" />
              {product.watchers.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <GitFork className="h-4 w-4 text-green-500" />
              {product.forks.toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">{product.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">{product.primaryLanguage}</span>
            {product.languages.map((lang) => (
              <span key={lang} className="text-xs text-gray-500">
                {lang}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">{product.license}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
              {(tag.name)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
