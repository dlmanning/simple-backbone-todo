define(function (require) {
  var Backbone = require('backbone');
  var TodoView = require('views/todo');

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
      if (event.charCode === 13 && this.$newTodo.val() != '') this.addNewTodo();
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

  return TodosView;
});
