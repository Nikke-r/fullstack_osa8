
import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import { useApolloClient, useSubscription } from '@apollo/client'
import Notify from './components/Notify'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED } from './subscriptions'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    client.resetStore()
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      setToken(token)
    }
    
  }, [setToken])

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      window.alert(`Book added ${subscriptionData.data.bookAdded.title} by ${subscriptionData.data.bookAdded.author.name} added!`)
    }
  })

  return (
    <div>
      <div>
        {error && <Notify message={error} />}
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ?
        <>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => setPage('recommendations')}>recommend</button>
          <button onClick={logout}>Logout</button>
        </>
        :
        <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />


      <NewBook
        show={page === 'add'}
      />

      <Recommendations
        show={page === 'recommendations'}
      />

      {!token &&
      <LoginForm 
        show={page === 'login'}
        setToken={setToken}
        setError={setError}
      />}
    </div>
  )
}

export default App