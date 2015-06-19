function animate() {
  var delay = 0;

  // load
  var photos = $('div.photo');
  photos.each(function(i) {
    var self = this;
    _.delay(function () {
      $(self).show();
    }, 400 * i);
  });

  delay += 400 * photos.length;

  // pixelate
  _.delay(function () {
    $('h4.step').text('(Step 2)');
    _.each(Session.get('photos'), function(x, i) {
      _.delay(function() {
        $('#img-'+x.id).hide()
        Effects.pixelate(x.id);
        $('#canvas-'+x.id).show()
      }, 400 * i);
    });
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  // colorize
  _.delay(function() {
    $('h4.step').text('(Step 3)');
    _.each(Session.get('photos'), function(x, i) {
      _.delay(function () {
        $('#img-'+x.id).hide()
        Effects.colorize(x.id);
        $('#canvas-'+x.id).show()
      }, 400 * i);
    });
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  _.delay(function() {
    $('h4.step').text('(Step 4)');
    $('div.photos').hide();

    var palette = Effects.average();

    $('div#dominant1').css('background', 'rgba(' + palette[0][0] + ',' + palette[0][1] + ',' + palette[0][2] + ',1)');
    $('div#dominant2').css('background', 'rgba(' + palette[1][0] + ',' + palette[1][1] + ',' + palette[1][2] + ',1)');

    $('div#dominant1').siblings('h5').text('#'
      + palette[0][0].toString(16).toUpperCase()
      + palette[0][1].toString(16).toUpperCase()
      + palette[0][2].toString(16).toUpperCase()
    )
    $('div#dominant2').siblings('h5').text('#'
      + palette[1][0].toString(16).toUpperCase()
      + palette[1][1].toString(16).toUpperCase()
      + palette[1][2].toString(16).toUpperCase()
    )

    $('div.dominants').show();
  }, delay + 2000);

  delay += 2000;

  _.delay(function() {
    $('div.dominants').hide();
    $('div.photos').show();
    _.each(Session.get('photos'), function(x, i) {
      _.delay(function () {
        Effects.averageColor(x.id);
      }, 400 * i);
    });
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  _.delay(function() {
    $('h4.step').text('(Step 5)');
    $('div.photos').hide();
    $('div.final').show()

    Effects.drawFinal();
  }, delay + 2000);
}

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
      _.delay(animate, 2000);
    }
    return false;
  }
})

Template.dates.helpers({
  months: [
    [{val: 1, name: 'January'}, {val: 2, name: 'February'}, {val: 3, name: 'March'}, {val: 4, name: 'April'}],
    [{val: 5, name: 'May'}, {val: 6, name: 'June'}, {val: 7, name: 'July'}, {val: 8, name: 'August'}],
    [{val: 9, name: 'September'}, {val: 10, name: 'October'}, {val: 11, name: 'November'}, {val: 12, name: 'December'}],
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
  },
  'click button.color': function (event) {
    _.each(Session.get('photos'), function(x) {
      $('#img-'+x.id).hide()
      Effects.colorize(x.id);
      $('#canvas-'+x.id).show()
    })
  },
  'click button.average': function (event) {
    Effects.average();
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
    return d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
  },
  proxy: function (url) {
    return url.replace('https://scontent.cdninstagram.com', '/imgproxy?url=')
  }
})

Accounts.onLogin(function() {
  Router.go('dates');
});
