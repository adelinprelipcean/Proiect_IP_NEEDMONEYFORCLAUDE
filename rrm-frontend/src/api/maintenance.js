import {apiRequest} from './client.js';

/**
 * Rezervarile care ar fi anulate de o mentenanta in intervalul dat.
 * @param {number} resourceId
 * @param {string} startTime format 'YYYY-MM-DDTHH:mm'
 * @param {string} endTime
 * @return {!Promise<!Array<Object>>}
 */
export function getAffectedReservations(resourceId, startTime, endTime) {
  return apiRequest(
      `/api/resources/${resourceId}/maintenance/affected-reservations`,
      {params: {start_time: startTime, end_time: endTime}});
}

/**
 * Seteaza o perioada de mentenanta (endpoint-ul din NEED-31).
 * @param {number} resourceId
 * @param {{start_time: string, end_time: string, reason: string}} data
 * @return {!Promise<Object>}
 */
export function createMaintenance(resourceId, data) {
  return apiRequest(`/api/resources/${resourceId}/maintenance`,
      {method: 'POST', body: data});
}
