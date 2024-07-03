// src/main.tsx
// import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Login from './pages/login';
import './index.css';
import { ThemeProvider } from "@/components/theme-provide";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import ProtectedRoute from './ProtectedRoute';
import Signup from './pages/signup';
import { store } from './store'
import { Provider } from 'react-redux'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
    </>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </Provider>
    </ThemeProvider>
  // </React.StrictMode>,
);
