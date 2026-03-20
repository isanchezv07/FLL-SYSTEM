import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission5() {
  return (
    <FLLMissionCounter
      mission="5"
      title="Misión 05"
      subtitle="Who Lived Here?"
      images={['/missions/mission5_1.webp', '/missions/mission5_2.webp']}
      valueLabel="(0/1)"
    />
  );
}