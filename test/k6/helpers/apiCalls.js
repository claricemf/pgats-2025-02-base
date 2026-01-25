import http from 'k6/http';
import { BASE_URL } from './baseURL.js';
export function postCall(resource, payload, params = {headers: {
          'Content-Type': 'application/json',
        },}){
    return http.post(`${BASE_URL}${resource}`, payload, params);
}