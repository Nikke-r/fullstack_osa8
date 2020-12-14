import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, GET_BY_GENRE } from '../queries'

const Books = (props) => {
  const [filter, setFilter] = useState()
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const result = useQuery(ALL_BOOKS, {
    pollInterval: 2000
  })
  const [getByGenre, { loading, data }] = useLazyQuery(GET_BY_GENRE)

  const showBooks = filter ? filteredBooks : books

  useEffect(() => {
    if (result.data) {
      setBooks(result.data.allBooks)
      const foundGenres = []
      result.data.allBooks.forEach(book => {
        book.genres.forEach(genre => {
          if (foundGenres.includes(genre)) return
          foundGenres.push(genre)
        })
      })
      setGenres(foundGenres)
    }
  }, [result.data])

  useEffect(() => {
    if (filter) {
      getByGenre({ variables: { genre: filter }})
    }
  }, [filter])

  useEffect(() => {
    if (data) {
      setFilteredBooks(data.allBooks)
    }
  }, [data])

  if (!props.show) {
    return null
  }

  if (result.loading || loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {showBooks.map(book =>  (
              <tr key={book.title}>
                <td> {book.title} </td>
                <td> {book.author.name} </td>
                <td> {book.published} </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {genres.map(genre => (
        <button key={genre} onClick={() => setFilter(genre)} > {genre} </button>
      ))}
      <button onClick={() => setFilter()}>All genres</button>
    </div>
  )
}

export default Books