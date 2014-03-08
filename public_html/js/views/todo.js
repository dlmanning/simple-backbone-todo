define(function (require) {
  var Backbone = require('backbone');

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

  return TodoView;

});
