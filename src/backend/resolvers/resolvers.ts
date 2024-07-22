import { Logger } from 'pino';
import { PubSub } from 'graphql-subscriptions';
import { PostModel, CountersModel } from '../models.js';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    posts: async () => {
      return await PostModel.find({}).sort({ order: 1 });
    },
  },
  Mutation: {
    createPost: async (_, { title, content }: { title: string; content: string }, { logger }: { logger: Logger }) =>
      createPost(logger, title, content),
    deletePost: async (_, { id }: { id: string }, { logger }: { logger: Logger }) => deletePost(logger, id),
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
    },
  },
};

export const createPost = async (logger: Logger, title: string, content: string) => {
  try {
    logger.debug('Creating post', {
      title,
      content,
    });

    // Increment count
    const order = await CountersModel.findByIdAndUpdate(
      {
        _id: 'userId',
      },
      {
        $inc: {
          seq: 1,
        },
      },
    );

    const publishPost = await PostModel.create({
      title,
      content,
      order,
    });

    pubsub.publish('POST_CREATED', {
      postCreated: publishPost,
    });

    return publishPost;
  } catch (error) {
    logger.error('Error in createPost', { error });
  }
};

export const deletePost = async (logger: Logger, id: string) => {
  try {
    logger.debug('Deleting post', {
      id,
    });

    await PostModel.deleteOne({
      _id: id,
    });
  } catch (error) {
    logger.error('Error in deletePost', { error });
  }
};
