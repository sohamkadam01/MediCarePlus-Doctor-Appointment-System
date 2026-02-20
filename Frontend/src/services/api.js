// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Helper method to get headers with auth token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    // Handle response
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Something went wrong');
        }
        return response.json();
    }

    // GET request
    async get(endpoint, includeAuth = true) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(includeAuth)
        });
        return this.handleResponse(response);
    }

    // POST request
    async post(endpoint, data, includeAuth = true) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(includeAuth),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    // PUT request
    async put(endpoint, data, includeAuth = true) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(includeAuth),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    // DELETE request
    async delete(endpoint, includeAuth = true) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(includeAuth)
        });
        return this.handleResponse(response);
    }
}

export default new ApiService();