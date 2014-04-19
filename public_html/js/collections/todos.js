define(function (require) {

  var Backbone = require('backbone');
  var Todo = require('models/todo');

  var Todos = Backbone.Collection.extend({

    url: '/api/todos',
    model: Todo,

    comparator: function (a, b) {
      if (a.id < b.id)
        return 1;
      else if (a.id === b.id)
        return 0;
      else 
        return -1;
    },

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

  return Todos;

});
