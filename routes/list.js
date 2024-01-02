let express = require('express');
let router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://127.0.0.1:27017/phonos', ['users']);


router.get('/list', function (req, res) {
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


module.exports = router;
