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

Template.photos.helpers({
  photos: function () {
    return Session.get('photos');
  }
})

Accounts.onLogin(function() {
  // Meteor.call('getInstagramMedia', function(error, results) {
  //   console.log('Instagram response', results.data)
  //   Session.set('photos', results.data.data);
  // });
  Router.go('dates');
});
