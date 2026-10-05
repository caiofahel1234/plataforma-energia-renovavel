import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TopsisProvider } from './hooks/useTOPSIS'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter><TopsisProvider><App /></TopsisProvider></BrowserRouter>)
