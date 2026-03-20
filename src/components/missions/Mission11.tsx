import React from 'react';
import FLLMissionCounter from './FLLMissionCounter';

export default function Mission11() {
  return (
    <FLLMissionCounter
      mission="11"
      title="Misión 11"
      subtitle="Angler Artifacts"
      images={['/missions/mission11_1.webp', '/missions/mission11_2.webp']}
      valueLabel="Raised/Flag (0..3)"
    />
  );
}