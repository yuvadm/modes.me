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

Template.dates.events({
  'submit form.dates': function (event) {
    var month = $('input[name=monthOptions]:checked').val();
    var year = $('input[name=yearOptions]:checked').val();
    if (month !== undefined && year !== undefined) {
      Meteor.call('getInstagramMedia', +year, +month, function(error, results) {
        console.log('Instagram response', results.data)
        Session.set('photos', results.data.data);
      });
      Router.go('photos');
    }
    return false;
  }
})

Template.dates.helpers({
  months: _.range(1, 13),
  years: _.range(2012, 2016)
})

Template.photos.events({
  'click button.pixelate': function (event) {
    _.each(Session.get('photos'), function(x) {
      Effects.pixelate(x.id);
    })
  }
})

Template.photos.helpers({
  photos: function () {
    return Session.get('photos');
  }
})

Accounts.onLogin(function() {
  Router.go('dates');
});
