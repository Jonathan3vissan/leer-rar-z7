const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para verificar la contraseña intentando extraer un archivo específico dentro del RAR
function verificarContraseña(archivo, archivoEspecifico, contraseña) {
  return new Promise((resolve, reject) => {
    const tempFolder = path.join(__dirname, 'temp_extract'); // Carpeta temporal para extraer el archivo
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder); // Crear la carpeta si no existe
    }

    // Comando para extraer un archivo específico dentro del RAR
    const comando = `"C:\\Program Files\\7-Zip\\7z.exe"`; // Asegúrate de que la ruta a 7z.exe sea correcta
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
      // Verificar si se extrajo el archivo
      const archivoExtraido = path.join(tempFolder, archivoEspecifico);
      if (output.includes('Everything is Ok') && fs.existsSync(archivoExtraido)) {
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

// Función para guardar la contraseña y la dirección en un archivo .txt
function guardarInformacion(archivo, contraseña) {
  const contenido = `Archivo: ${archivo}\nContraseña: ${contraseña}\n`;
  const rutaArchivo = path.join(__dirname, 'informacion.txt');
  
  fs.writeFileSync(rutaArchivo, contenido, { flag: 'a' }); // 'a' para agregar al final del archivo
  console.log(`Información guardada en: ${rutaArchivo}`);
}

// Función para probar todas las combinaciones de claves generadas
async function probarClaves(archivo, archivoEspecifico, generador) {
  for (let clave of generador) {
    console.log(`Intentando con la contraseña: ${clave}`); // Mostrar la contraseña que se está probando
    try {
      const resultado = await verificarContraseña(archivo, archivoEspecifico, clave);
      console.log(resultado);
      guardarInformacion(archivo, clave); // Guardar información al encontrar la contraseña correcta
      break; // Si se encuentra la contraseña correcta, detenemos el ciclo
    } catch (error) {
      if (error.message === 'Contraseña incorrecta o archivo no encontrado') {
        console.log(`Contraseña incorrecta o archivo no encontrado: ${clave}`); // Mostramos las contraseñas incorrectas
      } else {
        console.error('Error al verificar la contraseña:', error.message);
      }
    }
  }
}

// Uso del generador y prueba de claves
//const archivo = 'C:\\Users\\Cuent\\Desktop\\aca.rar';  // Ruta al archivo RAR
//const archivoEspecifico = 'aca\\dentro\\pudimos.txt';  // Ruta interna del archivo dentro del RAR
const characters = 'LISANDROlisandroBbVvTt 0123456789ggi'; // Conjunto de caracteres
const maxLength = 16;      // Longitud máxima de la contraseña
const generador = generadorClaves(characters, maxLength);

const archivo = '"C:\\Users\\Cuent\\Desktop\\descompirmi\\abrir.rar"';  // Ruta al archivo RAR (con comillas dobles)
const archivoEspecifico = '"abrir.rar\\fotos que cuidar\\cosas\\IMG_20190627_174619.jpg"';

// Iniciar el proceso de prueba de contraseñas
probarClaves(archivo, archivoEspecifico, generador);



//const archivoEspecifico = '"abrir.rar\\fotos que cuidar\\cosas\\IMG_20190627_174619.jpg"';  // Especificar el archivo dentro del RAR
//const archivo = 'C:\\Users\\Cuent\\Desktop\\este\\pruba_rar.rar'; // Ruta al archivo RAR