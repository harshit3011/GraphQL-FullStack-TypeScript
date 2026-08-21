import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import './index.css'
import App from './App.tsx'
import client from './apollo.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
    <App />
    </ApolloProvider>
  </StrictMode>,
)
