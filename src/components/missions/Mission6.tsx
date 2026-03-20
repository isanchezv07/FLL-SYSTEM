import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission6() {
  return (
    <FLLMissionCounter
      mission="6"
      title="Misión 06"
      subtitle="Forge"
      images={['/missions/mission6_1.webp', '/missions/mission6_2.webp']}
      valueLabel="Ores (0..2)"
    />
  );
}