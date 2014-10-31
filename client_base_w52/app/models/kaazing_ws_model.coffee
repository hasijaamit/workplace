Model = require 'models/model'

module.exports = class KaazingWsModel extends Model

  config :
    url: "ws://bakusoku-test.aucmint.com/amqp",
    virtualHost: "kaazing",
    user: "kaazing",
    pwd: "nigirizushi_k1a2a3z4i5n6g=*gnizaak=*kaazing",

#    url: "ws://192.168.33.10:8001/amqp",
#    virtualHost: "/kaazing",
#    user: "kaazing",
#    pwd: "kaazing",

    appId: "bakusoku-search",
    routingKey: 'rk',
    myConsumerTag: (() ->
      uuid.v4();
    )(),
    correlationId: (() ->
      uuid.v4();
    )(),
    noAck: true,
    res_queue:
      queue:  (() ->
        "baku_user_queue_" + uuid.v4().split("-").join("");
      )(),
      passive: false,
      durable: false,
      exclusive: false,
      autoDelete: true,
      noWait: false,
      args: null
    res_exchange:
      exchange: 'baku_announce_exchange',
      type: 'topic',
      passive: false,
      durable: true,
      noWait: false,
      args: null
    req_queue:
      queue: "baku_ranking_queue",
      passive: false,
      durable: true,
      exclusive: false,
      autoDelete: false,
      noWait: false,
      args: null
    req_exchange:
      exchange: 'baku_ranking_exchange',
      type: 'direct',
      passive: false,
      durable: true,
      noWait: false,
      args: null
    req_search_queue:
      queue: "baku_search_queue",
      passive: false,
      durable: true,
      exclusive: false,
      autoDelete: false,
      noWait: false,
      args: null
    req_read_queue:
      queue: "baku_read_queue",
      passive: false,
      durable: true,
      exclusive: false,
      autoDelete: false,
      noWait: false,
      args: null
    req_search_read_exchange:
      exchange: 'baku_search_read_exchange',
      type: 'topic',
      passive: false,
      durable: true,
      noWait: false,
      args: null

  constructor: ->
    @publishRankingChannel = null
    @publishSearchReadChannel = null
    @consumeChannel = null

  connect: =>
    @amqpClient = new AmqpClient();
    @amqpClient.connect({
      url: @config.url,
      virtualHost: @config.virtualHost,
      credentials:{
        username: @config.user,
        password: @config.pwd
      }
    }, @openHandler);
    @amqpClient.addEventListener "error", @amqpclientOnerrorHandler
    @amqpClient.addEventListener "close", @amqpclientOncloseHandler

  amqpclientOncloseHandler: =>
    @log "amqpClient close handler."
    setTimeout(@connect, 5000)

  amqpclientOnerrorHandler: =>
    @log "amqpClient error handler."

  openHandler: =>
    @log("OPEN: publish channel for ranking");
    @publishRankingChannel = @amqpClient.openChannel(@publishRankingChannelOpenHandler);
    @log("OPEN: publish channel for search/read");
    @publishSearchReadChannel = @amqpClient.openChannel(@publishSearchReadChannelOpenHandler);
    @log("OPEN: consume channel");
    @consumeChannel = @amqpClient.openChannel(@consumeChannelOpenHandler);

  publishRankingChannelOpenHandler: ()=>
    @log("* OPENED: publish channel for ranking");

    @publishRankingChannel.addEventListener "close", () =>
      @log("* CHANNEL CLOSED: publish channel for ranking");

    @publishRankingChannel.declareExchange(
      @config.req_exchange,
      @declareReqExchangeHandler
    )

  publishSearchReadChannelOpenHandler: ()=>
    @log("* OPENED: publish channel for search/read");

    @publishSearchReadChannel.addEventListener "close", () =>
      @log("* CHANNEL CLOSED: publish channel for search/read");

    @publishSearchReadChannel.declareExchange(
      @config.req_search_read_exchange,
      @declareReqSearchReadExchangeHandler
    )

  consumeChannelOpenHandler: ()=>
    @log("* OPENED: consume channel");

    @consumeChannel.addEventListener "consume",() =>
      @log("* CONSUME: " + @config.res_queue.queue)

    @consumeChannel.addEventListener "flow", (e) =>
      @log("* FLOW: " + (e.args.active ? "ON" : "OFF"))

    @consumeChannel.addEventListener "close", () =>
      @log("* CHANNEL CLOSED: consume channel")

    @publishRankingChannel.declareExchange(
      @config.res_exchange,
      @declareResExchangeHandler
    )

    @consumeChannel.addEventListener("message", @messageHandler)

  declareResExchangeHandler: () =>
    @log("* Declared exchange. :" + @config.res_exchange.exchange);
    @consumeChannel.declareQueue(@config.res_queue, @declareResQueueHandler)

  declareReqExchangeHandler: () =>
    @log("* Declared exchange. :" + @config.req_exchange.exchange);
