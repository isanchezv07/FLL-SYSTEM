export function calculateFLLScore(m) {
  let score = 0;
  if (!m) return 0;
  const isYes = (v) => v === 'yes' || v === true;
  if (isYes(m.inspection)) score += 20;
  const m01_soil = Math.min(parseInt(m.m01_soil) || 0, 5);
  score += m01_soil * 10;
  if (isYes(m.m01_brush)) score += 10;
  const m02_sections = Math.min(parseInt(m.m02_sections) || 0, 3);
  score += m02_sections * 10;
  if (isYes(m.m03_minecart)) score += 30;
  if (isYes(m.m03_bonus)) score += 10;
  if (isYes(m.m04_artifact)) score += 30;
  if (isYes(m.m04_support)) score += 10;
  if (isYes(m.m05_floor)) score += 30;
  if (isYes(m.m07_millstone)) score += 30;
  if (isYes(m.m13_statue)) score += 30;
  const m06_ore = Math.min(parseInt(m.m06_ore) || 0, 2);
  score += m06_ore * 10;
  const m08_preserved = Math.min(parseInt(m.m08_preserved) || 0, 4);
  score += m08_preserved * 10;
  if (isYes(m.m09_roof)) score += 20;
  if (isYes(m.m09_wares)) score += 10;
  if (isYes(m.m10_tipped)) score += 20;
  if (isYes(m.m10_pan)) score += 10;
  if (isYes(m.m11_raised)) score += 20;
  if (isYes(m.m11_flag)) score += 10;
  if (isYes(m.m12_sand)) score += 20;
  if (isYes(m.m12_ship)) score += 10;
  const m14_artifacts = Math.min(parseInt(m.m14_artifacts) || 0, 8);
  score += m14_artifacts * 5;
  if (isYes(m.m15_site_marking)) score += 30;
  
  // Gracious Professionalism (GP) - 3 Levels
  const gp = m.gp;
  if (gp === 'exceeds') {
    score += 30;
  } else if (gp === 'accomplished' || isYes(gp)) {
    score += 20;
  } else if (gp === 'developing') {
    score += 10;
  }

  const rawTokens = m.precision_tokens !== undefined && m.precision_tokens !== null ? m.precision_tokens : 6;
  let tokens = parseInt(rawTokens);
  if (isNaN(tokens)) tokens = 6;
  tokens = Math.max(0, Math.min(tokens, 6));
  const precisionTable = { 6: 50, 5: 50, 4: 35, 3: 25, 2: 15, 1: 10, 0: 0 };
  score += precisionTable[tokens] || 0;
  return score;
}
