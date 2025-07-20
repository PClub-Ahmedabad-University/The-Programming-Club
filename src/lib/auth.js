// Client-side only auth utilities

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    console.log(payload);
    return payload?.id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
export function getUserRoleFromToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    console.log(payload);
    return payload?.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function isExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    console.log(payload);
    return payload?.exp < Date.now() / 1000 || false;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}