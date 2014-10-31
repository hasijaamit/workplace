Model = require 'models/model'

module.exports = class SelectModel extends Model

  socket_dat: undefined
#  socket_img: undefined

  initialize: ->
    _.bindAll @

  #--------------------------------------------------------
  # ●ソケット定義（gateway）
  #--------------------------------------------------------
  setSocketDat: (socket) ->
    @socket_dat = socket
    #--------------------------------------------------------
    # ●ランクメッセージ受信
    #--------------------------------------------------------
    @socket_dat.on 'resRanking', (d) =>
      data = JSON.parse(d)
      @trigger 'resRanking',data
    #--------------------------------------------------------
    # ●検索メッセージ受信
    #--------------------------------------------------------
    @socket_dat.on 'resRead', (d) =>
      data = JSON.parse(d)
      @trigger 'resRead',data

  #--------------------------------------------------------
  # ●ソケット定義（image）
  #--------------------------------------------------------
  setSocketImg: (socket) ->
#    @socket_img = socket
#    #--------------------------------------------------------
#    # ●イメージ受信
#    #--------------------------------------------------------
#    @socket_img.on 'pushImage', (d) =>
#      data = msgpack.unpack(d)
#      @trigger 'resPushImage',data

  #--------------------------------------------------------
  # ●ランクメッセージ送信
  #--------------------------------------------------------
  emitRank: ->
    json =
    @socket_dat.emit 'reqRanking',json

  #--------------------------------------------------------
  # ●検索メッセージ送信
  #--------------------------------------------------------
  emitSearch:(d) ->
#    d.imgSocketId = @socket_img.socket.sessionid
    d.imgSocketId = "undefined"
    @socket_dat.emit 'reqSearch',d

  #--------------------------------------------------------
  # ●検索メッセージ送信
  #--------------------------------------------------------
  emitRead:(d) ->
#    d.imgSocketId = @socket_img.socket.sessionid
    d.imgSocketId = "undefined"
    @socket_dat.emit 'reqRead',d

  #--------------------------------------------------------
  # ●定期pingメッセージ送信
  #--------------------------------------------------------
  emitPing:(d) ->
    console.log "ping"
    @socket_dat.emit "ping", {}
#    @socket_img.emit "ping", {}
