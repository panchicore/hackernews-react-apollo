import React, {Fragment} from 'react'
import {Link} from './Link'
import gql from 'graphql-tag'
import {useQuery, useSubscription} from 'react-apollo-hooks'
import {withRouter} from 'react-router'
import {LINKS_PER_PAGE} from '../constants'

export const FEED_QUERY = gql`
    query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
        feed(first: $first, skip: $skip, orderBy: $orderBy) {
            links {
                id
                createdAt
                url
                description
                postedBy {
                    id
                    name
                }
                votes {
                    id
                    user {
                        id
                    }
                }
            }
            count
        }
    }
`

const NEW_LINKS_SUBSCRIPTION = gql`
    subscription {
        newLink {
            id
            url
            description
            createdAt
            postedBy {
                id
                name
            }
            votes {
                id
                user {
                    id
                }
            }
        }
    }
`

const DELETED_LINKS_SUBSCRIPTION = gql`
    subscription {
        deletedLink {
            id
        }
    }
`

function LinkList(props) {

  const _getQueryVariables = () => {
    const isNewPage = props.location.pathname.includes('new')
    const page = parseInt(props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {first, skip, orderBy}
  }

  const {loading, error, data} = useQuery(FEED_QUERY, {
    variables: _getQueryVariables(),
  })

  useSubscription(NEW_LINKS_SUBSCRIPTION, {
    onSubscriptionData: ({client, subscriptionData}) => {
      const data = client.readQuery({query: FEED_QUERY, variables: _getQueryVariables()})
      data.feed.links.unshift(subscriptionData.data.newLink)
      client.writeQuery({query: FEED_QUERY, data, variables: _getQueryVariables()})
    },
  })

  useSubscription(DELETED_LINKS_SUBSCRIPTION, {
    onSubscriptionData: ({client, subscriptionData}) => {
      const data = client.readQuery({query: FEED_QUERY, variables: _getQueryVariables()})
      data.feed.links = data.feed.links.filter(link => link.id !== subscriptionData.data.deletedLink.id)
      client.writeQuery({query: FEED_QUERY, data, variables: _getQueryVariables()})
    },
  })


  const _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({query: FEED_QUERY})
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    store.writeQuery({query: FEED_QUERY, data})
  }

  const _updateCacheAfterDelete = (store, linkId) => {
    const data = store.readQuery({query: FEED_QUERY})
    data.feed.links = data.feed.links.filter(link => link.id !== linkId)
    store.writeQuery({query: FEED_QUERY, data})
  }

  if (loading) return <div>Fetching</div>
  if (error) return <div>Error</div>


  // const linksToRender = data.feed.links
  const _getLinksToRender = data => {
    const isNewPage = props.location.pathname.includes('new')
    if (isNewPage) {
      return data.feed.links
    }
    const rankedLinks = data.feed.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  const _nextPage = data => {
    const page = parseInt(props.match.params.page, 10)
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      props.history.push(`/new/${nextPage}`)
    }
  }

  const _previousPage = () => {
    const page = parseInt(props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      props.history.push(`/new/${previousPage}`)
    }
  }

  const linksToRender = _getLinksToRender(data)
  const isNewPage = props.location.pathname.includes('new')
  const pageIndex = props.match.params.page ? (props.match.params.page - 1) * LINKS_PER_PAGE : 0


  return (
    <Fragment>
      {linksToRender.map((link, index) => (
        <Link
          key={link.id}
          link={link}
          index={index}
          updateStoreAfterVote={_updateCacheAfterVote}
          updateStoreAfterDelete={_updateCacheAfterDelete}
        />
      ))}

      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={_previousPage}>
            Previous
          </div>
          <div className="pointer" onClick={() => _nextPage(data)}>
            Next
          </div>
        </div>
      )}

    </Fragment>
  )

}

export default withRouter(LinkList)
