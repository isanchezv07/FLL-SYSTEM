export type MissionKey =
  | '1'
  | '2'
  | '3-4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17';

type YesNo = 'yes' | false;

export type FLLMissionsFlat = Record<string, unknown>;

const isYes = (v: unknown): boolean => v === 'yes' || v === true;
const toYesNo = (v: boolean): YesNo => (v ? 'yes' : false);

const clampInt = (n: number, min: number, max: number) => {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
};

export const missionBounds: Record<MissionKey, { min: number; max: number }> = {
  // Nota: la UI usa un contador combinado para que el resultado coincida con calculateFLLScore.
  // Mission 1 -> m01_soil (0..5) + m01_brush (opcional 10 pts) => total 0..60 (0..6 en pasos de 10)
  '1': { min: 0, max: 6 },
  '2': { min: 0, max: 3 },
  '3-4': { min: 0, max: 8 }, // total 0..80 en pasos de 10
  '5': { min: 0, max: 1 },
  '6': { min: 0, max: 2 },
  '7': { min: 0, max: 1 },
  '8': { min: 0, max: 4 },
  '9': { min: 0, max: 3 },
  '10': { min: 0, max: 3 },
  '11': { min: 0, max: 3 },
  '12': { min: 0, max: 3 },
  '13': { min: 0, max: 1 },
  '14': { min: 0, max: 8 },
  '15': { min: 0, max: 1 }, // Site Marking
  '16': { min: 0, max: 3 }, // Gracious Professionalism (0: None, 1: Developing, 2: Accomplished, 3: Exceeds)
  '17': { min: 0, max: 6 }, // Precision Tokens
};

export const missionValueToPatch = (mission: MissionKey, value: number): FLLMissionsFlat => {
  const v = clampInt(value, missionBounds[mission].min, missionBounds[mission].max);

  switch (mission) {
    case '1': {
      // m01_soil: 0..5 (10 pts c/u)
      // m01_brush: yes => +10 (solo para alcanzar 60)
      const soil = Math.min(v, 5);
      const brush = v === 6;
      return {
        m01_soil: soil,
        m01_brush: toYesNo(brush),
      };
    }
    case '2':
      return { m02_sections: v };
    case '3-4': {
      // UI v(0..8) = (m03_minecart?30:0) + (m03_bonus?10:0) + (m04_artifact?30:0) + (m04_support?10:0) / 10
      const m03_minecart = [3, 4, 5, 6, 7, 8].includes(v);
      const m03_bonus = [1, 2, 5, 7, 8].includes(v);
      const m04_artifact = [6, 7, 8].includes(v);
      const m04_support = [2, 4, 5, 8].includes(v);

      return {
        m03_minecart: toYesNo(m03_minecart),
        m03_bonus: toYesNo(m03_bonus),
        m04_artifact: toYesNo(m04_artifact),
        m04_support: toYesNo(m04_support),
      };
    }
    case '5':
      return { m05_floor: toYesNo(v === 1) };
    case '6':
      return { m06_ore: v };
    case '7':
      return { m07_millstone: toYesNo(v === 1) };
    case '8':
      return { m08_preserved: v };
    case '9': {
      // roof = 20 pts (v>=2), wares = 10 pts (v odd)
      const roof = v >= 2;
      const wares = v % 2 === 1;
      return {
        m09_roof: toYesNo(roof),
        m09_wares: toYesNo(wares),
      };
    }
    case '10': {
      const tipped = v >= 2;
      const pan = v % 2 === 1;
      return {
        m10_tipped: toYesNo(tipped),
        m10_pan: toYesNo(pan),
      };
    }
    case '11': {
      const raised = v >= 2;
      const flag = v % 2 === 1;
      return {
        m11_raised: toYesNo(raised),
        m11_flag: toYesNo(flag),
      };
    }
    case '12': {
      const sand = v >= 2;
      const ship = v % 2 === 1;
      return {
        m12_sand: toYesNo(sand),
        m12_ship: toYesNo(ship),
      };
    }
    case '13':
      return { m13_statue: toYesNo(v === 1) };
    case '14':
      return { m14_artifacts: v };
    case '15':
      return { m15_site_marking: toYesNo(v === 1) };
    case '16': {
      const gpValues = [null, 'developing', 'accomplished', 'exceeds'];
      return { gp: gpValues[v] || null };
    }
    case '17':
      return { precision_tokens: v };
  }
};

export const missionValueFromMissionsFlat = (mission: MissionKey, missions: unknown): number => {
  const m = (missions && typeof missions === 'object' ? (missions as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  switch (mission) {
    case '1': {
      const soil = clampInt(parseInt(String(m.m01_soil ?? 0), 10) || 0, 0, 5);
      const brush = isYes(m.m01_brush);
      return brush && soil === 5 ? 6 : soil;
    }
    case '2': {
      return clampInt(parseInt(String(m.m02_sections ?? 0), 10) || 0, 0, 3);
    }
    case '3-4': {
      const m03_minecart = isYes(m.m03_minecart);
      const m03_bonus = isYes(m.m03_bonus);
      const m04_artifact = isYes(m.m04_artifact);
      const m04_support = isYes(m.m04_support);
      const totalPoints =
        (m03_minecart ? 30 : 0) + (m03_bonus ? 10 : 0) + (m04_artifact ? 30 : 0) + (m04_support ? 10 : 0);
      return clampInt(totalPoints / 10, 0, 8);
    }
    case '5':
      return isYes(m.m05_floor) ? 1 : 0;
    case '6':
      return clampInt(parseInt(String(m.m06_ore ?? 0), 10) || 0, 0, 2);
    case '7':
      return isYes(m.m07_millstone) ? 1 : 0;
    case '8':
      return clampInt(parseInt(String(m.m08_preserved ?? 0), 10) || 0, 0, 4);
    case '9': {
      const roof = isYes(m.m09_roof);
      const wares = isYes(m.m09_wares);
      return clampInt((roof ? 2 : 0) + (wares ? 1 : 0), 0, 3);
    }
    case '10': {
      const tipped = isYes(m.m10_tipped);
      const pan = isYes(m.m10_pan);
      return clampInt((tipped ? 2 : 0) + (pan ? 1 : 0), 0, 3);
    }
    case '11': {
      const raised = isYes(m.m11_raised);
      const flag = isYes(m.m11_flag);
      return clampInt((raised ? 2 : 0) + (flag ? 1 : 0), 0, 3);
    }
    case '12': {
      const sand = isYes(m.m12_sand);
      const ship = isYes(m.m12_ship);
      return clampInt((sand ? 2 : 0) + (ship ? 1 : 0), 0, 3);
    }
    case '13':
      return isYes(m.m13_statue) ? 1 : 0;
    case '14':
      return clampInt(parseInt(String(m.m14_artifacts ?? 0), 10) || 0, 0, 8);
    case '15':
      return isYes(m.m15_site_marking) ? 1 : 0;
    case '16': {
      const gp = m.gp;
      if (gp === 'exceeds') return 3;
      if (gp === 'accomplished' || isYes(gp)) return 2;
      if (gp === 'developing') return 1;
      return 0;
    }
    case '17': {
      const val = parseInt(String(m.precision_tokens ?? 6), 10);
      return clampInt(isNaN(val) ? 6 : val, 0, 6);
    }
  }
};

