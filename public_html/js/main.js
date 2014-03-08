requirejs.config({
  baseUrl: '/js',
  paths: {
    'backbone': 'lib/backbone',
    'underscore': 'lib/underscore',
    'jquery': 'lib/jquery'
  }
});

define(function (require) {

  var Todos = require('collections/todos');
  var TodosView = require('views/todos');
  var $ = require('jquery');

  $(function () {

    var app = {};
    window.app = app;

    var todos = new Todos();

    $.get('api/todos', function (data) {
      todos.reset(data);
    }).done(function () {
      var todosView = new TodosView({collection: todos});
    });

    app.todos = todos;

  });

})
