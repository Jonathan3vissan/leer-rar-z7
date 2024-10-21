const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Función para verificar la contraseña
function verificarContraseña(archivo, archivoEspecifico, contraseña) {
  return new Promise((resolve, reject) => {
    const tempFolder = path.join(__dirname, 'temp_extract');
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder); 
    }

    const comando = `"C:\\Program Files\\7-Zip\\7z.exe"`; 
    const args = ['x', archivo, `-p${contraseña}`, `-o${tempFolder}`, archivoEspecifico, '-y'];

    console.log(`Ejecutando comando: ${comando} ${args.join(' ')}`);

    const proceso = spawn(comando, args, { shell: true });

    let output = '';
    let errorOutput = '';

    proceso.stdout.on('data', (data) => {
      output += data.toString();
    });

    proceso.stderr.on('data', (data) => {
      errorOutput += data.toString();
      if (data.toString().includes('Wrong password') || data.toString().includes('Contraseña incorrecta')) {
        reject(new Error('Contraseña incorrecta'));
      }
    });

    proceso.on('close', (code) => {
      if (output.includes('Everything is Ok')) {
        resolve(`Contraseña correcta: ${contraseña}`);
      } else {
        reject(new Error('Contraseña incorrecta o archivo no encontrado'));
      }
    });
  });
}

// Función generadora de contraseñas
function* generadorClaves(characters, maxLength) {
  function* helper(prefix, chars, length) {
    if (length === 0) {
      yield prefix;
    } else {
      for (let i = 0; i < chars.length; i++) {
        yield* helper(prefix + chars[i], chars, length - 1);
      }
    }
  }

  for (let length = 1; length <= maxLength; length++) {
    yield* helper('', characters, length);
  }
}

// Función para probar contraseñas en paralelo
async function probarClavesEnParalelo(archivo, archivoEspecifico, generador) {
  const tareas = [];
  for (let clave of generador) {
    console.log(`Intentando con la contraseña: ${clave}`);

    const tarea = verificarContraseña(archivo, archivoEspecifico, clave)
      .then(resultado => {
        console.log(resultado);
        return true;
      })
      .catch(error => {
        console.log(`Contraseña incorrecta: ${clave}`);
        return false;
      });

    tareas.push(tarea);
    if (tareas.length >= os.cpus().length) {
      const resultados = await Promise.all(tareas);
      if (resultados.some(r => r)) {
        console.log('Contraseña encontrada, deteniendo el proceso.');
        break;
      }
      tareas.length = 0; 
    }
  }
}

// Iniciar prueba de claves
const archivo = 'C:\\Users\\Cuent\\Desktop\\aca.rar';
const archivoEspecifico = 'aca\\dentro\\pudimos.txt'; 

const characters = 'Sal1';  // Caracteres posibles para la contraseña
const maxLength = 3;  // Longitud máxima de la contraseña
const generador = generadorClaves(characters, maxLength);

probarClavesEnParalelo(archivo, archivoEspecifico, generador);
