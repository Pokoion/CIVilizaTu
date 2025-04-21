const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde la carpeta 'frontend'
app.use(express.static(path.join(__dirname)));

// Ruta principal para servir index.html
app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});