import React from 'react';

const mapMarkers = [
  { id: '1', top: '40%', left: '5%', title: 'Misión 01: Surface Brushing' },
  { id: '2', top: '11%', left: '9.6%', title: 'Misión 02: Map Reveal' },
  { id: '3', top: '7%', left: '33%', title: 'Misión 03: Mineshaft Explorer' },
  { id: '4', top: '18%', left: '29%', title: 'Misión 04: Careful Recovery' },
  { id: '5', top: '7.5%', left: '80.5%', title: 'Misión 05: Who Lived Here?' },
  { id: '6', top: '20%', left: '87.8%', title: 'Misión 06: Forge' },
  { id: '7', top: '8%', left: '94.5%', title: 'Misión 07: Heavy Lifting' },
  { id: '8', top: '40%', left: '94%', title: 'Misión 08: Silo' },
  { id: '9', top: '43%', left: '70.3%', title: 'Misión 09: What\'s on Sale?' },
  { id: '10', top: '48.3%', left: '60.8%', title: 'Misión 10: Tip the Scales' },
  { id: '11', top: '93.5%', left: '60.3%', title: 'Misión 11: Angler Artifacts' },
  { id: '12', top: '93.5%', left: '45.3%', title: 'Misión 12: Salvage Operation' },
  { id: '13', top: '41.8%', left: '42.6%', title: 'Misión 13: Statue Rebuild' },
  { id: '14', top: '46.4%', left: '33.8%', title: 'Misión 14: Forum' },
  { id: '15', top: '67%', left: '14.7%', title: 'Misión 15: Site Marking' }
];

export default function InteractiveMap() {
  return (
    <div className="map-wrapper">
      <style>{`
        .map-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          overflow: hidden;
          padding: 20px 0;
        }
        .map-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          transition: transform 0.3s ease;
        }

        /* DISEÑO PARA CELULAR: Rota el mapa 90 grados */
        /* @media (max-width: 768px) and (orientation: portrait) {
          .map-wrapper {
            min-height: 80vh;
            align-items: center;
          }
          .map-container {
            width: 150vw; /* Lo hace más grande para aprovechar la pantalla */
            transform: rotate(90deg);
          }
        } */
      `}</style>

      <div className="map-container">
        {/* Asegúrate de que tu imagen se llame field.png y esté en la carpeta public */}
        <img 
          src="/field.png" 
          alt="Mapa FLL" 
          style={{ width: '100%', height: 'auto', display: 'block'}} 
        />

        {mapMarkers.map((marker) => (
          <a
            key={marker.id}
            href={`/misiones/${marker.id}`}
            data-astro-prefetch="hover" /* TRUCO DE VELOCIDAD EXTREMA */
            style={{
              position: 'absolute',
              top: marker.top,
              left: marker.left,
              width: '7%',   
              height: '9%',
              transform: 'translate(-50%, -50%)',
              display: 'block',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: '2px solid transparent',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.border = '3px solid #00853E';
              e.currentTarget.style.backgroundColor = 'rgba(0, 133, 62, 0.3)';
              e.currentTarget.style.borderRadius = '12px'; // <--- Aquí redondeamos los bordes
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.border = '2px solid transparent';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderRadius = '12px'; // <--- Lo mantenemos redondo al quitar el mouse
            }}
            title={`Ir a ${marker.title}`}
            aria-label={`Ir a ${marker.title}`}
          ></a>
        ))}
      </div>
    </div>
  );
}