function animate() {
  var delay = 0;

  // load
  $('li#step1').addClass('active');
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
    $('li#step1').removeClass('active');
    $('li#step2').addClass('active');
    _.each(Session.get('photos'), function(x, i) {
      _.delay(function() {
        Effects.pixelate(x.id);
        $('#img-'+x.id).hide();
        $('#canvas-'+x.id).show();
      }, 400 * i);
    });
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  // colorize
  _.delay(function() {
    $('li#step2').removeClass('active');
    $('li#step3').addClass('active');
    _.each(Session.get('photos'), function(x, i) {
      _.delay(function () {
        Effects.colorize(x.id);
        $('#img-'+x.id).hide();
        $('#canvas-'+x.id).show();
      }, 400 * i);
    });
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  _.delay(function() {
    $('li#step3').removeClass('active');
    $('li#step4').addClass('active');
    $('div.photos').hide();

    var palette = Effects.average();

    $('div#dominant1').css('background', 'rgba(' + palette[0][0] + ',' + palette[0][1] + ',' + palette[0][2] + ',1)');
    $('div#dominant2').css('background', 'rgba(' + palette[1][0] + ',' + palette[1][1] + ',' + palette[1][2] + ',1)');

    $('ol#dominant1 li.r').text('R-' + palette[0][0].toString(16).toUpperCase());
    $('ol#dominant1 li.g').text('G-' + palette[0][1].toString(16).toUpperCase());
    $('ol#dominant1 li.b').text('B-' + palette[0][2].toString(16).toUpperCase());

    $('ol#dominant2 li.r').text('R-' + palette[1][0].toString(16).toUpperCase());
    $('ol#dominant2 li.g').text('G-' + palette[1][1].toString(16).toUpperCase());
    $('ol#dominant2 li.b').text('B-' + palette[1][2].toString(16).toUpperCase());

    $('div.dominants').show();
  }, delay + 2000);
}

function animate2() {
  var delay = 0;
  var photos = $('div.photo');

  _.delay(function() {
    $('li#step4').removeClass('active');
    $('li#step5').addClass('active');
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
    $('li#step5').removeClass('active');
    $('li#step6').addClass('active');
    $('div.photos').hide();
    $('div.final').show();

    Effects.drawFinal();
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  _.delay(function() {
    Effects.drawFinalIcon();
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  _.delay(function() {
    $('h2.title').html('Done!<div class="sec">This is your icon!</div>');
    $('div.final div.final-dominants').hide();
    $('div.final div.share').show();
    $('div.about-link').show();
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
  'click input.monthOptions, click input.yearOptions': function (event) {
    var month = $('input[name=monthOptions]:checked').val();
    var year = $('input[name=yearOptions]:checked').val();
    if (month !== undefined && year !== undefined) {
      Meteor.call('getInstagramMedia', +year, +month, function(error, results) {
        console.log('Instagram response', results.data);
        if (results.data.data.length > 0) {
          var photos = _.sortBy(results.data.data, function(p) {
            return p.created_time;
          });
          Session.set('photos', photos);
          $('form.dates div.error').hide();
          $('form.dates button.dates').show();
        }
        else {
          $('form.dates button.dates').hide();
          $('form.dates div.error').show();
        }
      });
    }
  },
  'submit form.dates': function (event) {
    $('div.about-link').hide();
    Router.go('photos');
    _.delay(animate, 2000);
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
      Effects.pixelate(x.id);
      $('#img-'+x.id).hide();
      $('#canvas-'+x.id).show();
    })
  },
  'click button.color': function (event) {
    _.each(Session.get('photos'), function(x) {
      Effects.colorize(x.id);
      $('#img-'+x.id).hide();
      $('#canvas-'+x.id).show();
    })
  },
  'click button.average': function (event) {
    Effects.average();
  },
  'click button.continue': function (event) {
    animate2();
    return false;
  },
  'click button.share-instagram': function (event) {
    window.print();
  },
  'click button.share-facebook': function (event) {
    window.print();
  },
  'click button.share-save': function (event) {
    window.print();
  },
  'click button.share-print': function (event) {
    window.print();
  },
  'click button.logout': function (event) {
    $('body').append('<div style="display:none;"><iframe src="https://instagram.com/accounts/logout"></iframe></div>');
    Meteor.logout();
    _.delay(function () {
      Router.go('login');
    }, 500);
  }
})

Template.photos.helpers({
  steps: function () {
    return [
      {val: 1, name: 'Original'},
      {val: 2, name: 'Pixelate'},
      {val: 3, name: 'Composition'},
      {val: 4, name: 'Dominant Color'},
      {val: 5, name: 'Average'},
      {val: 6, name: 'Summarize'}
    ]
  },
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
    return url.replace('https://scontent.cdninstagram.com', '/imgproxy?url=');
  }
})

Template.about.events({
  'click button.start-over': function (event) {
    if (Meteor.userId()) {
      Router.go('dates');
    }
    else {
      Router.go('login');
    }
  },
  'click button.logout': function (event) {
    $('body').append('<div style="display:none;"><iframe src="https://instagram.com/accounts/logout"></iframe></div>');
    Meteor.logout();
    _.delay(function () {
      Router.go('login');
    }, 500);
  }
})

Accounts.onLogin(function() {
  Meteor.call('getInstagramProfilePhoto', function(error, res) {
    console.log(res);
    $('img.profile').attr('src', res);
  });
  if (Router.current().route.getName() == 'login') {
    Router.go('dates');
  }
});