#    @consumeChannel.declareQueue(@config.req_queue, @declareReqQueueHandler)

  declareReqSearchReadExchangeHandler: () =>
    @log("* Declared exchange. :" + @config.req_search_read_exchange.exchange);
#    @publishSearchReadChannel.declareQueue(@config.req_search_queue, @declareReqSearchQueueHandler)

  declareResQueueHandler: () =>
    @log("* Declared queue. :" + @config.res_queue.queue);
    @consumeChannel.bindQueue({
      queue: @config.res_queue.queue,
      exchange: @config.res_exchange.exchange,
      routingKey: @config.res_queue.queue,
    }, @bindResQueueHandler);
    @consumeChannel.bindQueue({
      queue: @config.res_queue.queue,
      exchange: @config.res_exchange.exchange,
      routingKey: "all",
    }, @noop);

  declareReqQueueHandler: () =>
    @log("* Declared queue. :" + @config.req_queue.queue);
    @consumeChannel.bindQueue({
      queue: @config.req_queue.queue,
      exchange: @config.req_exchange.exchange,
      routingKey: @config.routingKey,
    }, @bindReqQueueHandler);

  declareReqSearchQueueHandler: () =>
    @log("* Declared queue. :" + @config.req_search_queue.queue);
    @publishSearchReadChannel.declareQueue(@config.req_read_queue, @declareReqReadQueueHandler)

  declareReqReadQueueHandler: () =>
    @log("* Declared queue. :" + @config.req_read_queue.queue);
    @publishSearchReadChannel.bindQueue({
      queue: @config.req_search_queue.queue,
      exchange: @config.req_search_read_exchange.exchange,
      routingKey: "search",
    }, @noop);
    @publishSearchReadChannel.bindQueue({
      queue: @config.req_read_queue.queue,
      exchange: @config.req_search_read_exchange.exchange,
      routingKey: "read",
    }, @noop);

  bindResQueueHandler: () =>
    @log("* Response Bind queue.");
    @log("* QUEUE BOUND: " + @config.res_exchange.exchange + " - " + @config.res_queue.queue);
    @consume()

  bindReqQueueHandler: () =>
    @log("* Request Bind queue.");
    @log("* QUEUE BOUND: " + @config.req_exchange.exchange + " - " + @config.req_queue.queue);

  consume: () =>
    @consumeChannel.consumeBasic(
      {
        queue: @config.res_queue.queue,
        consumerTag: @config.myConsumerTag,
        noAck: @config.noAck
      }
    )

  messageHandler: (m) =>
    body = m.body.getString(Charset.UTF8);
#    @log("* MESSAGE :" + body);
    @getMessage body

  getMessage: (body) =>
    @errorlog("Please implement this function at own module.")

  sendRankingMessage : (messagekey, message) =>
#    @log("* Message publish: " + messagekey );
#    @log(message)

    sendData =
      name: messagekey
      args: message
    jsonstring = JSON.stringify(sendData)

    body = new ByteBuffer();
    body.putString(jsonstring, Charset.UTF8);
    body.flip();

    props = new AmqpProperties();
    props.setCorrelationId(@config.correlationId);
    props.setAppId(@appId);
    props.setReplyTo(@config.res_queue.queue)
    props.setContentType("application/json");
    props.setContentEncoding("UTF-8");
    props.setTimestamp(new Date());

    @publishRankingChannel.publishBasic(
      {
        body: body,
        properties: props,
        exchange: @config.req_exchange.exchange,
        routingKey: @config.routingKey
      }
    )

  sendSearchMessage : (messagekey, message) =>
    @sendSearchReadMessage(messagekey, "search", message)
  sendReadMessage : (messagekey, message) =>
    @sendSearchReadMessage(messagekey, "read", message)

  sendSearchReadMessage : (messagekey, routingKey, message) =>
    if @publishSearchReadChannel is null
      @errorlog "search/read channgel is currently disabled."
      return
#    @log("* Message publish: " + messagekey );
#    @log(message)

    sendData =
      name: messagekey
      args: message
    jsonstring = JSON.stringify(sendData)

    body = new ByteBuffer();
    body.putString(jsonstring, Charset.UTF8);
    body.flip();

    props = new AmqpProperties();
    props.setCorrelationId(@config.correlationId);
    props.setAppId(@appId);
    props.setReplyTo(@config.res_queue.queue)
    props.setContentType("application/json");
    props.setContentEncoding("UTF-8");
    props.setTimestamp(new Date());

    @publishSearchReadChannel.publishBasic(
      {
        body: body,
        properties: props,
        exchange: @config.req_search_read_exchange.exchange,
        routingKey: routingKey
      }
    )

  noop: =>

  log: (message)=>
    console.log(message)
  errorlog: (message)=>
    console.error(message)

