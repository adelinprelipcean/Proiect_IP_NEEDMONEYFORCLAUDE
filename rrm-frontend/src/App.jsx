import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Layout from './components/Layout.jsx';
import CatalogPage from './pages/CatalogPage.jsx';

/**
 * Rutele aplicatiei.
 * @return {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
