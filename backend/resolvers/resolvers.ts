import { Logger, P } from 'pino';
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
    createPost: async (_, { title, content }: { title: string; content: string }, { logger }: { logger: Logger }) => createPost(logger, title, content),
    deletePost: async (_, { id }: { id: string }, { logger }: { logger: Logger }) => deletePost(logger, id),
    updatePostOrder: async(_, { id, newOrder}: { id: string, newOrder: number}, { logger }: { logger: Logger }) => updatePostOrder(logger, id, newOrder)
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
    },
  },
};

export const updatePostOrder = async (logger: Logger, id: string, newOrder: number) => {
  try {
    logger.debug('Updating post order', {
      id,
      newOrder
    })

    await PostModel.updateOne({
      _id: id,
    }, {
      $set: {
        order: newOrder
      }
    })
  }
  catch(error) {
    logger.error('Error in createPost', { error: error.toString() });
  }
}

export const createPost = async (logger: Logger, title: string, content: string) => {
  try {
    logger.debug('Creating post', {
      title,
      content,
    });

    // Get the current highest order
    const orderResult = await PostModel.find({}).sort({
      order: 'desc'
    }).limit(1);


    const currentOrder = (orderResult[0]?.order|| -1 ) + 1;

    const publishPost = await PostModel.create({
      title,
      content,
      order: currentOrder,
    });

    pubsub.publish('POST_CREATED', {
      postCreated: publishPost,
    });

    return publishPost;
  } catch (error) {
    logger.error('Error in createPost', { error: error.toString() });
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
