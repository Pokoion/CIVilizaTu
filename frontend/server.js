const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde la carpeta 'frontend/build'
app.use(express.static(path.join(__dirname, 'build')));

// Ruta principal para servir index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});