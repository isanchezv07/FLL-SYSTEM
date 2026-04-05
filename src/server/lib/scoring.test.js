import { calculateFLLScore } from './scoring.js';

describe('calculateFLLScore', () => {
  test('should return 0 for empty missions', () => {
    expect(calculateFLLScore({})).toBe(0);
  });

  test('should include inspection bonus', () => {
    expect(calculateFLLScore({ inspection: 'yes' })).toBe(20);
    expect(calculateFLLScore({ inspection: true })).toBe(20);
  });

  test('should calculate M01 soil points correctly', () => {
    expect(calculateFLLScore({ m01_soil: 3 })).toBe(30);
    expect(calculateFLLScore({ m01_soil: 6 })).toBe(50); // Clamped to 5
  });

  test('should include M01 brush bonus', () => {
    expect(calculateFLLScore({ m01_brush: 'yes' })).toBe(10);
  });

  test('should calculate M02 sections correctly', () => {
    expect(calculateFLLScore({ m02_sections: 2 })).toBe(20);
    expect(calculateFLLScore({ m02_sections: 4 })).toBe(30); // Clamped to 3
  });

  test('should calculate M03 and M04 correctly', () => {
    const missions = {
      m03_minecart: 'yes',
      m03_bonus: 'yes',
      m04_artifact: 'yes',
      m04_support: 'yes'
    };
    expect(calculateFLLScore(missions)).toBe(30 + 10 + 30 + 10);
  });

  test('should calculate precision tokens correctly', () => {
    expect(calculateFLLScore({ precision_tokens: 6 })).toBe(50);
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
