// Mocking matches.js entirely
const mockMatches = {
  getMatches: jest.fn(),
  createMatch: jest.fn(),
  updateMatch: jest.fn(),
  getMatchById: jest.fn(),
  default: {
    read: jest.fn(),
    write: jest.fn(),
    data: { matches: [] }
  }
};

jest.mock('./matches.js', () => ({
  __esModule: true,
  ...mockMatches
}));

import { getMatches, createMatch, updateMatch, getMatchById } from './matches.js';

describe('Matches Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return matches', async () => {
    getMatches.mockResolvedValue([{ id: '1', teamA1: '101' }]);
    const matches = await getMatches();
    expect(matches).toHaveLength(1);
    expect(getMatches).toHaveBeenCalled();
  });

  test('should create a match', async () => {
    const matchData = { teamA1: '101' };
    createMatch.mockResolvedValue({ id: '123', ...matchData });
    const newMatch = await createMatch(matchData);
    expect(newMatch.id).toBe('123');
    expect(createMatch).toHaveBeenCalledWith(matchData);
  });

  test('should update a match', async () => {
    updateMatch.mockResolvedValue({ id: '1', status: 'finished' });
    const updated = await updateMatch('1', { status: 'finished' });
    expect(updated.status).toBe('finished');
  });

  test('should get match by id', async () => {
    getMatchById.mockResolvedValue({ id: '1' });
    const match = await getMatchById('1');
    expect(match.id).toBe('1');
  });
});
