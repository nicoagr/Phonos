let express = require('express');
let router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://***REMOVED***@***REMOVED***:27017/phonos?authSource=admin', ['users']);
const multer = require('multer');



router.get('/list', async function (req, res) {
    if (!req.session.mail) {
        res.send({"files": []})
    } else {
        //console.log("Este es el resultado: \n"+await handleList(req))
        res.send({"files": await handleList(req)})
    }

});

router.post('/upload', function (req, res) {
    console.log("HAS LLEGADO AL UPLOAD");
});


const handleList = async (req) => {
    try {
        const user = await new Promise((resolve, reject) => {
            db.users.findOne({ $and: [{ mail: { $eq: req.session.mail } }, { authtype: { $eq: 'native' } }] }, (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });

        if (!user) {
            console.log("Usuario no encontrado");
            return [];
        }

        console.log("Existe Usuario");
        let listaAudios = [];

        if (user.audios.length > 5) {
            listaAudios = user.audios.slice(user.audios.length - 5);
        } else if (user.audios.length > 0 && user.audios.length < 5) {
            for (let i = user.audios.length - 1; i >= 0; i--) {
                listaAudios.push(user.audios[i]);
            }
        }

        console.log(listaAudios);
        return listaAudios;
    } catch (err) {
        console.error("Error:", err);
        return [];
    }
};

router.post('/upload/:name', (req, res, next) => {
    console.log("HAS LLEGADO AL UPLOAD");
    upload(req, res, async (err) => {
        if (err) {
            // Manejo de errores si la subida falla
            return res.status(400).send({ error: err.message });
        } else {

            //falta hacer el push a la base de datos

            return res.send({"files":handleList(req)}) // Llama a la función handleList para obtener las últimas 5 grabaciones
            // Por ejemplo:
            console.log('Archivo subido correctamente');
            // Lógica para guardar metadatos y otras operaciones aquí
            // ...

            // Envía una respuesta al cliente indicando que se subió correctamente
            res.status(200).send('Archivo subido correctamente');
        }
    });
});



// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'recordings/'); // Directorio donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Nombre del archivo guardado
    }
});

//multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 2500000 }, // Tamaño máximo del archivo en bytes
    fileFilter: function (req, file, cb) {
        console.log("formato: "+file.mimetype)
        if (file.mimetype === 'audio/ogg') {
            // Acepta solo archivos de tipo 'audio/ogg' porque lo dice Nagore xd
            console.log('Archivo válido')
            cb(null, true);
        } else {
            console.log('Archivo no válido')
            cb(new Error('Formato de archivo no válido. Solo se permiten archivos de audio en formato OGG.'));
        }
    }
}).single('recording'); // 'recording' es el nombre del campo del formulario


module.exports = router;

