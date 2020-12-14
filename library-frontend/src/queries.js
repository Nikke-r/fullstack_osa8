import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            bookCount
        }
    }
`

export const ALL_BOOKS = gql`
    query {
        allBooks {
            title
            author {
                name
            }
            published
            genres
        }
    }
`

export const ME = gql`
    query {
        me {
            username
            favoriteGenre
        }
    }
`

export const GET_RECOMMENDATIONS = gql`
    query {
        getRecommendations {
            title
            author {
                name
            }
            published
            genres
        }
    }
`

export const GET_BY_GENRE = gql`
    query allBooks($genre: String!) {
        allBooks(
            genre: $genre
        ) {
            title
            author {
                name
            }
            published
            genres
        }
    }
`