Template.layout.events({
  'click .logout': function (event) {
    Meteor.logout();
    Router.go('login');
  }
})

Template.login.events({
  'click button.login': function (event) {
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
  months: [
    [{val: 1, name: 'Jan.'}, {val: 2, name: 'Feb.'}, {val: 3, name: 'March'}],
    [{val: 4, name: 'April'}, {val: 5, name: 'May'}, {val: 6, name: 'June'}],
    [{val: 7, name: 'July'}, {val: 8, name: 'Aug.'}, {val: 9, name: 'Sept.'}],
    [{val: 10, name: 'Oct.'}, {val: 11, name: 'Nov.'}, {val: 12, name: 'Dec.'}],
  ],
  years: _.range(2012, 2016)
})

Template.photos.events({
  'click button.pixelate': function (event) {
    _.each(Session.get('photos'), function(x) {
      $('#img-'+x.id).hide()
      Effects.pixelate(x.id);
      $('#canvas-'+x.id).show()
    })
  }
})

Template.photos.helpers({
  photos: function () {
    return Session.get('photos');
  }
})

Template.photo.helpers({
  date: function () {
    var d = new Date(parseInt(this.created_time) * 1000);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  },
  proxy: function (url) {
    return url.replace('https://scontent.cdninstagram.com', '/imgproxy?url=')
  }
})

Accounts.onLogin(function() {
  Router.go('dates');
});
