export const repositoryQuery = `
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      nameWithOwner
      description
      url
      homepageUrl
      createdAt
      updatedAt
      pushedAt
      stargazerCount
      forkCount
      mentionableUsers {
        totalCount
      }
      watchers {
        totalCount
      }
      licenseInfo {
        spdxId
      }
      repositoryTopics(first: 10) {
        nodes {
          topic {
            name
          }
        }
      }
      primaryLanguage {
        name
      }
      owner {
        login
        avatarUrl
      }
      stargazers{
        totalCount
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
        }
      }
      openGraphImageUrl
      usesCustomOpenGraphImage
      latestRelease {
        name
        tagName
        publishedAt
        url
        description
      }        
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 1) {
              totalCount
              nodes {
                committedDate
              }
            }
          }
        }
      }
    }
  }
`
