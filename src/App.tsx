import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Predict from './pages/Predict'
import Compare from './pages/Compare'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"        element={<Predict />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/about"   element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
