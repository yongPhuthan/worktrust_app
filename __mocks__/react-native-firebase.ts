const mockFirebase = {
    initializeApp: jest.fn(),
    apps: [{ name: '[DEFAULT]' }],
    auth: jest.fn().mockReturnThis(),
    firestore: jest.fn().mockReturnThis(),
    storage: jest.fn().mockReturnThis(),
    appCheck: jest.fn().mockReturnThis(),
    functions: jest.fn().mockReturnThis(),
  };
  
  export default mockFirebase;
  