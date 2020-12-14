import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, split } from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : null
        }
    }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const webSocketLink = new WebSocketLink({
    uri: 'ws://localhost:4000/graphql',
    options: {
        reconnect: true
    }
})

const splitLink = split(
    ({ query }) => {
        const definiton = getMainDefinition(query)
        return (
            definiton.kind === 'OperationDefinition' &&
            definiton.operation === 'subscription'
        )
    },
    webSocketLink,
    authLink.concat(httpLink)
)

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
, document.getElementById('root'))