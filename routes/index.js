var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  let user;
  if (req.session.user) {
    user = {}
    user.user = req.session.user;
    user.mail = req.session.mail;
  }
  res.render('index', {"user": user});
});

module.exports = router;
