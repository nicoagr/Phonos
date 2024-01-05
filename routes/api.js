let express = require('express');
let router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://***REMOVED***@***REMOVED***:27017/phonos?authSource=admin', ['users']);
const multer = require('multer');


/**
 * LIST
 */
router.get('/list', async function (req, res) {
    res.send({"files": await handleList(req)});
});

let handleList = async (req) => {
    if (!req.session.user) {
        return [];
    };
    return db.users.findOne({ $and: [{ mail: { $eq: req.session.mail } }, { authtype: { $eq: req.session.authtype } }] }, (err, user) => {
        if (err) {
            // res.status(500).send("ERR - Error en la base de datos");
            return [];
        }
        if (!user) {
            // En principio siempre debería haber un usuario si está iniciada la sesión, pero
            // dejo estas lineas por si acaso.
            // res.status(404).send("ERR - Usuario no encontrado - Algo ha ido mal");
            return [];
        }
        let listaAudios = [];
        if (user.audios.length > 5) {
            listaAudios = user.audios.slice(user.audios.length - 5);
        } else if (user.audios.length > 0 && user.audios.length < 5) {
            for (let i = user.audios.length - 1; i >= 0; i--) {
                listaAudios.push(user.audios[i]);
            }
        }
        return listaAudios;
    });
}


/**
 * UPLOAD
 */

// Se ha decidido no usar MULTER. Con nuestro modelo, en dos maquinas separadas
// del estilo aplicacion - base de datos no encaja. Nos interesa guardar los archivos en la
// propia base de datos, no en el disco donde se ejecute la aplicacion.
// de todas formas, aqui esta el codigo por si acaso.

// // multer es un middleware - cuando lo establezcamos en la ruta,
// // se ejecutará antes que nuestra función y nos subirá el archivo
// const upload = multer({
//     storage: multer.diskStorage({ // Los archivos que nos vengan desde el cliente se guardarán en el disco
//         destination: (req, file, cb) => {
//             cb(null, 'recordings/') // Querremos guardar los archivos en el directorio 'recordings'
//         },
//         // y como no hemos especificado un nombre de archivo, dame uno random (https://t.ly/BfMOF)
//     }),
//     limits: { fileSize: 2500000 }, // limite de tamaño de archivo en bytes
//     fileFilter: (req, file, cb) => {
//         if (!req.session.user) {
//             cb('401 - ERR - Login Necesario', false); // No aceptes el archivo, login necesario
//         } else if (file.size > 2500000) {
//             cb('413 - ERR - Archivo muy grande', false); // No aceptes el archivo, muy grande (doble comprobacion)
//         } else {
//             cb(null, true); // Acepta el archivo
//         }
//     }
// }).single('recording'); // 'recording' es el nombre del campo del formulario (desde donde envia el cliente)

router.post('/upload', (req, res) => {
    // En req.body.recording tenemos el archivo que nos envia el cliente codificado en base64
    if (!req.session.user) {
        res.status(401).send("ERR - Login Necesario");
        return;
    }
    let audio = {
        id: strHasherCyrb53(req.body.recording),
        data: req.body.recording,
        date: Date.now()
    }
    req.session.useraudios.push(audio);
    // Persist useraudios in database
    db.users.findAndModify({
        query: { $and: [{ mail: { $eq: req.session.mail } }, { authtype: { $eq: req.session.authtype } }] },
        update: { $set: { audios: req.session.useraudios } },
    }, (err) => {
        if (err) {
            res.status(500).send("ERR - Error en la base de datos");
            return;
        }
    });
    // return list of audios
    res.send({"files": handleList(req)});
});


/**
 * Credits to some random guy on stackoverflow
 * https://stackoverflow.com/a/52171480
 */
const strHasherCyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/**
 * DELETE
 */
router.post('/delete/:id', (req, res) => {
    if (!req.session.user) {
        res.status(401).send("ERR - Login Necesario");
        return;
    }
    let id = req.params.id;
    let index = req.session.useraudios.findIndex((audio) => {
        return audio.id == id;
    });
    if (index == -1) {
        res.status(404).send("ERR - Audio no pertenece al usuario");
        return;
    }
    req.session.useraudios.splice(index, 1);
    // Persist useraudios in database
    db.users.findAndModify({
        query: { $and: [{ mail: { $eq: req.session.mail } }, { authtype: { $eq: req.session.authtype } }] },
        update: { $set: { audios: req.session.useraudios } },
    }, (err) => {
        if (err) {
            res.status(500).send("ERR - Error en la base de datos");
            return;
        } else {
            res.status(200).send("OK");
        }
    });
});

module.exports = router;

