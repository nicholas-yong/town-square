import PostSchema from '../models.js';

export const resolvers = {
    Query: {
        posts: () => { 
            return PostSchema.find({}).sort({ order: 1 }) 
        }
    },
    Mutation: {
        createPost: (_, { title, content }: { title: string, content: string}) => PostSchema.create({  title, content }),
        deletePost: (_, { id }: { id: string }) => PostSchema.deleteOne({ _id: id })
    }
}
