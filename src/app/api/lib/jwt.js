import jwt from 'jsonwebtoken';

// JWT Secret from environment variables
const secret = process.env.JWT_SECRET;

/**
 * Verify a JWT token and return the decoded payload
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object>} - The decoded token payload
 */
export const verifyJWT = async (token) => {
  try {
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired. Please log in again.');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token. Please log in again.');
    } else {
      throw error;
    }
  }
};

/**
 * Generate a JWT token for a user
 * @param {Object} payload - The payload to encode in the token
 * @param {Object} options - Options for the token generation
 * @returns {string} - The generated JWT token
 */
export const generateJWT = (payload, options = { expiresIn: '7d' }) => {
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, options);
};