// Client-side only auth utilities

export function getToken() {
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

export function clearToken() {
    localStorage.removeItem('token');
}
export function getExpiryTime(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        console.log("Token will expire at:",payload?.exp);
        return payload?.exp || null;
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
    console.log("Token will expire at:",payload?.exp);
    const isTokenExpired = payload?.exp < Date.now() / 1000;
    console.log("Is token expired:",isTokenExpired);
    if (isTokenExpired) {
      clearToken();
    }
    
    return isTokenExpired;
  } catch (error) {
    console.error('Error decoding token:', error);
    clearToken();
    return true;
  }
}