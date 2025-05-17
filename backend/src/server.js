// src/server.js
import app from './app.js';

const PORT = process.env.PORT || 3001; // Usa a porta do .env ou 3001 como padrão

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});