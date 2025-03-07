import { useQuery } from '@apollo/client'  
import React from 'react'
import { ALL_AUTHORS } from '../queries'
import EditYear from './EditYear'

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS, {
    pollInterval: 2000
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <EditYear authors={result.data.allAuthors} />
    </div>
  )
}

export default Authors
