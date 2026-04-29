import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { BuilderPage } from './pages/BuilderPage'
import { PublicFormPage } from './pages/PublicFormPage'
import { EmbedPage } from './pages/EmbedPage'
import { ResponsesPage } from './pages/ResponsesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder/:formId" element={<BuilderPage />} />
        <Route path="/form/:formId" element={<PublicFormPage />} />
        <Route path="/embed/:formId" element={<EmbedPage />} />
        <Route path="/responses/:formId" element={<ResponsesPage />} />
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-svh text-navy/40 font-light">
              404 — Page not found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
