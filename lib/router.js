Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {name: 'login'});
Router.route('/dates', {name: 'dates'});
Router.route('/photos', {name: 'photos'});
