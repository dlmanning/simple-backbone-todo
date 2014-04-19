requirejs.config({
  baseUrl: '/js',
  paths: {
    'backbone': 'lib/backbone',
    'underscore': 'lib/underscore',
    'jquery': 'lib/jquery',
    'hbs': 'lib/require-handlebars-plugin/hbs',
    'templates': '../templates'
  }
});

define(function (require) {

  var Todos = require('collections/todos');
  var TodosView = require('views/todos');
  var $ = require('jquery');

  $(function () {

    var app = {};
    window.app = app;

    var todos;

    $.get('api/todos', function (data) {
      todos = new Todos(data)
    }).done(function () {
      var router = new Router();
      var todosView = new TodosView({collection: todos});
      todosView.listenTo(router, 'route:showComplete', todosView.showComplete);
      todosView.listenTo(router, 'route:showIncomplete', todosView.showIncomplete);
      todosView.listenTo(router, 'route:showAll', todosView.showAll);
      app.todosView = todosView;
      Backbone.history.start();
    });

    app.todos = todos;

  });

  var Router = Backbone.Router.extend({

    routes: {
      '': 'showAll',
      'complete': 'showComplete',
      'incomplete': 'showIncomplete'
    },

    showAll: function () {
      $('a[href="#"]').parent().addClass('active');
      $('a[href="#complete"]').parent().removeClass('active');
      $('a[href="#incomplete"').parent().removeClass('active');
    },

    showComplete: function () {
      $('a[href="#"]').parent().removeClass('active');
      $('a[href="#complete"]').parent().addClass('active');
      $('a[href="#incomplete"').parent().removeClass('active');
    },

    showIncomplete: function () {
      $('a[href="#"]').parent().removeClass('active');
      $('a[href="#complete"]').parent().removeClass('active');
      $('a[href="#incomplete"]').parent().addClass('active');
    }

  });

});
