import { useState } from 'react';

function Mining() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMining = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/blocks/mining', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Kunde inte minera block');
        } catch {
          throw new Error(errorText);
        }
      }
      setMessage('Block minat framgångsrikt!');
      setError('');
    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Mining</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleMining}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Minera block
      </button>
    </div>
  );
}

export default Mining; 