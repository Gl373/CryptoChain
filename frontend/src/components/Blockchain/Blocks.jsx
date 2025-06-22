import { useState, useEffect } from 'react';

function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/v1/blocks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kunde inte hämta block');
        }
        const { data } = await response.json();
        console.log('API blocks data:', data);
        setBlocks(Array.isArray(data.chain) ? data.chain : []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchBlocks();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Block</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {blocks.length === 0 ? (
        <p>Inga block tillgängliga</p>
      ) : (
        <ul className="space-y-2">
          {blocks.map((block) => (
            <li key={block.id} className="border p-2 rounded">
              <p>
                <strong>ID:</strong> {block.id.slice(0, 10)}...
              </p>
              <p>
                <strong>Hash:</strong> {block.hash.slice(0, 10)}...
              </p>
              <p>
                <strong>Transaktioner:</strong> {block.data.length}
              </p>
              <p>
                <strong>Tidsstämpel:</strong>{' '}
                {new Date(block.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Blocks;