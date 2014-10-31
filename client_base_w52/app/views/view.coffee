# Base class for all views.
module.exports = class View extends Backbone.View

  template: ->
    return

  getRenderData: ->
    return

  render:  ->
    @beforeRender()
    @$el.html @template @getRenderData()
    @afterRender()
    this

  beforeRender : ->
    return

  afterRender: ->
    return

  showMsgBox: (message) ->
    alert message
