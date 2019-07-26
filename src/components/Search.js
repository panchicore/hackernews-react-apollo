import React, {useEffect, useState} from 'react'
import {withApollo} from 'react-apollo'
import {Link} from './Link'
import gql from 'graphql-tag'
import {useQuery} from 'react-apollo-hooks'

const FEED_SEARCH_QUERY = gql`
    query FeedSearchQuery($filter: String!) {
        feed(filter: $filter) {
            links {
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
    }
`

function SearchResults(props){

  const [links, setLinks] = useState([])

  const {loading, error, data} = useQuery(FEED_SEARCH_QUERY, {
    variables: {filter: props.filter}
  })

  useEffect(() => {
    if(data){
      setLinks(data.feed.links)
    }
  }, [data])

  return (
    <div>
      {links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  )
}

function Search() {

  const [filter, setFilter] = useState('')

  return (
    <div>
      <div>
        Search
        <input
          type='text'
          onChange={e => setFilter(e.target.value)}
        />
        <button onClick={() => {}}>OK</button>
      </div>
      {filter.length > 1 &&
        <SearchResults filter={filter}/>
      }
    </div>
  )
}

export default withApollo(Search)