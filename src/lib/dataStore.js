import { writable } from 'svelte/store';

// Creamos un store reactiva con un valor inicial vacío
export const dataStore = writable([]);

// Función para obtener datos de la API de Datawrapper
export async function fetchData() {
    const response = await fetch('https://api.datawrapper.de/v3/charts/1DJlz/data', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
    });

    if (response.ok) {
        const csvData = await response.text();
        // Convertimos el CSV en un array de objetos y actualizamos el store
        dataStore.set(convertCsvToJson(csvData));
    } else {
        console.error('Error fetching data:', response.statusText);
    }
}

/**
 * Función para convertir CSV a JSON
 * @param {string} csv - El texto en formato CSV
 * @returns {Array<Object>} - El CSV convertido en un array de objetos
 */
function convertCsvToJson(csv) {
    // Comprueba si el csv está vacío y devuelve un array vacío si lo está
    if (!csv.trim()) return [];
  
    // Divide el CSV por líneas
    const lines = csv.split('\n');
    // Obtiene los encabezados usando la coma como delimitador
    const headers = lines[0].split(',');
    // Prepara el array de resultados
    const result = lines.slice(1).map(line => {
      const data = line.split(',');
      // Asume que la primera columna es 'distrito' y la segunda 'nombre_distrito'
      const distrito = data[0].trim();
      const nombre_distrito = data[1].trim();
      // El resto de los datos se mantienen en una cadena para 'datos'
      const datos = data.slice(2).join(',').trim(); // Une el resto de los datos con comas
  
      // Retorna un nuevo objeto con esta estructura
      return { 
        distrito, 
        nombre_distrito, 
        datos // Esto contiene el resto de los datos como una sola cadena
      };
    });
    // Filtra filas que puedan estar vacías
    return result.filter(row => row.distrito && row.nombre_distrito);
  }
  
// Inicialmente obtenemos los datos
fetchData();