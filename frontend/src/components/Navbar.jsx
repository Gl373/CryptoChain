import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">CryptoChain</h1>
        {user ? (
          <div className="flex space-x-4">
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                isActive ? 'underline' : 'hover:underline'
              }
            >
              Transaktioner
            </NavLink>
            <NavLink
              to="/blocks"
              className={({ isActive }) =>
                isActive ? 'underline' : 'hover:underline'
              }
            >
              Block
            </NavLink>
            <NavLink
              to="/mining"
              className={({ isActive }) =>
                isActive ? 'underline' : 'hover:underline'
              }
            >
              Mining
            </NavLink>
            <button onClick={handleLogout} className="hover:underline">
              Logga ut ({user.username})
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? 'underline' : 'hover:underline'
              }
            >
              Logga in
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? 'underline' : 'hover:underline'
              }
            >
              Registrera
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;