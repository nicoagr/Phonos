let express = require('express');
let router = express.Router();
const bcrypt = require('bcrypt');
const mongojs = require('mongojs');
let validator = require('validator');
const passport = require('passport');
const db = mongojs('mongodb://127.0.0.1:27017/phonos', ['users']);

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
    db.users.findOne({$or: [{user: {$eq: req.body.user}}, {mail: {$eq: req.body.user}}]}, (err, user) => {
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
        req.status(400).send('ERR - El e-mail no es válido');
    }
    db.users.findOne({$or: [{user: {$eq: req.body.user}}, {mail: {$eq: req.body.email}}]}, (err, user) => {
        if (err) {
            res.status(500).send('ERR - Error de base de datos');
            return;
        }
        if (user) {
            // User already exists
            if (user.user == req.body.user)
                res.status(409).send('ERR - Usuario ya existente');
            else if (user.mail == req.body.email)
                res.status(409).send('ERR - E-Mail ya utilizado por otro usuario')
            else
                res.status(409).send('ERR - Usuario / E-Mail ya existentes');
            return;
        }
        // bien, generamos un codigo de 6 digitos y enviamos email
        let code = Math.floor(100000 + Math.random() * 900000);
        req.session.code = code;

        res.status(200).send('OK - 2STEP NEEDED');

    });
});
router.post('/register/step2', (req, res) => {
    if (!req.body.code) {
        res.status(400).send('ERR - Faltan campos (codigo)');
        return;
    }
    cryptPassword(req.body.password, (err, hash) => {
        if (err) {
            res.status(500).send('ERR - Error interno de criptografía');
            return;
        }
        // bien, insertar usuario
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
            req.session.user = req.body.user;
            req.session.authtype = 'native';
            req.session.useraudios = [];
            res.status(200).send('OK');
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
});

/**
 * GOOGLE AUTHENTICATION
 */

// Inicializar passport
router.use(passport.initialize());
router.use(passport.session());
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));
// Google Auth
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '***REMOVED***';
const GOOGLE_CLIENT_SECRET = '***REMOVED***';
const appport = normalizePort(process.env.PORT || '3450');
let userprofile;
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
    // todo OJO CAMBIAR A ***REMOVED*** cuando pase a prod
        callbackURL: "http://127.0.0.1:" + appport + "/auth/google/callback"
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
        req.session.user = userprofile.name.givenName;
        req.session.email = userprofile.emails[0].value;
        req.session.authtype = userprofile.provider;
        res.redirect('/');
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