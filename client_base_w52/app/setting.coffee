Setting =
  initialize: ->

    Backbone.AUCNET.CONST =
      # WS_DAT_URI: 'http://santol.aucmint.com:3010'
      # WS_IMG_URI: 'http://santol.aucmint.com:3011'
      # WS_DAT_URI: 'http://baku.aucmint.com:3010'
      # WS_IMG_URI: 'http://baku.aucmint.com:3011'
      WS_DAT_URI: 'https://haze.aucmint.com'
      WS_IMG_URI: 'https://haze.aucmint.com'

    Backbone.AUCNET.SOCKETIO_OPTION =
      reconnect : false
      'force new connection' : true

    # Freeze the object
    Object.freeze? this

module.exports = Setting
