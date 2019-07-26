import React from 'react'
import {AUTH_TOKEN} from '../constants'
import {timeDifferenceForDate} from '../utils'
import gql from 'graphql-tag'
import {useMutation} from 'react-apollo-hooks'

const VOTE_MUTATION = gql`
    mutation VoteMutation($linkId: ID!) {
        vote(linkId: $linkId) {
            id
            link {
                votes {
                    id
                    user {
                        id
                    }
                }
            }
            user {
                id
            }
        }
    }
`

const DELETE_LINK_MUTATION = gql`
    mutation DeleteLinkMutation($linkId: ID!){
        deleteLink(linkId: $linkId){
            id
        }
    }
`


export function Link(props) {
  const authToken = localStorage.getItem(AUTH_TOKEN)
  const [voteMutation, {loading, error, data}] = useMutation(VOTE_MUTATION, {
    variables: { linkId: props.link.id },
    update: (store, { data: { vote } }) => {
      props.updateStoreAfterVote(store, vote, props.link.id)
    }
  })

  const [deleteLinkMutation] = useMutation(DELETE_LINK_MUTATION, {
    variables: {linkId: props.link.id},
    update: (store, response) => {
      props.updateStoreAfterDelete(store, props.link.id)
    }
  })

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {authToken && (
          <div className="ml1 gray f11" onClick={voteMutation}>
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {props.link.description} ({props.link.url})
        </div>
        <div className="f6 lh-copy gray">
          {props.link.votes.length} votes | by{' '}
          {props.link.postedBy
            ? props.link.postedBy.name
            : 'Unknown'}{' '}
          {timeDifferenceForDate(props.link.createdAt)} | {' '} <span onClick={deleteLinkMutation}>delete</span>
        </div>
      </div>
    </div>
  )
}
