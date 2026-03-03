'use client';

import { useEffect, useState } from 'react';

interface Bracket {
  id: string;
  name: string;
  matches: any[];
}

export default function BracketsSection() {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrackets();
  }, []);

  const fetchBrackets = async () => {
    try {
      const res = await fetch('/api/brackets');
      const data = await res.json();
      setBrackets(data);
    } catch (error) {
      console.error('Error fetching brackets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando brackets...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Brackets</h2>

      {brackets.length === 0 && <p>No hay brackets creados.</p>}

      {brackets.map(bracket => (
        <div
          key={bracket.id}
          className="border p-4 rounded mb-4 bg-gray-50"
        >
          <h3 className="font-semibold mb-2">{bracket.name}</h3>
          <p>Matches: {bracket.matches?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}