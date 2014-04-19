define(function (require) {
  var Backbone = require('backbone');
  var template = require('hbs!templates/todo-item');

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
      this.$el.html(template(this.model.attributes));

      return this;
    },

    toggleDone: function () {
      this.model.set('done', !this.model.get('done'));
      this.model.save();
    }

  });

  return TodoView;

});
