import express from "express";
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pino from 'pino';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema/typedefs';
import { resolvers } from './resolvers/resolvers';
import { expressMiddleware } from '@apollo/server/express4';


interface Context {
    token?: string;
  }

dotenv.config({
  path: '../.env'
});

const { FRONTEND_ORIGIN ='', MONGO_URL = '' } = process.env

const app = express()
app.use(pino);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Start the apollo server
const httpServer = http.createServer(app);

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/subscribeToNewPosts',
});

const serverCleanup = useServer({ schema }, wsServer);
const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), 
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

mongoose.connect(MONGO_URL).then( async () => {
  console.log('STARTING SERVER');
  await server.start()
  app.use('/graphql', cors({
    origin: FRONTEND_ORIGIN,
  }), bodyParser.json(), expressMiddleware(server));
  httpServer.listen(6000);
}).catch(err => {
  throw new Error(err);
})
