import React, { useState } from 'react';
import axios from 'axios';

function Jobs() {
  const [jobType, setJobType] = useState('ping');
  const [target, setTarget] = useState('');
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPlaceholder = () => {
    switch (jobType) {
      case 'katana':
      case 'http_headers':
        return 'https://example.com';
      case 'ping':
        return '8.8.8.8';
      case 'port_scan':
        return 'example.com';
      case 'whois_lookup':
        return 'example.com';
      case 'os_detection':
        return 'scanme.nmap.org';
      case 'command':
        return 'ls -la';
      default:
        return 'Hedef bilgisi';
    }
  };

  const validateTargetFormat = () => {
    if (!target) return false;

    const urlRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i;
    const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){2}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const commandRegex = /^.{2,}$/;

    switch (jobType) {
      case 'katana':
      case 'http_headers':
        return urlRegex.test(target);
      case 'ping':
      case 'os_detection':
        return ipRegex.test(target) || domainRegex.test(target) || urlRegex.test(target);
      case 'port_scan':
      case 'whois_lookup':
        return domainRegex.test(target) || urlRegex.test(target);
      case 'command':
        return commandRegex.test(target);
      default:
        return false;
    }
  };

  const normalizeTarget = (value) => {
    try {
      const url = new URL(value);
      return url.hostname;
    } catch {
      return value;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTargetFormat()) {
      alert('Hedef formatı geçersiz!');
      return;
    }

    const normalized = normalizeTarget(target);

    const payload = {
      job_type: jobType,
      ...(jobType === 'katana' || jobType === 'http_headers' ? { url: target } : {}),
      ...(jobType === 'ping' || jobType === 'port_scan' || jobType === 'os_detection' ? { target: normalized } : {}),
      ...(jobType === 'whois_lookup' ? { domain: normalized } : {}),
      ...(jobType === 'command' ? { command: target } : {})
    };

    try {
      setLoading(true);
      setLatestResult(null);

      const jobResponse = await axios.post('/api/jobs/run', payload);
      const job_id = jobResponse.data.job_id;

      let attempts = 0;
      const maxAttempts = 30;
      const intervalMs = 1000;

      const poll = async () => {
        try {
          const res = await axios.get(`/api/results/latest?job_id=${job_id}`);
          const resultText = res?.data?.result?.toLowerCase() || '';

          if (
            resultText &&
            !resultText.includes('henüz') &&
            !resultText.includes('error') &&
            resultText.trim().length > 10
          ) {
            setLatestResult(res.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Sonuç alınamadı, tekrar denenecek...');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          setLatestResult({ result: 'Sonuç alınamadı veya zaman aşımına uğradı.' });
          setLoading(false);
        }
      };

      poll();
    } catch (error) {
      console.error('Gönderme hatası:', error);
      alert('Bir hata oluştu.');
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!latestResult) return;

    const element = document.createElement('a');
    const file = new Blob(
      [latestResult.result || 'Henüz sonuç bulunamadı.'],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${jobType}_sonucu.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div>
      <h2>Yeni Bir Siteyi Tara</h2>
      <form onSubmit={handleSubmit}>
        <label>İş Tipi</label>
        <br />
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          style={{ padding: '8px', marginBottom: '10px', width: '300px' }}
        >
          <option value="katana">Katana (URL tarayıcı)</option>
          <option value="port_scan">Port Taraması</option>
          <option value="ping">Ping Testi</option>
          <option value="whois_lookup">Whois Sorgusu</option>
          <option value="http_headers">HTTP Headers</option>
          <option value="os_detection">OS Detection</option>
          <option value="command">Komut Çalıştır</option>
        </select>
        <br />
        <label>Hedef (URL, domain, IP veya komut)</label>
        <br />
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={getPlaceholder()}
          style={{ width: '300px', padding: '8px', marginBottom: '10px' }}
        />
        <br />
        <button type="submit" style={{ padding: '8px 16px' }}>
          TARA
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              border: "4px solid #ccc",
              borderTop: "4px solid #333",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "auto",
            }}
          />
          <p>Sonuç bekleniyor...</p>
        </div>
      )}

      {latestResult && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <h3>İşlem Sonucu</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {latestResult.result || 'Henüz sonuç bulunamadı.'}
          </pre>
          <button onClick={downloadResult} style={{ marginTop: '10px', padding: '6px 12px' }}>
            Sonucu İndir
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Jobs;

