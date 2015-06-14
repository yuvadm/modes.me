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
  reduceColors: function (cols) {
    // console.log('input', cols.slice(0,8));
    var quant = new RgbQuant({
      colors: 2,
      minHueCols: 2
    });
    quant.sample(cols);
    var palette = quant.palette(true);
    console.log('palette', palette);
    var newcolors = quant.reduce(cols);
    return newcolors;
  }
});
