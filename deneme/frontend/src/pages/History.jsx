import React, { useEffect, useState } from 'react';
import axios from 'axios';

function History() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('/api/results');
        setResults(response.data);
      } catch (error) {
        console.error('Sonuçları alırken hata oluştu:', error);
      }
    };

    fetchResults();
  }, []);

  return (
    <div>
      <h2>İşlem Geçmişi</h2>
      {results.length === 0 ? (
        <p>Henüz sonuç yok.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>İş: {item.job_type.toUpperCase()} — ID: {item.id}</h4>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '6px' }}>
                Tarih: {new Date(item.created_at).toLocaleString()}
              </p>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.95em',
                  backgroundColor: '#ffffff',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(item.result), null, 2);
                  } catch {
                    return item.result;
                  }
                })()}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;

