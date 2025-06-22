import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrera</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form id="register-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="E-postadress"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Registrera
          </button>
        </form>
        <p className="mt-4 text-center">
          Har du redan ett konto?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Logga in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;