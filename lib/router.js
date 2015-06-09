Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {name: 'login'});
Router.route('/one', {name: 'one'});
Router.route('/two', {name: 'two'});
