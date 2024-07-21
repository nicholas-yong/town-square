import PostSchema from '../models';

export const resolvers = {
    Query: {
        getPosts: () => PostSchema.find({}).sort({ order: 1 })
    },
    Mutation: {
        createPost: (_, { title, content }: { title: string, content: string}) => PostSchema.create({ title, content }),
        deletePost: (_, { id }: { id: string }) => PostSchema.deleteOne({ _id: id })
    }
}
