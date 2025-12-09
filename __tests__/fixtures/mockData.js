// Mock data matching actual production API schemas

export const mockUserData = {
  valid: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test@1234',
    name: 'Test User',
    cfHandle: 'testcf',
  },
  admin: {
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'Admin@1234',
    name: 'Admin User',
    cfHandle: 'admincf',
    isAdmin: true,
  },
};

// Event data matching actual Event model schema
export const mockEventData = {
  valid: {
    title: 'CodeCraft 2024',
    description: 'A competitive programming event',
    date: new Date('2024-12-25'),
    time: '10:00 AM',
    location: 'Block A, Room 101',
    registrationOpen: true,
    more_details: 'Competitive programming contest with prizes',
    status: 'Upcoming',
    type: 'CP',
    formLink: 'https://forms.example.com/codecraft',
    imageUrl: 'https://example.com/codecraft.jpg',
  },
  pastEvent: {
    title: 'Past Event',
    description: 'This event has ended',
    date: new Date('2023-01-01'),
    time: '10:00 AM',
    location: 'Block B',
    registrationOpen: false,
    more_details: 'This event has been completed',
    status: 'Completed',
    type: 'DEV',
    imageUrl: 'https://example.com/past.jpg',
  },
};

// Member data matching actual Member model schema
export const mockMemberData = {
  valid: {
    name: 'John Doe',
    position: 'President',
    term: '2024',
    linkedinId: 'john-doe',
    pfpImage: 'https://example.com/john.jpg',
  },
  minimal: {
    name: 'Jane Smith',
    position: 'Vice President',
    term: '2024',
  },
};

// Contact data matching actual Contact model schema
export const mockContactData = {
  valid: {
    name: 'Contact Person',
    email: 'contact@example.com',
    message: 'This is a test message',
  },
  bugReport: {
    name: 'Bug Reporter',
    email: 'bug@example.com',
    message: 'Found a bug in the system',
    isBugReport: true,
  },
};
