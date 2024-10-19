const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const characters = 'LISANDORlisnadro 0123456789'; // Conjunto de caracteres a usar en el generador de claves
const maxLength = 14;      // Longitud máxima de las claves generadas

// Función para verificar la contraseña intentando extraer un archivo específico dentro del RAR
function verificarContraseña(archivo, archivoEspecifico, contraseña) {
  return new Promise((resolve, reject) => {
    const tempFolder = path.join(__dirname, 'temp_extract'); // Carpeta temporal para extraer el archivo
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder); // Crear la carpeta si no existe
    }

    // Comando para extraer un archivo específico dentro del RAR
    const comando = `"C:\\Program Files\\7-Zip\\7z.exe"`;
    const args = ['x', archivo, `-p${contraseña}`, `-o${tempFolder}`, archivoEspecifico, '-y'];

    const proceso = spawn(comando, args, { shell: true });

    let output = ''; // Para capturar el stdout completo

    proceso.stdout.on('data', (data) => {
      output += data.toString(); // Acumulamos la salida completa
      console.log(`stdout: ${data}`);
    });

    proceso.stderr.on('data', (data) => {
      const errorMessage = data.toString();
      console.error(`stderr: ${errorMessage}`);
      if (errorMessage.includes('Wrong password') || errorMessage.includes('Contraseña incorrecta')) {
        reject(new Error('Contraseña incorrecta'));
      }
    });

    proceso.on('close', (code) => {
      // Verificar si se extrajo algún archivo
      if (output.includes('Everything is Ok') && output.includes('Files: 1')) {
        resolve(`Contraseña correcta: ${contraseña}`);
      } else {
        reject(new Error('Contraseña incorrecta o archivo no encontrado'));
      }
    });
  });
}

// Generador de claves
function* generadorClaves(characters, maxLength) {
  function* generate(currentKey, currentLength) {
    if (currentLength === 0) {
      yield currentKey;
      return;
    }
    for (let i = 0; i < characters.length; i++) {
      yield* generate(currentKey + characters[i], currentLength - 1);
    }
  }
  for (let length = 1; length <= maxLength; length++) {
    yield* generate('', length);
  }
}

// Función para probar todas las combinaciones de claves generadas
async function probarClaves(archivo, archivoEspecifico, generador) {
  for (let clave of generador) {
    console.log(`Intentando con la contraseña: ${clave}`); // Mostrar la contraseña que se está probando
    try {
      const resultado = await verificarContraseña(archivo, archivoEspecifico, clave);
      console.log(resultado);
      break; // Si se encuentra la contraseña correcta, detenemos el ciclo
    } catch (error) {
      if (error.message === 'Contraseña incorrecta o archivo no encontrado') {
        console.log(`Contraseña incorrecta o archivo no encontrado: ${clave}`); // Mostramos las contraseñas incorrectas o archivos no encontrados
      } else {
        console.error('Error al verificar la contraseña:', error.message); // Si ocurre otro error
      }
    }
  }
}

// Uso del generador y prueba de claves
const archivo = 'C:\\Users\\Cuent\\Desktop\\este\\pruba_rar.rar'; // Ruta al archivo RAR
const archivoEspecifico = '"abrir.rar\\fotos que cuidar\\cosas\\IMG_20190627_174619.jpg"';  // Especificar el archivo dentro del RAR
const generador = generadorClaves(characters, maxLength);

probarClaves(archivo, archivoEspecifico, generador);
