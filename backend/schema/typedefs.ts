export const typeDefs = `#graphql
type Post {
    _id: ID
    title: String
    content: String
    order: Int
}

type Mutation {
    createPost(title: String!, content: String, order: Int): Post
    deletePost(id: ID): Boolean
    updatePostOrder(id: ID, newOrder: Int): Boolean
}

type Query {
    posts: [Post]
}

type Subscription {
  postCreated: Post
}
`;
