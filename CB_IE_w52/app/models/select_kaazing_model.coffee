KaazingWsModel = require 'models/kaazing_ws_model'

module.exports = class SelectKaazingModel extends KaazingWsModel

  constructor: ->
    super()

  emitRank: =>
    @log @
    json = {}
    @sendRankingMessage 'reqRanking',json

  emitUpdateRank: (json)=>
    @sendRankingMessage 'reqUpdateRanking',json

  getMessage: (body) =>
    try
      json = JSON.parse(body)
#      @log json
      @trigger json.name, json.args
    catch error
      @errorlog error

  emitSearch:(d) ->
    @sendSearchMessage 'reqSearch',d

  emitRead:(d) ->
    @sendReadMessage 'reqRead',d

  emitBodyTypeNum:(d) ->
    @sendSearchMessage 'reqBodyTypeNum',d
