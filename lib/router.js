Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {name: 'login'});
Router.route('/dates', {name: 'dates'});
Router.route('/photos', {name: 'photos'});

Router.route('/about', {name: 'about'});

Router.route('/prints', function () {
  var self = this;
  var res = Prints.find({ ts: { $gt: new Date().getTime() - 60000 } }).fetch()
  self.response.setHeader('Content-Type', 'application/json');
  self.response.write(JSON.stringify(res));
  self.response.end();
}, { where: 'server' });

Router.route('/imgproxy', function () {
  var self = this;
  var url = 'http://scontent.cdninstagram.com' + this.request._parsedUrl.search.match(/url\=[^\&]+/)[0].split('=')[1];
  self.response.setHeader('Content-Type', 'image/jpeg');
  var res = HTTP.call('GET', url, { responseType: 'buffer' });
  self.response.write(res.content);
  self.response.end();
}, { where: 'server' });
