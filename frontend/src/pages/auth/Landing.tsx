import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Welcome</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Admin
        </button>
        <button onClick={() => navigate('/patient-login')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Patient
        </button>
      </div>
    </div>
  );
};

export default Landing;
