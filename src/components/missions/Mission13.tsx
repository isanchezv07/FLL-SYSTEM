import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission13() {
  return (
    <FLLMissionCounter
      mission="13"
      title="Misión 13"
      subtitle="Statue Rebuild"
      images={['/missions/mission13_1.webp', '/missions/mission13_2.webp']}
      valueLabel="(0/1)"
    />
  );
}