import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Layout from './components/Layout.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ResourceDetailsPage from './pages/ResourceDetailsPage.jsx';

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
          <Route
            path="/resources/:resourceId"
            element={<ResourceDetailsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
