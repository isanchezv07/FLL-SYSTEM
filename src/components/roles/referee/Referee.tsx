import React from "react";

const mapMarkers = [
  { id: "1", top: "40%", left: "5%", title: "Misión 01: Surface Brushing" },
  { id: "2", top: "11%", left: "9.6%", title: "Misión 02: Map Reveal" },
  { id: "3", top: "7%", left: "33%", title: "Misión 03: Mineshaft Explorer" },
  { id: "4", top: "18%", left: "29%", title: "Misión 04: Careful Recovery" },
  { id: "5", top: "7.5%", left: "80.5%", title: "Misión 05: Who Lived Here?" },
  { id: "6", top: "20%", left: "87.8%", title: "Misión 06: Forge" },
  { id: "7", top: "8%", left: "94.5%", title: "Misión 07: Heavy Lifting" },
  { id: "8", top: "40%", left: "94%", title: "Misión 08: Silo" },
  { id: "9", top: "43%", left: "70.3%", title: "Misión 09: What's on Sale?" },
  { id: "10", top: "48.3%", left: "60.8%", title: "Misión 10: Tip the Scales" },
  { id: "11", top: "93.5%", left: "60.3%", title: "Misión 11: Angler Artifacts" },
  { id: "12", top: "93.5%", left: "45.3%", title: "Misión 12: Salvage Operation" },
  { id: "13", top: "41.8%", left: "42.6%", title: "Misión 13: Statue Rebuild" },
  { id: "14", top: "46.4%", left: "33.8%", title: "Misión 14: Forum" },
  { id: "15", top: "67%", left: "14.7%", title: "Misión 15: Site Marking" }
];

export default function InteractiveMap() {
  return (
    <div className="w-full bg-slate-50 p-4 md:p-8 rounded-3xl shadow-inner">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Mapa de Misiones FLL</h2>
          <p className="text-slate-500">Selecciona una misión para ver los detalles</p>
        </div>

        {/* Contenedor del Mapa */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white group">
          <img 
            src="/field.png" 
            alt="Mapa FLL Field" 
            className="w-full h-auto block transition-transform duration-700"
          />

          {mapMarkers.map((marker) => (
            <a
              key={marker.id}
              href={`/misiones/${marker.id}`}
              className="absolute hover:bg-green-500/20 hover:border-green-500 border-2 border-transparent transition-all"
              style={{
                top: marker.top,
                left: marker.left,
                width: '7%',   
                height: '9%',
                transform: 'translate(-50%, -50%)', // Centrado exacto sobre el punto
                borderRadius: '50%',
                cursor: 'pointer',
              }}
              title={marker.title}
            />
          ))}
        </div>

        {/* Grid de Botones con números centrados */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3 justify-center">
          {mapMarkers.map((marker) => (
            <a
              key={marker.id}
              href={`/misiones/${marker.id}`}
              className="flex items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 font-bold text-sm rounded-lg group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                {marker.id}
              </span>
            </a>
          ))}
        </div>
        
      </div>
    </div>
  );
}