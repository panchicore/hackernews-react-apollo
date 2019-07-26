import React, {useState} from 'react'
import gql from 'graphql-tag'
import {withRouter} from 'react-router'
import {FEED_QUERY} from './LinkList'
import {useMutation} from 'react-apollo-hooks'
import {LINKS_PER_PAGE} from '../constants'

const POST_MUTATION = gql`
    mutation PostMutation($description: String!, $url: String!) {
        postLink(description: $description, url: $url) {
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
    }
`

function CreateLink(props) {
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  const [postMutation, {data}] = useMutation(POST_MUTATION, {
    variables: {
      description, url,
    },
    update: (store, {data: {postLink}}) => {
      const first = LINKS_PER_PAGE
      const skip = 0
      const orderBy = 'createdAt_DESC'
      const data = store.readQuery({query: FEED_QUERY}, {
        variables: {first, skip, orderBy},
      })
      data.feed.links.unshift(postLink)
      store.writeQuery({query: FEED_QUERY, data, variables: {first, skip, orderBy}})
    },
  })

  if (data) {
    props.history.push('/')
  }

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={e => setUrl(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>

      <button onClick={postMutation}>Submit</button>


    </div>
  )
}

export default withRouter(CreateLink)