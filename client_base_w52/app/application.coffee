# The application bootstrapper.
Application =
  initialize: ->

    # モデルクラス
    SelectModel    = require 'models/select_model'

    # ビュークラス
    SelectPageView = require 'views/select_page_view'

    # Router
    Router = require 'lib/router'

    # モデルの保存
    Backbone.AUCNET.index = new SelectModel()

    # Ideally, initialized classes should be kept in controllers & mediator.
    # If you're making big webapp, here's more sophisticated skeleton
    # https://github.com/paulmillr/brunch-with-chaplin
    @SelectPageView   = new SelectPageView()

    # Instantiate the router
    @router = new Router()

    # Freeze the object
    Object.freeze? this

module.exports = Application
