import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login/register logic
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>{isLogin ? 'Admin Login' : 'Admin Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input type="email" style={{ width: '100%', padding: '8px' }} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <input type="password" style={{ width: '100%', padding: '8px' }} required />
        </div>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label>Confirm Password</label>
            <input type="password" style={{ width: '100%', padding: '8px' }} required />
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

export default Login;
