/**
 * Client HTTP pentru API-ul RRM (FastAPI).
 * Tokenul JWT primit la login se salveaza cu saveToken().
 */

const TOKEN_KEY = 'rrm_token';

/** Eroare cu codul HTTP, ca paginile sa poata trata 401/403/409. */
export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** @return {?string} */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** @param {string} token */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Sterge tokenul (logout). */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * @param {*} detail campul `detail` din raspunsul FastAPI
 * @return {string}
 */
function formatDetail(detail) {
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join('; ');
  }
  return detail || 'A aparut o eroare';
}

/**
 * @param {string} path ex. '/api/resources'
 * @param {{method?: string, body?: Object, params?: Object}=} options
 * @return {!Promise<*>}
 */
export async function apiRequest(path, {method = 'GET', body, params} = {}) {
  const query = params ?
    '?' + new URLSearchParams(
        Object.entries(params).filter(([, value]) => value != null &&
          value !== ''),
    ) :
    '';
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path + query, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, formatDetail(data?.detail));
  }
  return data;
}
