import {useEffect, useState} from 'react';
import {apiRequest, clearToken, getToken} from '../api/client.js';

/**
 * Utilizatorul logat (din GET /api/users/me) sau null.
 * @return {{user: ?Object, loading: boolean}}
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }
    let active = true;
    apiRequest('/api/users/me')
        .then((data) => active && setUser(data))
        .catch((error) => {
          if (error.status === 401) {
            clearToken();
          }
        })
        .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return {user, loading};
}
