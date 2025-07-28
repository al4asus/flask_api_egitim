import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grow,
} from '@mui/material';

function History() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('/api/results');
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    fetchResults();
  }, []);

  return (
    <Box sx={{ mt: 6, ml: 10, maxWidth: '800px' }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
        Job History
      </Typography>

      {results.length === 0 ? (
        <Typography sx={{ color: 'white' }}>No results yet.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {results.map((item, index) => (
            <Grow in={true} timeout={500 + index * 200} key={item.id}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Job: {item.job_type.toUpperCase()} — ID: {item.id}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Date: {new Date(item.created_at).toLocaleString()}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontSize: '0.9em'
                  }}
                >
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(item.result), null, 2);
                    } catch {
                      return item.result;
                    }
                  })()}
                </Box>
              </Paper>
            </Grow>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default History;

