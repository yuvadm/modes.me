Template.layout.events({
  'click .logout': function (event) {
    Meteor.logout();
    Router.go('login');
  }
})

Template.login.events({
  'click .login-instagram': function (event) {
    Meteor.loginWithInstagram({}, function (err) {
      if (err)
        Session.set('errorMessage', err.reason || 'Unknown error');
    });
    return false;
  }
});

Accounts.onLogin(function() {
  Router.go('one');
});
