import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { TopsisProvider } from './hooks/useTOPSIS'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter><AuthProvider><TopsisProvider><App /></TopsisProvider></AuthProvider></BrowserRouter>)
