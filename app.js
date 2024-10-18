const { exec } = require('child_process');

// Función para verificar la contraseña
function verificarContraseña(archivo, contraseña) {
  return new Promise((resolve, reject) => {
    // Comando para listar el contenido del archivo .rar
    const comando = `"C:\\Program Files\\7-Zip\\7z.exe" l "${archivo}" -p${contraseña}`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        // Si hay un error, probablemente sea porque la contraseña es incorrecta
        if (stderr.includes('Wrong password')) {
          return reject(new Error('Contraseña incorrecta'));
        }
        return reject(error);
      }

      // Si no hubo errores, la contraseña es correcta
      resolve(`Contraseña correcta ${contraseña}`);
    });
  });
}

// Uso de la función
const archivo = 'C:\\Users\\Cuent\\Desktop\\este\\pruba_rar.rar'; // Cambia esta ruta por la ruta de tu archivo
const contraseña = 'S1';       // Cambia esto por la contraseña que quieres verificar

verificarContraseña(archivo, contraseña)
  .then(mensaje => {
    console.log(mensaje); // "Contraseña correcta"
  })
  .catch(err => {
    console.error(err.message); // "Contraseña incorrecta" o cualquier otro error
  });
