import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import routes from './src/routes/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/views/modulos/css')));

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ID de tu hoja de cálculo
const SHEET_ID = '1Sc7_Ao1fdgJXNN-HdfRpMqCSoD2JpBGKisCFDXsDYks';

// Función para obtener datos de una hoja específica
async function getSheetData(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  try {
    const response = await axios.get(url);
    const jsonData = JSON.parse(response.data.replace(/.*setResponse\(|\);/g, ''));
    const headers = jsonData.table.cols.map(col => col.label);
    const rows = jsonData.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[headers[i]] = cell ? cell.v : '';
      });
      return obj;
    });
    return rows;
  } catch (error) {
    console.error(`Error al obtener datos de la hoja "${sheetName}":`, error.message);
    return [];
  }
}

// Ruta principal para tu TPV
app.get('/tpv', async (req, res) => {
  try {
    const productos = await getSheetData('productos');
    const categorias = await getSheetData('categorias');

    res.render('tpv', {
      productos,
      categorias
    });
  } catch (error) {
    console.error('Error al cargar datos desde Google Sheets:', error.message);
    res.status(500).send('Error al cargar datos.');
  }
});

// Rutas adicionales
app.use('/', routes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
