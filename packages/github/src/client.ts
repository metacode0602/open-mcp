import { graphql } from "@octokit/graphql"
import { repositoryQuery } from "./queries"
import type { RepositoryData, RepositoryQueryResult } from "./types"
import { getRepository, prepareRepositoryData } from "./utils"

export const createGithubClient = (token: string) => {
  const client = graphql.defaults({
    headers: { authorization: `token ${token}` },
  })

  return {
    async queryRepository(repository: string): Promise<RepositoryData | null> {
      const repo = getRepository(repository)
      console.info("[client.ts] [createGithubClient] [queryRepository] repo", repo, repository)
      try {
        if (!repo?.owner || !repo?.name) {
          throw new Error('Invalid repository format. Expected owner/name')
        }
        const { repository: result } = await client<{ repository: RepositoryQueryResult }>(
          repositoryQuery,
          {
            owner: repo.owner,
            name: repo.name,
          }
        )
        console.info("[client.ts] [createGithubClient] [queryRepository] repository", JSON.stringify(result))
        return prepareRepositoryData(result)
      } catch (error) {
        console.error(`Failed to fetch repository ${repo?.name}:`, error)
        return null
      }
    },
  }
}
