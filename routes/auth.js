let express = require('express');
let router = express.Router();
const bcrypt = require('bcrypt');
const mongojs = require('mongojs');
let validator = require('validator');
const db = mongojs('mongodb://127.0.0.1:27017/phonos', ['users']);

/**
 * CRYPTOGRAPHY REQUIRED FOR PASSWORD HASHING AND COMPARING
 * Adapted from: https://stackoverflow.com/a/14015883
 */
let cryptPassword = function(password, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err)
      return callback(err);

    bcrypt.hash(password, salt, function(err, hash) {
      return callback(err, hash);
    });
  });
};
let comparePassword = function(plainPass, hashword, callback) {
  bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {
    return err == null ?
        callback(null, isPasswordMatch) :
        callback(err);
  });
};

/**
 * Ruta simple para ver si funciona el auth : GET /auth
 */
router.get('/', function(req, res) {
  if (req.session.user) {
    res.status(200).send('OK - Logged in - ' + req.session.user + ' - ' + req.session.authtype);
  } else {
    res.status(401).send('ERR - Unauthorized');
  }
});

/**
 * Método principal de login : POST /auth/login
 */
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('login')
  }
});
router.post('/login', (req, res) => {
  if (req.session.user) {
    res.status(200).send('OK');
    return;
  }
  if (!req.body.user || !req.body.password) {
    res.status(400).send('ERR - Faltan campos (usuario, contraseña)');
    return;
  }
  db.users.findOne({user:{$eq:req.body.user}}, (err, user) => {
    if (err) {
      res.status(500).send('ERR - Error de base de datos');
      return;
    }
    if (!user) {
      // User not found
      res.status(401).send('ERR - Usuario no encontrado');
      return;
    }
    comparePassword(req.body.password, user.hash, (err, match) => {
      if (err) {
        res.status(500).send('ERR - Error interno de criptografía');
        return;
      }
      if (!match) {
        // Wrong password
        res.status(401).send('ERR - Contraseña Incorrecta');
        return;
      }
      // Everything correct
      req.session.user = user.user;
      req.session.authtype = user.authtype;
      req.session.useraudios = user.audios;
      res.status(200).send('OK');
    });
  });
});

/**
 * Método principal de registro (nativo): POST /auth/register
 */
router.post('/register', (req, res) => {
  if (!req.body.user || !req.body.password || req.body.email) {
    res.status(400).send('ERR - Faltan campos (usuario, contraseña)');
    return;
  }
  // mail not valid
  if (!validator.isEmail(req.body.email)) {
    req.status(400).send('ERR - El e-mail no es válido');
  }
  db.users.findOne({user:{$eq:req.body.user}}, (err, user) => {
    if (err) {
      res.status(500).send('ERR - Error de base de datos');
      return;
    }
    if (user) {
      // User already exists
      res.status(409).send('ERR - El usuario ya existe');
      return;
    }
    cryptPassword(req.body.password, (err, hash) => {
      if (err) {
          res.status(500).send('ERR - Error interno de criptografía');
          return;
      }
      db.users.insert({
          user: req.body.user,
          email: req.body.email,
          hash: hash,
          authtype: 'native',
          audios: []
      }, (err) => {
          if (err) {
            res.status(500).send('ERR - Error de base de datos');
            return;
          }
          res.status(200).send('OK - Registrado');
      });
    });
  });
});

/**
 * Cerar sesión : POST /auth/logout.ejs
 */
router.post('/logout', (req, res) => {
  if (!req.session.user) {
    res.status(400).send('ERR - Already logged out')
  } else {
    req.session.destroy();
    res.status(200).send('OK');
  }
});
router.get('/logout', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    res.render('logout', {"nick": req.session.user});
  }
})

module.exports = router;
