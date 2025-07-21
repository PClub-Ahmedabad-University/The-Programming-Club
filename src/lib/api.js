import { getToken, isExpired, clearToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  
  // Check if token exists and is not expired
  if (token) {
    if (isExpired(token)) {
      clearToken();
      throw new Error('Session expired. Please log in again.');
    }
  }
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge options with our headers
  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Include cookies if needed
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
    
    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      clearToken();
      throw new Error('Your session has expired. Please log in again.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: (url, options = {}) => 
    fetchWithAuth(url, { ...options, method: 'GET' }),
  
  post: (url, data, options = {}) =>
    fetchWithAuth(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (url, data, options = {}) =>
    fetchWithAuth(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (url, options = {}) =>
    fetchWithAuth(url, { ...options, method: 'DELETE' }),
  
  patch: (url, data, options = {}) =>
    fetchWithAuth(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export default fetchWithAuth;
