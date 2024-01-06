let express = require('express');
let router = express.Router();
const bcrypt = require('bcrypt');
const mongojs = require('mongojs');
let validator = require('validator');
const passport = require('passport');
const db = mongojs('mongodb://***REMOVED***@***REMOVED***:27017/phonos?authSource=admin', ['users']);

/**
 * CRYPTOGRAPHY REQUIRED FOR PASSWORD HASHING AND COMPARING
 * Adapted from: https://stackoverflow.com/a/14015883
 */
let cryptPassword = function (password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err)
            return callback(err);

        bcrypt.hash(password, salt, function (err, hash) {
            return callback(err, hash);
        });
    });
};
let comparePassword = function (plainPass, hashword, callback) {
    bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
        return err == null ?
            callback(null, isPasswordMatch) :
            callback(err);
    });
};

/**
 * Ruta simple para ver si funciona el auth : GET /auth
 */
router.get('/', function (req, res) {
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

    db.users.findOne({$and: [{mail: {$eq: req.body.user}}, {authtype: {$eq:'native'}}]}, (err, user) => {
        if (err) {
            res.status(500).send('ERR - Error de base de datos');
            return;
        }
        if (!user) {
            // User not found
            res.status(401).send('ERR - Correo electrónico no encontrado');
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
            req.session.mail = user.mail;
            res.status(200).send('OK');
        });
    });
});

/**
 * Método principal de registro (nativo): /auth/register
 */
router.get('/register', (req, res) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('register');
    }
});
router.post('/register/step1', (req, res) => {
    if (!req.body.user || !req.body.password || !req.body.email) {
        res.status(400).send('ERR - Faltan campos (usuario, contraseña, email)');
        return;
    }
    // mail not valid
    if (!validator.isEmail(req.body.email)) {
        res.status(400).send('ERR - El e-mail no es válido');
        return;
    }
    if (req.body.password.length < 4) {
        res.status(400).send('ERR - La contraseña debe tener al menos 4 caracteres');
        return;
    }
    db.users.findOne({$and: [{mail: {$eq: req.body.email}}, {authtype: {$eq:'native'}}]}, (err, user) => {
        if (err) {
            res.status(500).send('ERR - Error de base de datos');
            return;
        }
        if (user) {
            // User already exists
            res.status(409).send('ERR - E-Mail ya utilizado por otro usuario')
            return;
        }
        // bien, generamos un codigo de 6 digitos y enviamos email
        let code = Math.floor(100000 + Math.random() * 900000);
        req.session.code = code;
        req.session.tempuser = req.body.user;
        req.session.tempmail = req.body.email;
        req.session.temppass = req.body.password;
        // No hay dinero para un servicio de smtp y tampoco queremos
        // exponer aquí nuestras credenciales smtp privadas, asi que no
        // habrá envios de email.
        res.send(code.toString());
    });
});
router.post('/register/step2', (req, res) => {
    if (!req.session.tempuser) {
        res.status(428).send('ERR - Completa primero el paso 1 (/register/step1)');
        return;
    }
    if (!req.body.code) {
        res.status(400).send('ERR - Introduce el código');
        return;
    }
    if (req.session.code.toString() !== req.body.code) {
        res.status(401).send('ERR - Código incorrecto');
        return;
    }
    cryptPassword(req.session.temppass, (err, hash) => {
        if (err) {
            res.status(500).send('ERR - Error interno de criptografía');
            return;
        }
        // bien, insertar usuario
        db.users.insert({
            user: req.session.tempuser,
            mail: req.session.tempmail,
            hash: hash,
            authtype: 'native',
            audios: []
        }, (err) => {
            if (err) {
                res.status(500).send('ERR - Error de base de datos');
                return;
            }
            req.session.user = req.session.tempuser;
            req.session.authtype = 'native';
            req.session.mail = req.session.tempmail;
            req.session.useraudios = [];
            res.status(200).send('OK');
        });
    });
});

/**
 * Cerar sesión : POST /auth/logout
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
});

/**
 * OAUTH AUTHENTICATION
 */

// Inicializar passport
router.use(passport.initialize());
router.use(passport.session());
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

/**
 * GOOGLE AUTH
 */
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '***REMOVED***';
const GOOGLE_CLIENT_SECRET = '***REMOVED***';
const appport = normalizePort(process.env.PORT || '3450');
let userprofile;
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://***REMOVED***/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        userprofile = profile;
        return done(null, userprofile);
    }
));

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/error'}),
    (req, res) => {
        // Successful authentication, redirect success.
        db.users.findOne({$and: [{mail: {$eq: userprofile.emails[0].value}}, {authtype: {$eq:'google'}}]}, (err, resuser) => {
            if (err) {
                res.status(500).send('ERR - Error de base de datos al buscar el usuario');
                return;
            }
            req.session.user = userprofile.name.givenName + " " + userprofile.name.familyName;
            req.session.mail = userprofile.emails[0].value;
            req.session.authtype = 'google';
            if (!resuser) {
                // User not found - insert it in database
                req.session.useraudios = [];
                db.users.insert({
                    user: userprofile.name.givenName + " " + userprofile.name.familyName,
                    mail: userprofile.emails[0].value,
                    googleid: userprofile.id,
                    authtype: 'google',
                    audios: []
                }, (err) => {
                    if (err) {
                        res.status(500).send('ERR - Error de base de datos al insertar el usuario');
                    }});
            } else {
                // User found - get data
                req.session.useraudios = resuser.audios;
            }
            res.redirect('/');
        });
});


/**
 * GITHUB AUTH
 */
const GithubStrategy = require('passport-github').Strategy;
const GITHUB_CLIENT_ID = '***REMOVED***';
const GITHUB_CLIENT_SECRET = '***REMOVED***';
passport.use(new GithubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "https://***REMOVED***/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        userprofile = profile;
        return done(null, userprofile);
    }
));

router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', {failureRedirect: '/error'}),
    (req, res) => {
        // Successful authentication, redirect success.
        db.users.findOne({$and: [{mail: {$eq: userprofile.profileUrl}}, {authtype: {$eq:'github'}}]}, (err, resuser) => {
            if (err) {
                res.status(500).send('ERR - Error de base de datos al buscar el usuario');
                return;
            }
            req.session.user = userprofile.displayName;
            req.session.mail = userprofile.profileUrl;
            req.session.authtype = 'github';
            if (!resuser) {
                // User not found - insert it in database
                req.session.useraudios = [];
                db.users.insert({
                    user: userprofile.displayName,
                    mail: userprofile.profileUrl,
                    githubid: userprofile.id,
                    authtype: 'github',
                    audios: []
                }, (err) => {
                    if (err) {
                        res.status(500).send('ERR - Error de base de datos al insertar el usuario');
                    }});
            } else {
                // User found - get data
                req.session.useraudios = resuser.audios;
            }
            res.redirect('/');
        });
    });

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

module.exports = router;