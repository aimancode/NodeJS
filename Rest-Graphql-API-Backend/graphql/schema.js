const { buildSchema } = require("graphql");
module.exports = /* GraphQL */ buildSchema(`
    type Post {
        _id: ID!
        title:String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post]!
        totalPosts: Int!
    }

    type RootQuery{
        login(email:String!, password:String!): AuthData!

        # getting the posts
        posts(page: Int): PostData!

        # fetching a single post
        post(id: ID!): Post!

        # Query for getting the status
        user: User!
        
    }

    #data used as input 
    input UserInputData {
        email: String!
        password: String!
        name: String!
    }

    #post input data to retrieve single post
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): Boolean
        updateStatus(status: String!):User!
    }

    schema {
    mutation: RootMutation
    query: RootQuery
  }
`);
