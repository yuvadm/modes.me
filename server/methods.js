Meteor.methods({
  getInstagramMedia: function () {
    this.unblock();
    return Meteor.http.call('GET', 'https://api.instagram.com/v1/users/self/media/recent', {
      'params': {
        'access_token': Meteor.user().services.instagram.accessToken
      }
    });
  }
});
