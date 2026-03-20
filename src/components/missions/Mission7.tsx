import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission7() {
  return (
    <FLLMissionCounter
      mission="7"
      title="Misión 07"
      subtitle="Heavy Lifting"
      images={['/missions/mission7_1.webp', '/missions/mission7_2.webp']}
      valueLabel="(0/1)"
    />
  );
}