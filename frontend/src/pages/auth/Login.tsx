import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/auth';
import { z } from 'zod';
import './Login.css'; 
import SimpleNavbar from '../../components/SimpleNavbar';
import SimpleFooter from '../../components/SimpleFooter'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password }, 'admin');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-page-wrapper"> 
      <SimpleNavbar />
      <div className="login-container">
        <div className="login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <div className="link-text">
            Don't have an account? <a href="/register">Register here</a>
          </div>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
};

export default Login;
