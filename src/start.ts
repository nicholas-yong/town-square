import express from "express";
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pino from 'pino';
import path from 'path';
import cors from 'cors';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema/typedefs.js';
import { resolvers } from './resolvers/resolvers.js';
import { expressMiddleware } from '@apollo/server/express4';

const PORT = 4000;

interface Context {
    token?: string;
}


dotenv.config({
  path: '../.env'
});

const { FRONTEND_ORIGIN ='', MONGO_URL = '' } = process.env

const app = express()
const logger = pino();

app.use((req) => {
  req.logger = logger;
})

app.use(express.static("public"));
app.use(express.json());

try {
  await mongoose.connect(MONGO_URL);
}
catch(error) {
  console.error("Error in connecting to Mongo", error)
}


app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Start the apollo server
const httpServer = http.createServer(app);

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api/graphql',
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

await server.start()
app.use('/api/graphql', cors<cors.CorsRequest>(), expressMiddleware(server));

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/api/graphql`);
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/api/graphql`);
}); 
