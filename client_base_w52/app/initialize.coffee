application = require 'application'
setting     = require 'setting'

$ ->
  Backbone.AUCNET ?= {}

  setting.initialize()
  application.initialize()

  Backbone.history.start
    pushState: false

  # サロゲートペア対応
  String.prototype.getFullCharLength = ->
    @length - @split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g).length + 1
