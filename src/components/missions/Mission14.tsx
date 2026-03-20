import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission14() {
  return (
    <FLLMissionCounter
      mission="14"
      title="Misión 14"
      subtitle="Forum"
      images={['/missions/mission14_1.webp', '/missions/mission14_2.webp']}
      valueLabel="Artifacts (0..8)"
    />
  );
}