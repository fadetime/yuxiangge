var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var util = require("../../tool/util");

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'account',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(account, password, done) {
      User.findOne({
        account: account.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, util.code103());
        }
        if (!user.authenticate(password)) {
          return done(null, false, util.code104());
        }
        return done(null, user);
      });
    }
  ));
};