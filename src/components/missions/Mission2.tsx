import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission2() {
  return (
    <FLLMissionCounter
      mission="2"
      title="Misión 02"
      subtitle="Map Reveal"
      images={[
        '/missions/mission2_1.webp',
        '/missions/mission2_2.webp',
        '/missions/mission2_3.webp',
        '/missions/mission2_4.webp',
      ]}
      valueLabel="Sections"
    />
  );
}