import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/jobs');
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '20px', color: '#333' }}>
          Siber Güvenlik Analiz Paneli
        </h1>

        <p style={{ fontSize: '1.2em', color: '#555', lineHeight: '1.6' }}>
          Bu panel aracılığıyla farklı siber güvenlik analizlerini gerçekleştirebilir, 
          <strong> ping testi</strong>, <strong>port taraması</strong>, 
          <strong> HTTP başlık analizi</strong>, <strong>whois sorgusu</strong>, 
          <strong>OS tespiti</strong> ve <strong>özgün komut çalıştırma</strong> gibi işlemleri kolayca gerçekleştirebilirsiniz.
        </p>

        <p style={{ marginTop: '20px', fontSize: '1em', color: '#666' }}>
          <em>
            Hedef sistemlerle ilgili temel bilgileri toplayın, tarama geçmişinizi görüntüleyin
            ve çıktıları analiz ederek güvenlik durumunuzu iyileştirin.
          </em>
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleStart}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1em',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Başlamak İçin Tıklayın
        </button>
      </div>
    </div>
  );
}

export default Dashboard;

