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

//  Views
var TodoView = Backbone.View.extend({

  tagName: 'span',
  className: 'list-group-item lead',

  events: {
    'click button': 'toggleDone'
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function () {
    var todoGlyph = this.model.get('done') ? 'glyphicon-ok' : 'glyphicon-remove';

    var $todoButton = $('<button></button>').addClass('btn btn-default btn-lg');
    var $todoIcon = $('<span></span>').addClass('glyphicon ' + todoGlyph);

    this.$el
      .html(' ' + this.model.get('description'))
      .prepend($todoButton.append($todoIcon));

    return this;
  },

  toggleDone: function () {
    this.model.set('done', !this.model.get('done'));
    this.model.save();
  }

});

var TodosView = Backbone.View.extend({

  el: '#todosapp',

  events: {
    'click #clear-completed' : 'clearCompleted',
    'click #add-new-todo'    : 'addNewTodo',
    'keypress #new-todo'     : 'checkForEnter'
  },

  initialize: function () {
    this.$newTodo = this.$el.find('#new-todo');
    this.$todoBox = this.$el.find('#todobox');

    this.listenTo(this.collection, 'add', this.render);
    this.listenTo(this.collection, 'completedCleared', this.render);

    this.childViews = [];

    this.render();
  },

  render: function () {
    var self = this;

    this.childViews.forEach(function (view) {
      view.remove();
    });
    this.childViews = [];

    this.collection.each(function (todo) {
      var todoView = new TodoView({model: todo});
      self.$todoBox.append(todoView.$el);
      self.childViews.push(todoView);
    });
  },

  checkForEnter: function (event) {
    if (event.charCode === 13) this.addNewTodo();
  },

  addNewTodo: function () {
    var self = this;
    var description = this.$newTodo.val();
    this.$newTodo.val('');

    this.collection
        .create({description: description, done: false}, {wait: true});

  },

  clearCompleted: function () {
    this.collection.clearCompleted();
  }

});

// Model
var Todo = Backbone.Model.extend({

});

// Collection
var Todos = Backbone.Collection.extend({

  url: '/api/todos',
  model: Todo,

  clearCompleted: function () {
    var self = this;
    var completedTodos = [];
    var deleteXHRs = [];

    this.each(function (todo) {
      if (todo.get('done'))
        completedTodos.push(todo);
    });

    completedTodos.forEach(function (todo) {
      deleteXHRs.push(todo.destroy({ wait: true }));
    });

    $.when.apply($, deleteXHRs)
     .done(function () {
       self.trigger('completedCleared');
     });
  }

});
