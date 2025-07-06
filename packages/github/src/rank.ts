import { graphql } from "@octokit/graphql"
import { z } from "zod"

const query = `
query getTrendingRepositories($queryString: String!) {
  search(query: $queryString, type: REPOSITORY, first: 10) {
    nodes {
      ... on Repository {
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        createdAt
        updatedAt
        primaryLanguage {
          name
          color
        }
        owner {
          login
          avatarUrl
        }
        issues {
          totalCount
        }
        pullRequests {
          totalCount
        }
        releases {
          totalCount
        }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          nodes {
            name
            color
          }
        }
      }
    }
  }
}
`;

// 定义语言相关的 schema
const LanguageSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
})

// 定义仓库所有者的 schema
const OwnerSchema = z.object({
  login: z.string(),
  avatarUrl: z.string(),
})

// 定义统计数据的 schema
const CountSchema = z.object({
  totalCount: z.number(),
})

// 定义仓库的 schema
const zRepositorySchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  homepageUrl: z.string().nullable(),
  stargazerCount: z.number(),
  forkCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  primaryLanguage: LanguageSchema.nullable(),
  owner: OwnerSchema,
  issues: CountSchema,
  pullRequests: CountSchema,
  releases: CountSchema,
  languages: z.object({
    nodes: z.array(LanguageSchema),
  }),
});

export type GithubRepository = z.infer<typeof zRepositorySchema>;

// 定义 GraphQL 查询结果的 schema
const QueryResultSchema = z.object({
  search: z.object({
    nodes: z.array(zRepositorySchema),
  }),
})

export const createRankClient = (token: string) => {
  const client = graphql.defaults({
    headers: { authorization: `token ${token}` },
  })

  return {
    async getDailyRank(): Promise<GithubRepository[]> {
      const date = new Date()
      const fromDate = new Date(date.setDate(date.getDate() - 1)).toISOString()

      try {
        const result = await client(query, {
          queryString: `created:>${fromDate} sort:stars-desc`,
        })

        const validatedResult = QueryResultSchema.parse(result)
        return validatedResult.search.nodes.map(node => ({
          ...node
        }))
      } catch (error) {
        console.error('获取日排行失败:', error)
        return []
      }
    },

    async getDailyRankByDate(dateStr: string): Promise<GithubRepository[]> {
      const date = new Date(dateStr)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      try {
        const result = await client(query, {
          queryString: `created:${date.toISOString()}..${nextDate.toISOString()} sort:stars-desc`,
        })

        const validatedResult = QueryResultSchema.parse(result)
        return validatedResult.search.nodes.map(node => ({
          ...node
        }))
      } catch (error) {
        console.error('获取指定日期排行失败:', error)
        return []
      }
    },

    async getWeeklyRank(): Promise<GithubRepository[]> {
      const date = new Date()
      const fromDate = new Date(date.setDate(date.getDate() - 7)).toISOString()

      try {
        const result = await client(query, {
          queryString: `created:>${fromDate} sort:stars-desc`,
        })

        const validatedResult = QueryResultSchema.parse(result)
        return validatedResult.search.nodes.map(node => ({
          ...node
        }))
      } catch (error) {
        console.error('获取周排行失败:', error)
        return []
      }
    },

    async getWeeklyRankByDate(dateStr: string): Promise<GithubRepository[]> {
      const date = new Date(dateStr)
      const endDate = new Date(date)
      endDate.setDate(date.getDate() + 7)

      try {
        const result = await client(query, {
          queryString: `created:${date.toISOString()}..${endDate.toISOString()} sort:stars-desc`,
        })

        const validatedResult = QueryResultSchema.parse(result)
        return validatedResult.search.nodes.map(node => ({
          ...node
        }))
      } catch (error) {
        console.error('获取指定周排行失败:', error)
        return []
      }
    },

    async getMonthlyRank(): Promise<GithubRepository[]> {
      const date = new Date()
      const fromDate = new Date(date.setDate(date.getDate() - 30)).toISOString()

      try {
        const result = await client(query, {
          queryString: `created:>${fromDate} sort:stars-desc`,
        })

        const validatedResult = QueryResultSchema.parse(result)
        return validatedResult.search.nodes.map(node => ({
          ...node,
        }))
      } catch (error) {
        console.error('获取月排行失败:', error)
        return []
      }
    },

    async getMonthlyRankByDate(dateStr: string): Promise<GithubRepository[]> {
      const date = new Date(dateStr)
      const endDate = new Date(date)
      endDate.setMonth(date.getMonth() + 1)

      try {
        const result = await client(query, {
          queryString: `created:${date.toISOString()}..${endDate.toISOString()} sort:stars-desc`,
        })

        const validatedResult = QueryResultSchema.parse(result)
        return validatedResult.search.nodes.map(node => ({
          ...node
        }))
      } catch (error) {
        console.error('获取指定月排行失败:', error)
        return []
      }
    }
  }
}