import {NavLink, Outlet} from 'react-router-dom';
import {clearToken} from '../api/client.js';
import {useCurrentUser} from '../hooks/useCurrentUser.js';

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  LEAD: 'Team Lead',
  MEMBER: 'Membru',
};

/**
 * Header-ul aplicatiei si zona in care se afiseaza paginile.
 * @return {JSX.Element}
 */
export default function Layout() {
  const {user} = useCurrentUser();

  const handleLogout = () => {
    clearToken();
    window.location.assign('/');
  };

  return (
    <div className="app">
      <header className="header">
        <span className="logo">RRM</span>
        <nav className="nav">
          <NavLink to="/" end>Catalog</NavLink>
          {user && user.team_id && (
            <NavLink to="/reservations">Rezervarile echipei</NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/maintenance">Mentenanta</NavLink>
          )}
        </nav>
        {user && (
          <div className="user-info">
            <span>{user.name}</span>
            <span className="badge">{ROLE_LABELS[user.role] || user.role}</span>
            <button className="btn btn-link" onClick={handleLogout}>
              Iesire
            </button>
          </div>
        )}
      </header>
      <main className="content">
        <Outlet context={{user}} />
      </main>
    </div>
  );
}
