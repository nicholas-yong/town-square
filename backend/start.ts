import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import winston, { Logger } from 'winston';
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

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ]
});

const { FRONTEND_ORIGIN = 'http://localhost:4000', MONGO_URL = '' } = process.env;

const app = express();
app.use(express.static(path.resolve(process.cwd(), 'frontend/dist')));
app.use((req, _, next) => {
  req.logger = logger;
  next();
})

try {
  await mongoose.connect(MONGO_URL);
} catch (error) {
  console.error('Error in connecting to Mongo', error);
}

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

app.get('/*', (_, res) => {
  res.sendFile(path.resolve(process.cwd(), 'frontend/dist/index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/api/graphql`);
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/graphql`);
});
