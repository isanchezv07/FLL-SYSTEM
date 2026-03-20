import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission10() {
  return (
    <FLLMissionCounter
      mission="10"
      title="Misión 10"
      subtitle="Tip the Scales"
      images={['/missions/mission10_1.webp', '/missions/mission10_2.webp']}
      valueLabel="Tipped/Pan (0..3)"
    />
  );
}