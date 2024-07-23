import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const apolloClient = new ApolloClient({
  uri: `http://localhost:4000/api/graphql`,
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
        <App />
    </ApolloProvider>
  </React.StrictMode>,
)
