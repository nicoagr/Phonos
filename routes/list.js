let express = require('express');
let router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://***REMOVED***@***REMOVED***:27017/phonos?authSource=admin', ['users']);


router.get('/', function (req, res) {
    console.log(req.session.mail);
    let lista = [];
    if (!req.session.mail) {
        console.log("NO HAY USUARIO REGISTRADO")
        res.send({"files": lista})
    } else {
        db.users.findOne({$and: [{mail: {$eq: req.session.mail}}, {authtype: {$eq: 'native'}}]}, (err, user) => {
            if (err) {
                res.status(500).send("ERROR");
                res.send({"files": lista});
                console.log("ERROR")

            } else {
                console.log("Existe Usuario")
                if (user.audios.length > 5) {
                    lista = user.audios.slice(user.audios.length - 5)
                    console.log(lista)
                    res.send({"files": lista});

                } else if (user.audios.length > 0 && user.audios.length < 5) {
                    for (let i = user.audios.length - 1; i >= 0; i--) {
                        console.log(user.audios[i])
                        lista.push(user.audios[i])
                    }
                    res.send({"files": lista});
                }
            }
        });

    }

});
router.get('/list', async function (req, res) {
    if (!req.session.mail) {
        res.send({"files": []})
    } else {
        //console.log("Este es el resultado: \n"+await handleList(req))
        res.send({"files": await handleList(req)})
    }

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
module.exports = router;
