import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission34() {
  return (
    <FLLMissionCounter
      mission="3-4"
      title="Misión 03-04"
      subtitle="Mineshaft Explorer & Careful Recovery"
      images={[
        '/missions/mission3-4_1.webp',
        '/missions/mission3-4_2.webp',
        '/missions/mission3-4_3.webp',
        '/missions/mission3-4_4.webp',
      ]}
      valueLabel="Total x10 pts"
    />
  );
}