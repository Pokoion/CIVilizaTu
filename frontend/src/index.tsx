import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Asegúrate de que el componente App esté correctamente importado
import './styles/index.css'; // Asegúrate de que los estilos globales existan

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
