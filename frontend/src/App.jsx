import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Transactions from './components/Transactions/Transactions';
import Blocks from './components/Blockchain/Blocks';
import Mining from './components/Blockchain/Mining';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blocks"
              element={
                <ProtectedRoute>
                  <Blocks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mining"
              element={
                <ProtectedRoute>
                  <Mining />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;