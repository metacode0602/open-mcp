export type Repository = {
  owner: string
  name: string
}

export type RepositoryData = {
  name: string
  nameWithOwner: string
  description?: string
  url: string
  homepageUrl?: string
  stars: number
  forks: number
  contributors: number
  watchers: number
  pushedAt: Date
  createdAt: Date
  score: number
  license: string | null
  topics: string[]
  languages: string[]
  owner: {
    login: string
    avatarUrl: string
  }
  issues: number
  pullRequests: number
  releases: number
  primaryLanguage: string | null
  lastCommitDate: Date | null
  commits: number //提交次数
  openGraphImageUrl: string | null
  latestRelease: {
    tagName: string
    publishedAt: Date
    description: string
    name: string
    url: string
  } | null
  // Add any other fields you need from the GraphQL query
}

export type RepositoryQueryResult = {
  name: string
  nameWithOwner: string
  description?: string
  url: string
  homepageUrl?: string
  createdAt: Date
  updatedAt: Date
  pushedAt: Date
  stargazerCount: number
  forkCount: number
  watchers: {
    totalCount: number
  }
  mentionableUsers: {
    totalCount: number
  }
  licenseInfo: {
    spdxId: string
  } | null
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string
      }
    }>
  }
  primaryLanguage: {
    name: string
  } | null
  owner: {
    login: string
    avatarUrl: string
  }
  issues: {
    totalCount: number
  }
  pullRequests: {
    totalCount: number
  }
  releases: {
    totalCount: number
  }
  languages: {
    nodes: Array<{
      name: string
    }>
  }
  // 主分支最近提交的时间
  defaultBranchRef: {
    target: {
      history: {
        totalCount: number
        nodes: Array<{
          committedDate: Date
        }>
      }
    }
  }
  openGraphImageUrl: string | null
  latestRelease: {
    tagName: string
    publishedAt: Date
    description: string
    name: string
    url: string
  } | null
  // Add any other fields you need from the GraphQL query
}
