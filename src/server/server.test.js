import request from 'supertest';
import { app } from './server.js';
import * as teamsDb from './databases/teams.js';
import * as usersDb from './databases/users.js';

// Mock DB modules
jest.mock('./databases/teams.js');
jest.mock('./databases/users.js');
jest.mock('./databases/matches.js');
jest.mock('./databases/brackets.js');
jest.mock('./databases/timer.js');
jest.mock('./databases/awards.js');
// Mock socket.io to avoid connection issues during tests
jest.mock('socket.io', () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      emit: jest.fn(),
    })),
  };
});

describe('API Endpoints', () => {
  describe('GET /api/teams', () => {
    test('should return list of teams', async () => {
      const mockTeams = [{ id: '1', number: '101', name: 'Team A' }];
      teamsDb.getTeams.mockReturnValue(mockTeams);

      const response = await request(app).get('/api/teams');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTeams);
    });
  });

  describe('POST /api/login', () => {
    test('should return token for valid credentials', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'admin' };
      usersDb.authenticateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('admin');
      expect(response.body.token).toBeDefined();
    });

    test('should return 401 for invalid credentials', async () => {
      usersDb.authenticateUser.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'wrong' });

      expect(response.status).toBe(401);
    });
  });
});
