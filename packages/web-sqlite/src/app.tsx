import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "./styles/index.css"
import {Route, Switch} from "wouter";
import FieldsPage from "./pages/fields";
import NotFoundPage from "./pages/404.tsx";
import {HomePage} from "./pages";
import NewFieldPage from "./pages/fields/new.tsx";
import EditFieldPage from "./pages/fields/[id]/edit.tsx";

export function App() {
  return (
    <>
      <Switch>
        <Route path='/' component={HomePage} />

        <Route path='/fields' component={FieldsPage} />
        <Route path='/fields/new' component={NewFieldPage} />
        <Route path='/fields/:fieldId' component={EditFieldPage} />

        <Route component={NotFoundPage} />
      </Switch>
    </>
  )
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
