Prints = new Mongo.Collection('prints');

Meteor.methods({
  getInstagramMedia: function (year, month) {
    this.unblock();
    return HTTP.get('https://api.instagram.com/v1/users/self/media/recent', {
      'params': {
        'access_token': Meteor.user().services.instagram.accessToken,
        'min_timestamp': Math.round(Date.UTC(month==1?year-1:year, month==1?12:month-1) / 1000),
        'max_timestamp': Math.round(Date.UTC(year, month) / 1000),
      }
    });
  },
  getInstagramUsername: function () {
    return Meteor.user().services.instagram.username;
  },
  getInstagramProfilePhoto: function () {
    return Meteor.user().services.instagram.profile_picture;
  },
  printFinalImage: function (code) {
    if (Meteor.userId()) {
      var username = Meteor.user().services.instagram.username;
      var data = username + '|' + code;
      Prints.insert({
        data: data,
        ip: this.connection.clientAddress,
        ts: new Date().getTime()
      })
    }
  }
});
