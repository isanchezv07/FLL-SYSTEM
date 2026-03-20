import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission8() {
  return (
    <FLLMissionCounter
      mission="8"
      title="Misión 08"
      subtitle="Silo"
      images={['/missions/mission8_1.avif']}
      valueLabel="Pieces (0..4)"
    />
  );
}