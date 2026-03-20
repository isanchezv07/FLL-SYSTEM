import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission12() {
  return (
    <FLLMissionCounter
      mission="12"
      title="Misión 12"
      subtitle="Salvage Operation"
      images={['/missions/mission12_1.webp', '/missions/mission12_2.webp', '/missions/mission12_3.webp']}
      valueLabel="Sand/Ship (0..3)"
    />
  );
}