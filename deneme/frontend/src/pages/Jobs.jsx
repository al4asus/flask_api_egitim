import React, { useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  CircularProgress,
  Grow
} from '@mui/material';

function Jobs() {
  const [jobType, setJobType] = useState('ping');
  const [target, setTarget] = useState('');
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const jobOptions = [
    { value: 'katana', label: 'Katana (URL Scanner)' },
    { value: 'port_scan', label: 'Port Scan' },
    { value: 'ping', label: 'Ping Test' },
    { value: 'whois_lookup', label: 'Whois Lookup' },
    { value: 'http_headers', label: 'HTTP Headers' },
    { value: 'os_detection', label: 'OS Detection' },
    { value: 'command', label: 'Execute Command' },
  ];

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
        return 'Enter target';
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
      alert('Invalid target format!');
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
            !resultText.includes('not yet') &&
            !resultText.includes('error') &&
            resultText.trim().length > 10
          ) {
            setLatestResult(res.data);
            setLoading(false);
            return;
          }
        } catch {
          // retry silently
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          setLatestResult({ result: 'No result received or request timed out.' });
          setLoading(false);
        }
      };

      poll();
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting.');
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!latestResult) return;

    const element = document.createElement('a');
    const file = new Blob(
      [latestResult.result || 'No result available yet.'],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${jobType}_result.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Box sx={{ mt: 6, ml: 10, maxWidth: '800px' }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
        Scan a New Target
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          select
          fullWidth
          label="Job Type"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              backgroundColor: 'rgba(26, 26, 46, 0.5)',
              color: '#fff',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ff9999',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ffffff',
            },
            '& .MuiInputLabel-root': {
              color: '#ccc',
            }
          }}
          InputLabelProps={{ style: { color: '#ddd' } }}
          InputProps={{ style: { color: '#fff' } }}
        >
          {jobOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Target (URL, domain, IP or command)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={getPlaceholder()}
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              backgroundColor: 'rgba(26, 26, 46, 0.5)',
              color: '#fff',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ff9999',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ffffff',
            },
            '& .MuiInputLabel-root': {
              color: '#ccc',
            }
          }}
          InputLabelProps={{ style: { color: '#ddd' } }}
          InputProps={{ style: { color: '#fff' } }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#ff6666',
            '&:hover': {
              backgroundColor: '#ff4d4d',
            }
          }}
        >
          SCAN
        </Button>
      </form>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      <Grow in={!!latestResult} timeout={1000}>
        <div>
          {latestResult && (
            <Paper elevation={2} sx={{ mt: 4, p: 2, backgroundColor: '#1e1e1e', color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Scan Result
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: 'white' }}>
                {latestResult.result || 'No result available yet.'}
              </pre>
              <Button onClick={downloadResult} variant="outlined" sx={{ mt: 2 }}>
                Download Result
              </Button>
            </Paper>
          )}
        </div>
      </Grow>
    </Box>
  );
}

export default Jobs;

