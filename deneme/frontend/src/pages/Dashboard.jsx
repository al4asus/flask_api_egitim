import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Button, Box, Grow } from '@mui/material'; // Grow eklendi

function Dashboard() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/jobs');
  };

  return (
    <Box sx={{ mt: 6, ml: 10, maxWidth: '800px' }}>
      <Grow in={true} timeout={800}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Siber Güvenlik Analiz Paneli
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Bu panel aracılığıyla farklı siber güvenlik analizlerini gerçekleştirebilir,
            <strong> ping testi</strong>, <strong>port taraması</strong>,
            <strong> HTTP başlık analizi</strong>, <strong>whois sorgusu</strong>,
            <strong> OS tespiti</strong> ve <strong>özgün komut çalıştırma</strong> gibi işlemleri kolayca gerçekleştirebilirsiniz.
          </Typography>

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
            Hedef sistemlerle ilgili temel bilgileri toplayın, tarama geçmişinizi görüntüleyin
            ve çıktıları analiz ederek güvenlik durumunuzu iyileştirin.
          </Typography>

          <Box display="flex" justifyContent="flex-start" mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStart}
              size="large"
            >
              Başlamak İçin Tıklayın
            </Button>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}

export default Dashboard;

