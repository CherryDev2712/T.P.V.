import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import routes from './src/routes/routes.js'; // Importar rutas

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8000; // Use environment variable or fallback to 3001

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para formularios HTML

// Servir solo la carpeta public/js como estática para archivos JS
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// Configuración de motor de plantillas (EJS)
app.set('view engine', 'ejs'); // Motor EJS
app.set('views', path.join(__dirname, 'views')); // Carpeta de vistas

// Usar rutas importadas
app.use('/', routes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor test ejecutando en http://localhost:${PORT}`);
});

// ho0la