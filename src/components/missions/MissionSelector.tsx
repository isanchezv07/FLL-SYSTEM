import React from 'react';
import Mission1 from './Mission1';
import Mission2 from './Mission2';
import Mission3 from './Mission3-4';
import Mission5 from './Mission5';
import Mission6 from './Mission6';
import Mission7 from './Mission7';
import Mission8 from './Mission8';
import Mission9 from './Mission9';
import Mission10 from './Mission10';
import Mission11 from './Mission11';
import Mission12 from './Mission12';
import Mission13 from './Mission13';
import Mission14 from './Mission14';
import Mission15 from './Mission15';

const misiones = {
  '1': Mission1,
  '2': Mission2,
  '3': Mission3,
  '4': Mission3,
  '5': Mission5,
  '6': Mission6,
  '7': Mission7,
  '8': Mission8,
  '9': Mission9,
  '10': Mission10,
  '11': Mission11,
  '12': Mission12,
  '13': Mission13,
  '14': Mission14,
  '15': Mission15,
};

const MisionSelector = ({ id }) => {
  const Componente = misiones[id];

  if (!Componente) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #ccc', borderRadius: '10px' }}>
        <p style={{ color: '#666', fontSize: '18px' }}>Herramienta en construcción 🚧</p>
      </div>
    );
  }

  return <Componente />;
};

export default MisionSelector;