import {apiRequest} from './client.js';

/**
 * Rezervarile echipei utilizatorului logat.
 * @param {?string=} status PENDING, CONFIRMED sau CANCELLED
 * @return {!Promise<!Array<Object>>}
 */
export function getTeamReservations(status) {
  return apiRequest('/api/reservations', {params: {status}});
}

/**
 * @param {number} reservationId
 * @return {!Promise<Object>}
 */
export function cancelReservation(reservationId) {
  return apiRequest(`/api/reservations/${reservationId}/cancel`,
      {method: 'POST'});
}
