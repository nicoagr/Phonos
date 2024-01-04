const mongojs = require('mongojs');
const db = mongojs('mongodb://***REMOVED***@***REMOVED***:27017/phonos?authSource=admin', ['users']);

setInterval(() => {
  console.log('Ejecutando cleanup');

  // Cogemos la hora actual y le restamos 5 días
  let marcadorDia = new Date();
  marcadorDia.setDate(marcadorDia.getDate() - 5);

  // Tenemos que recorrer todos los usuarios
  db.users.find({}, (err, users) => {
    if (err) {
      console.error("Cleanup: Error en BD");
    } else {
      users.forEach(user => {
        // Usamos filter para quedarnos con los audios que sean más nuevos que el marcador
        let audiosViejos = user.audios.filter(audio => {
          let fechaAudio = new Date(audio.date); // Asumo que audio.date existe
          return fechaAudio > marcadorDia;
        });

        // Update the user's audios
        db.users.update({_id: user._id}, {$set: {audios: audiosViejos}}, (err) => {
          if (err) {
            console.error("Cleanup: Error en BD");
          }
        });
      });
    }
  });
}, 3600000);