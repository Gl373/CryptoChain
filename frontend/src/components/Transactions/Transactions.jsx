import { useState, useEffect } from 'react';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/v1/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kunde inte hämta transaktioner');
        }
        const { data } = await response.json();
        setTransactions(Object.values(data));
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipient, amount: Number(amount) }),
      });
      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Kunde inte skapa transaktion');
        } catch {
          throw new Error(errorText);
        }
      }
      setRecipient('');
      setAmount('');
      setError('');
      const fetchResponse = await fetch('http://localhost:3000/api/v1/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!fetchResponse.ok) {
        throw new Error(errorData.error || 'Kunde inte hämta transaktioner');
      }
      const { data } = await fetchResponse.json();
      setTransactions(Object.values(data));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Transaktioner</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form id="transaction-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Mottagare"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Belopp"
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Skapa transaktion
        </button>
      </form>
      <h3 className="text-lg font-semibold mb-2 mt-6">Transaktionslista</h3>
      {transactions.length === 0 ? (
        <p>Inga transaktioner tillgängliga</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li key={tx.id} className="border p-2 rounded">
              <p>
                <strong>Från:</strong> {tx.input.address.slice(0, 10)}...
              </p>
              <p>
                <strong>Till:</strong>{' '}
                {Object.keys(tx.outputMap)
                  .filter((key) => key !== tx.input.address)
                  .join(', ')}
              </p>
              <p>
                <strong>Belopp:</strong>{' '}
                {Object.values(tx.outputMap)
                  .filter((_, i) => Object.keys(tx.outputMap)[i] !== tx.input.address)
                  .join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Transactions;