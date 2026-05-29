import { calculateFLLScore } from './scoring.js';
describe('calculateFLLScore', () => {
  test('should return 50 for empty missions (initial precision tokens)', () => {
    expect(calculateFLLScore({})).toBe(50);
  });

  test('should include inspection bonus', () => {
    expect(calculateFLLScore({ inspection: 'yes' })).toBe(20 + 50);
    expect(calculateFLLScore({ inspection: true })).toBe(20 + 50);
  });

  test('should calculate M01 soil points correctly', () => {
    expect(calculateFLLScore({ m01_soil: 3 })).toBe(30 + 50);
    expect(calculateFLLScore({ m01_soil: 6 })).toBe(50 + 50); // Clamped to 5 + 50
  });

  test('should include M01 brush bonus', () => {
    expect(calculateFLLScore({ m01_brush: 'yes' })).toBe(10 + 50);
  });

  test('should calculate M02 sections correctly', () => {
    expect(calculateFLLScore({ m02_sections: 2 })).toBe(20 + 50);
    expect(calculateFLLScore({ m02_sections: 4 })).toBe(30 + 50); // Clamped to 3 + 50
  });

  test('should calculate M03 and M04 correctly', () => {
    const missions = {
      m03_minecart: 'yes',
      m03_bonus: 'yes',
      m04_artifact: 'yes',
      m04_support: 'yes'
    };
    expect(calculateFLLScore(missions)).toBe(30 + 10 + 30 + 10 + 50);
  });

  test('should calculate GP correctly', () => {
    expect(calculateFLLScore({ gp: 'developing' })).toBe(10 + 50);
    expect(calculateFLLScore({ gp: 'accomplished' })).toBe(20 + 50);
    expect(calculateFLLScore({ gp: 'exceeds' })).toBe(30 + 50);
    expect(calculateFLLScore({ gp: 'yes' })).toBe(20 + 50); // Legacy check
  });

  test('should handle NaN and undefined precision tokens', () => {
    expect(calculateFLLScore({ precision_tokens: NaN })).toBe(50);
    expect(calculateFLLScore({ precision_tokens: undefined })).toBe(50);
    expect(calculateFLLScore({ precision_tokens: null })).toBe(50);
    expect(calculateFLLScore({ precision_tokens: "invalid" })).toBe(50);
  });

  test('should calculate precision tokens correctly', () => {
    expect(calculateFLLScore({ precision_tokens: 6 })).toBe(50);
    expect(calculateFLLScore({ precision_tokens: 5 })).toBe(50);
    expect(calculateFLLScore({ precision_tokens: 4 })).toBe(35);
    expect(calculateFLLScore({ precision_tokens: 0 })).toBe(0);
  });

  test('should calculate a complex mission set', () => {
    const missions = {
      inspection: 'yes', // 20
      m01_soil: 2, // 20
      m05_floor: 'yes', // 30
      precision_tokens: 5 // 50
    };
    expect(calculateFLLScore(missions)).toBe(120);
  });
});
