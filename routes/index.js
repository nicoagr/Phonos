var express = require('express');
var router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://***REMOVED***@***REMOVED***:27017/phonos?authSource=admin', ['users']);

/* GET home page. */
router.get('/', function(req, res) {
  let user;
  if (req.session.user) {
    user = {}
    user.user = req.session.user;
    user.mail = req.session.mail;
  }
  res.render('index', {"user": user, share: false});
});

// Para audios compartidos
router.get('/share/:fileID', (req, res) => {
  const audioId = req.params.fileID;
  db.users.findOne(
      {'audios.id': parseFloat(audioId)},
      (err, user) => {
        if (err) {
          res.status(500).send('ERR - Db Error fetching audio.');
        } else {
          if (user != null && user.audios != null && user.audios.length > 0) {
            res.render('index', {"user": user, share: true});
          } else {
            res.status(404).send('ERR - Audio no encontrado.');
          }
        }
      }
  );

})

module.exports = router;
