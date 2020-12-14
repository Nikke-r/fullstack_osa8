require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const pubSub = new PubSub()

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('Connected to MongoDB')
}).catch(error => {
  console.log(`Error while connecting to MongoDB: ${error.message}`)
})

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
    getRecommendations: [Book!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      try {
        if (args.genre) {
          return Book.find({ genres: { $in: [args.genre] }}).populate('author')
        } else if (args.author) {
          const author = await Author.findOne({ name: args.author })
          return Book.find({ author: author.id })
        }

        return Book.find({}).populate('author')
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    allAuthors: async () => {
      try {
        
      const authors = await Author.find({})

      return authors
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    getRecommendations: async (root, args, context) => {
      const user = context.currentUser
      const books = await Book.find({}).populate('author')
      return books.filter(book => book.genres.includes(user.favoriteGenre))
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      try {

        const currentUser = context.currentUser

        if (!currentUser) {
          throw new AuthenticationError("Unauthorized!")
        }

        let author = await Author.findOne({ name: args.author })

        if (!author) {
          author = new Author({ name: args.author, bookCount: 0 })
        }

        author.bookCount = author.bookCount + 1

        await author.save()

        const book = new Book({ ...args, author })

        await book.save()

        pubSub.publish('BOOK_ADDED', { bookAdded: book })

        return book
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    editAuthor: async (root, args, context) => {
      try {

        const currentUser = context.currentUser

        if (!currentUser) {
          throw new AuthenticationError("Unauthorized!")
        }

        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo

        return (await author.save())
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })

      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'hemone') {
        throw new UserInputError('Invalid username or password')
      }
  
      const tokenStuff = {
        username: user.username,
        id: user._id
      }
  
      return { value: jwt.sign(tokenStuff, process.env.JWT_SECRET) }
    },
  },
  Book: {
    author: (root) => {
      return {
        name: root.author.name
      }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubSub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.toLocaleLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at: ${subscriptionsUrl}`)
})