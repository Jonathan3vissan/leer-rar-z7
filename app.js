const { exec } = require('child_process');

// Función para verificar la contraseña
function verificarContraseña(archivo, contraseña) {
  return new Promise((resolve, reject) => {
    // Comando para listar el contenido del archivo .rar
    const comando = `7z l ${archivo} -p${contraseña}`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        // Si hay un error, probablemente sea porque la contraseña es incorrecta
        if (stderr.includes('Wrong password')) {
          return reject(new Error('Contraseña incorrecta'));
        }
        return reject(error);
      }

      // Si no hubo errores, la contraseña es correcta
      resolve('Contraseña correcta');
    });
  });
}

// Uso de la función
const archivo = 'path/to/tu/archivo.rar'; // Cambia esta ruta por la ruta de tu archivo
const contraseña = 'tu_contraseña';       // Cambia esto por la contraseña que quieres verificar

verificarContraseña(archivo, contraseña)
  .then(mensaje => {
    console.log(mensaje); // "Contraseña correcta"
  })
  .catch(err => {
    console.error(err.message); // "Contraseña incorrecta" o cualquier otro error
  });
