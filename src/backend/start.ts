import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import pino, { Logger } from 'pino';
import cors from 'cors';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema/typedefs.js';
import { resolvers } from './resolvers/resolvers.js';
import { expressMiddleware } from '@apollo/server/express4';

type ApolloServerContext = {
  logger: Logger;
};

const PORT = 4000;

dotenv.config({
  path: '../.env',
});

const { FRONTEND_ORIGIN = '', MONGO_URL = '' } = process.env;

const app = express();
const logger = pino();

app.use(req => {
  req.logger = logger;
});

app.use(express.static('public'));

try {
  await mongoose.connect(MONGO_URL);
} catch (error) {
  console.error('Error in connecting to Mongo', error);
}

app.get('/', (_, res) => {
  res.sendFile('../frontend/index.html');
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Start the apollo server
const httpServer = http.createServer(app);

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);
const server = new ApolloServer<ApolloServerContext>({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  '/api/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      logger: req.logger || ({} as Logger),
    }),
  }),
);

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/api/graphql`);
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/graphql`);
});
