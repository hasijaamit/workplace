application  = require 'application'

module.exports = class Router extends Backbone.Router
  routes:
    ''              : 'select'
    'select'        : 'select'

  index: ->
    @navigate 'index', true

  # 検索画面
  select: ->
    $('body').html application.SelectPageView.render().el