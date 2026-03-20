import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission9() {
  return (
    <FLLMissionCounter
      mission="9"
      title="Misión 09"
      subtitle="What's on Sale?"
      images={['/missions/mission9_1.webp', '/missions/mission9_2.webp', '/missions/mission9_3.webp']}
      valueLabel="Roof/Wares (0..3)"
    />
  );
}