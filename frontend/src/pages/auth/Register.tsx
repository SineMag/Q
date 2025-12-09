import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth';
import './Register.css'; // Import the CSS file
import SimpleNavbar from '../../components/SimpleNavbar'; // Import SimpleNavbar
import SimpleFooter from '../../components/SimpleFooter'; // Import SimpleFooter

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Assuming 'admin' role for now, adjust as needed
      await authApi.register({ email, password, role: 'admin' });
      navigate('/login'); // Redirect to login after successful registration
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="auth-page-wrapper"> {/* New wrapper for full page layout */}
      <SimpleNavbar />
      <div className="register-container">
        <div className="register-card">
          <h2>Admin Register</h2>
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
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="register-button">
              Register
            </button>
          </form>
          <div className="link-text">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
};

export default Register;
