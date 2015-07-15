$(document).ready(function () {
  if (window.location.pathname == '/') {
    var i = 0;
    setInterval(function() {
      $('img.home-logo').attr('src', '/img/icons/1_' + ((++i%5)+1) + '.gif');
    }, 2000);
  }
});

function prepareDates() {
  var month = $('input[name=month]').val();
  var year = $('input[name=year]').val();
  if (month !== undefined && year !== undefined) {
    Meteor.call('getInstagramMedia', +("20"+year), +month, function(error, results) {
      // console.log('Instagram response', results.data);
      if (results.data.data.length > 0) {
        var photos = _.sortBy(results.data.data, function(p) {
          return p.created_time;
        });

        Session.set('date', { month: month, year: year });
        Session.set('photos', photos);

        Meteor.call('getInstagramUsername', function (err, res) {
          Session.set('username', res);
        });

        $('form.dates div.error').hide();
        $('form.dates button.next').show();
      }
      else {
        $('form.dates button.next').hide();
        $('form.dates div.error').show();
      }
    });
  }
}

function animate() {
  var delay = 0;

  $('img.logo').attr('src', '/img/logo_anim.gif');

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

    Session.set('dominant1hex', palette[0][0].toString(16).toUpperCase() + palette[0][1].toString(16).toUpperCase() + palette[0][2].toString(16).toUpperCase());
    Session.set('dominant2hex', palette[1][0].toString(16).toUpperCase() + palette[1][1].toString(16).toUpperCase() + palette[1][2].toString(16).toUpperCase());

    $('img.logo').attr('src', '/img/logo.jpg');

    $('div.dominants').show();
  }, delay + 2000);
}

function animate2() {
  var delay = 0;
  var photos = $('div.photo');

  $('img.logo').attr('src', '/img/logo_anim.gif');

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
    var matrix = Effects.drawFinalIcon();
    Session.set('final_matrix', matrix);
  }, delay + 2000);

  delay += 400 * photos.length;
  delay += 2000;

  var canvas = document.getElementById('canvas-final');
  var dataUrl = canvas.toDataURL();
  $('a.share-save').attr('href', dataUrl);
  $('a.share-save').attr('download', new Date().getTime());

  _.delay(function() {
    $('h2.title').html('Done!<div class="sec">This is your icon!</div>');
    $('span.final-username').text(Session.get('username'));
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $('span.final-date').text(months[Session.get('date').month-1] + ' ' + Session.get('date').year);
    $('div.final div.final-dominants').hide();

    $('img.logo').attr('src', '/img/logo.jpg');

    $('div.final-userdate').show();
    $('div.final div.share').show();
    $('div.about-link').show();
  }, delay + 2000);

}

Template.layout.events({
  'click .logout': function (event) {
    Meteor.logout();
    $('div.header img.profile').attr('src', 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg');
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

Template.layout.events({
  'click a.logout': function (event) {
    $('body').append('<div style="display:none;"><iframe src="https://instagram.com/accounts/logout"></iframe></div>');
    Meteor.logout();
    _.delay(function () {
      Router.go('login');
    }, 500);
  }
})

Template.dates.events({
  'scroll .month-wrapper': function (e) {
    var elements = $('.month-wrapper').find('.month').length;
    var totalheight = $('.month-wrapper').css('height').replace('px','') * elements;
    var elementheight = totalheight/elements;
    var offset = e.target.scrollTop;
    var distance;

    lastclosest = 9999;
    lastclosestelement = 0;
    for (i=0;i<elements;i++) {
      distance = Math.abs(offset - (i * elementheight));
      if (distance < lastclosest) {
        lastclosest = distance;
        lastclosestelement = i;
      }
    }

    if (window.datesTimeout !== undefined)
      clearTimeout(window.datesTimeout);
    window.datesTimeout = setTimeout(function(){
      $('.month-wrapper').animate({ scrollTop: lastclosestelement * elementheight+"px"});
      $('#month').val($('.month').eq(lastclosestelement).html());
      prepareDates();
    }, 200);

    lastOffsetMonth = e.target.scrollTop;
  },
  'scroll .year-wrapper': function (e) {
    var elements = $('.year-wrapper').find('.year').length;
    var totalheight = $('.year-wrapper').css('height').replace('px','') * elements;
    var elementheight = totalheight/elements;
    var offset = e.target.scrollTop;
    var distance;

    lastclosest = 9999;
    lastclosestelement = 0;
    for (i=0;i<elements;i++) {
      distance = Math.abs(offset - (i * elementheight));
      if (distance < lastclosest) {
        lastclosest = distance;
        lastclosestelement = i;
      }
    }

    if (window.datesTimeout !== undefined)
      clearTimeout(window.datesTimeout);
    window.datesTimeout = setTimeout(function(){
      $('.year-wrapper').animate({ scrollTop: lastclosestelement * elementheight+"px" });
      $('#year').val($('.year').eq(lastclosestelement).html());
      prepareDates();
    }, 200);

    lastOffsetYear = e.target.scrollTop;
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
    {val: 1, name: 'January'}, {val: 2, name: 'February'}, {val: 3, name: 'March'}, {val: 4, name: 'April'},
    {val: 5, name: 'May'}, {val: 6, name: 'June'}, {val: 7, name: 'July'}, {val: 8, name: 'August'},
    {val: 9, name: 'September'}, {val: 10, name: 'October'}, {val: 11, name: 'November'}, {val: 12, name: 'December'},
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
    return false;
  },
  'click button.share-facebook': function (event) {
    return false;
  },
  'click button.share-print': function (event) {
    var date = Session.get('date');
    var printStr = date.month < 10 ? '0' + date.month : date.month;
    printStr += date.year + '|';

    var d1 = Session.get('dominant1hex');
    var d2 = Session.get('dominant2hex');

    printStr += d1;
    printStr += d2 + '|';

    var bin2hex = function(b) {
      return _.map(
        _.groupBy(b, function(e, i){
          return Math.floor(i/4);
        }), function (g) {
          return parseInt(g.join(''), 2).toString(16);
        }
      ).join('');
    }

    var matrix = Session.get('final_matrix');
    var code = _.map(matrix, function (col) {
      var hex = _.map(col, function (c) {
        return Math.round(c*256).toString(16).toUpperCase();
      }).join('');
      if (hex == d1) { return '0'; }
      if (hex == d2) { return '1'; }
      else {
        console.log('error', hex, d1, d2);
      }
    });

    printStr += bin2hex([1,1,1].concat(code));  // add three high bits for padding

    Meteor.call('printFinalImage', printStr);
    return false;
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
});

Accounts.onLogin(function() {
  Meteor.call('getInstagramProfilePhoto', function(error, res) {
    $('img.profile').attr('src', res);
  });
  if (Router.current().route.getName() == 'login') {
    Router.go('dates');
  }
});
