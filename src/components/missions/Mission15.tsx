import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission15() {
  return (
    <FLLMissionCounter
      mission="15"
      title="Misión 15"
      subtitle="Site Marking (Precision Tokens)"
      images={['/missions/mission15_1.webp', '/missions/mission15_2.webp', '/missions/mission15_3.webp']}
      valueLabel="Tokens (0..6)"
    />
  );
}