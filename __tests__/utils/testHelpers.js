import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../src/app/api/models/user.model.js';
import Event from '../../src/app/api/models/event.model.js';
import Member from '../../src/app/api/models/member.model.js';
import Contact from '../../src/app/api/models/contact-us.model.js';

/**
 * Create a test user in the database
 */
export const createTestUser = async (overrides = {}) => {
  const hashedPassword = await bcrypt.hash('Test@1234', 10);
  
  const userData = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: hashedPassword,
    name: 'Test User',
    cfHandle: `testcf${Date.now()}`,
    isAdmin: false,
    ...overrides,
  };

  const user = await User.create(userData);
  return user;
};

/**
 * Create a test event in the database matching actual Event schema
 */
export const createTestEvent = async (overrides = {}) => {
  const eventData = {
    title: `Test Event ${Date.now()}`,
    description: 'This is a test event description',
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: '10:00 AM',
    location: 'Test Venue',
    registrationOpen: true,
    more_details: 'Test event details',
    status: 'Upcoming',
    type: 'CP',
    formLink: 'https://forms.test.com/test',
    imageUrl: 'https://test.com/image.jpg',
    winners: [],
    ...overrides,
  };

  const event = await Event.create(eventData);
  return event;
};

/**
 * Create a test member in the database
 */
export const createTestMember = async (overrides = {}) => {
  const memberData = {
    name: `Test Member ${Date.now()}`,
    position: 'Test Position',
    term: '2024',
    linkedinId: `test-member-${Date.now()}`,
    pfpImage: 'https://test.com/member.jpg',
    ...overrides,
  };

  const member = await Member.create(memberData);
  return member;
};

/**
 * Create a test contact message
 */
export const createTestContact = async (overrides = {}) => {
  const contactData = {
    name: `Test Contact ${Date.now()}`,
    email: `contact${Date.now()}@example.com`,
    message: 'This is a test message',
    isBugReport: false,
    ...overrides,
  };

  const contact = await Contact.create(contactData);
  return contact;
};

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (userId, isAdmin = false) => {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Create mock request and response objects
 */
export const createMockReqRes = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  return { req, res };
};
