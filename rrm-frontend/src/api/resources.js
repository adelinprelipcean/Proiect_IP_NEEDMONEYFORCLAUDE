import {apiRequest} from './client.js';

/** @return {!Promise<!Array<Object>>} */
export function getCategories() {
  return apiRequest('/api/categories');
}

/**
 * @param {?number=} categoryId
 * @return {!Promise<!Array<Object>>}
 */
export function getResources(categoryId) {
  return apiRequest('/api/resources', {params: {category_id: categoryId}});
}

/**
 * @param {number|string} resourceId
 * @return {!Promise<Object>}
 */
export function getResource(resourceId) {
  return apiRequest(`/api/resources/${resourceId}`);
}

/**
 * @param {number|string} resourceId
 * @return {!Promise<!Array<Object>>}
 */
export function getResourceMaintenance(resourceId) {
  return apiRequest(`/api/resources/${resourceId}/maintenance`);
}
