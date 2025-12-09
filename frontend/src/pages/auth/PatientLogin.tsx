import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/auth';

const PatientLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        await login({ email, password }, 'patient');
        navigate('/patients');
      } catch (err) {
        setError('Invalid credentials');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      try {
        await authApi.register({ email, password, role: 'patient' });
        await login({ email, password }, 'patient');
        navigate('/patients');
      } catch (err) {
        setError('Failed to register');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>{isLogin ? 'Patient Login' : 'Patient Register'}</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px' }} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} required />
        </div>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} required />
          </div>
        )}
        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}>
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </div>
  );
};

export default PatientLogin;
