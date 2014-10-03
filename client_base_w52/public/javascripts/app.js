(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
(function() {
  var Application;

  Application = {
    initialize: function() {
      var Router, SelectModel, SelectPageView;
      SelectModel = require('models/select_model');
      SelectPageView = require('views/select_page_view');
      Router = require('lib/router');
      Backbone.AUCNET.index = new SelectModel();
      this.SelectPageView = new SelectPageView();
      this.router = new Router();
      return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
    }
  };

  module.exports = Application;

}).call(this);

});

require.register("initialize", function(exports, require, module) {
(function() {
  var application, setting;

  application = require('application');

  setting = require('setting');

  $(function() {
    if (Backbone.AUCNET == null) Backbone.AUCNET = {};
    setting.initialize();
    application.initialize();
    Backbone.history.start({
      pushState: false
    });
    return String.prototype.getFullCharLength = function() {
      return this.length - this.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g).length + 1;
    };
  });

}).call(this);

});

require.register("lib/router", function(exports, require, module) {
(function() {
  var Router, application,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  application = require('application');

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      '': 'select',
      'select': 'select'
    };

    Router.prototype.index = function() {
      return this.navigate('index', true);
    };

    Router.prototype.select = function() {
      return $('body').html(application.SelectPageView.render().el);
    };

    return Router;

  })(Backbone.Router);

}).call(this);

});

require.register("models/kaazing_ws_model", function(exports, require, module) {
(function() {
  var KaazingWsModel, Model,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Model = require('models/model');

  module.exports = KaazingWsModel = (function(_super) {

    __extends(KaazingWsModel, _super);

    KaazingWsModel.prototype.config = {
      url: "ws://bakusoku-test.aucmint.com/amqp",
      virtualHost: "kaazing",
      user: "kaazing",
      pwd: "nigirizushi_k1a2a3z4i5n6g=*gnizaak=*kaazing",
      appId: "bakusoku-search",
      routingKey: 'rk',
      myConsumerTag: (function() {
        return uuid.v4();
      })(),
      correlationId: (function() {
        return uuid.v4();
      })(),
      noAck: true,
      res_queue: {
        queue: (function() {
          return "baku_user_queue_" + uuid.v4().split("-").join("");
        })(),
        passive: false,
        durable: false,
        exclusive: false,
        autoDelete: true,
        noWait: false,
        args: null
      },
      res_exchange: {
        exchange: 'baku_announce_exchange',
        type: 'topic',
        passive: false,
        durable: true,
        noWait: false,
        args: null
      },
      req_queue: {
        queue: "baku_ranking_queue",
        passive: false,
        durable: true,
        exclusive: false,
        autoDelete: false,
        noWait: false,
        args: null
      },
      req_exchange: {
        exchange: 'baku_ranking_exchange',
        type: 'direct',
        passive: false,
        durable: true,
        noWait: false,
        args: null
      },
      req_search_queue: {
        queue: "baku_search_queue",
        passive: false,
        durable: true,
        exclusive: false,
        autoDelete: false,
        noWait: false,
        args: null
      },
      req_read_queue: {
        queue: "baku_read_queue",
        passive: false,
        durable: true,
        exclusive: false,
        autoDelete: false,
        noWait: false,
        args: null
      },
      req_search_read_exchange: {
        exchange: 'baku_search_read_exchange',
        type: 'topic',
        passive: false,
        durable: true,
        noWait: false,
        args: null
      }
    };

    function KaazingWsModel() {
      this.errorlog = __bind(this.errorlog, this);
      this.log = __bind(this.log, this);
      this.noop = __bind(this.noop, this);
      this.sendSearchReadMessage = __bind(this.sendSearchReadMessage, this);
      this.sendReadMessage = __bind(this.sendReadMessage, this);
      this.sendSearchMessage = __bind(this.sendSearchMessage, this);
      this.sendRankingMessage = __bind(this.sendRankingMessage, this);
      this.getMessage = __bind(this.getMessage, this);
      this.messageHandler = __bind(this.messageHandler, this);
      this.consume = __bind(this.consume, this);
      this.bindReqQueueHandler = __bind(this.bindReqQueueHandler, this);
      this.bindResQueueHandler = __bind(this.bindResQueueHandler, this);
      this.declareReqReadQueueHandler = __bind(this.declareReqReadQueueHandler, this);
      this.declareReqSearchQueueHandler = __bind(this.declareReqSearchQueueHandler, this);
      this.declareReqQueueHandler = __bind(this.declareReqQueueHandler, this);
      this.declareResQueueHandler = __bind(this.declareResQueueHandler, this);
      this.declareReqSearchReadExchangeHandler = __bind(this.declareReqSearchReadExchangeHandler, this);
      this.declareReqExchangeHandler = __bind(this.declareReqExchangeHandler, this);
      this.declareResExchangeHandler = __bind(this.declareResExchangeHandler, this);
      this.consumeChannelOpenHandler = __bind(this.consumeChannelOpenHandler, this);
      this.publishSearchReadChannelOpenHandler = __bind(this.publishSearchReadChannelOpenHandler, this);
      this.publishRankingChannelOpenHandler = __bind(this.publishRankingChannelOpenHandler, this);
      this.openHandler = __bind(this.openHandler, this);
      this.amqpclientOnerrorHandler = __bind(this.amqpclientOnerrorHandler, this);
      this.amqpclientOncloseHandler = __bind(this.amqpclientOncloseHandler, this);
      this.connect = __bind(this.connect, this);      this.publishRankingChannel = null;
      this.publishSearchReadChannel = null;
      this.consumeChannel = null;
    }

    KaazingWsModel.prototype.connect = function() {
      this.amqpClient = new AmqpClient();
      this.amqpClient.connect({
        url: this.config.url,
        virtualHost: this.config.virtualHost,
        credentials: {
          username: this.config.user,
          password: this.config.pwd
        }
      }, this.openHandler);
      this.amqpClient.addEventListener("error", this.amqpclientOnerrorHandler);
      return this.amqpClient.addEventListener("close", this.amqpclientOncloseHandler);
    };

    KaazingWsModel.prototype.amqpclientOncloseHandler = function() {
      this.log("amqpClient close handler.");
      return setTimeout(this.connect, 5000);
    };

    KaazingWsModel.prototype.amqpclientOnerrorHandler = function() {
      return this.log("amqpClient error handler.");
    };

    KaazingWsModel.prototype.openHandler = function() {
      this.log("OPEN: publish channel for ranking");
      this.publishRankingChannel = this.amqpClient.openChannel(this.publishRankingChannelOpenHandler);
      this.log("OPEN: publish channel for search/read");
      this.publishSearchReadChannel = this.amqpClient.openChannel(this.publishSearchReadChannelOpenHandler);
      this.log("OPEN: consume channel");
      return this.consumeChannel = this.amqpClient.openChannel(this.consumeChannelOpenHandler);
    };

    KaazingWsModel.prototype.publishRankingChannelOpenHandler = function() {
      var _this = this;
      this.log("* OPENED: publish channel for ranking");
      this.publishRankingChannel.addEventListener("close", function() {
        return _this.log("* CHANNEL CLOSED: publish channel for ranking");
      });
      return this.publishRankingChannel.declareExchange(this.config.req_exchange, this.declareReqExchangeHandler);
    };

    KaazingWsModel.prototype.publishSearchReadChannelOpenHandler = function() {
      var _this = this;
      this.log("* OPENED: publish channel for search/read");
      this.publishSearchReadChannel.addEventListener("close", function() {
        return _this.log("* CHANNEL CLOSED: publish channel for search/read");
      });
      return this.publishSearchReadChannel.declareExchange(this.config.req_search_read_exchange, this.declareReqSearchReadExchangeHandler);
    };

    KaazingWsModel.prototype.consumeChannelOpenHandler = function() {
      var _this = this;
      this.log("* OPENED: consume channel");
      this.consumeChannel.addEventListener("consume", function() {
        return _this.log("* CONSUME: " + _this.config.res_queue.queue);
      });
      this.consumeChannel.addEventListener("flow", function(e) {
        var _ref;
        return _this.log("* FLOW: " + ((_ref = e.args.active) != null ? _ref : {
          "ON": "OFF"
        }));
      });
      this.consumeChannel.addEventListener("close", function() {
        return _this.log("* CHANNEL CLOSED: consume channel");
      });
      this.publishRankingChannel.declareExchange(this.config.res_exchange, this.declareResExchangeHandler);
      return this.consumeChannel.addEventListener("message", this.messageHandler);
    };

    KaazingWsModel.prototype.declareResExchangeHandler = function() {
      this.log("* Declared exchange. :" + this.config.res_exchange.exchange);
      return this.consumeChannel.declareQueue(this.config.res_queue, this.declareResQueueHandler);
    };

    KaazingWsModel.prototype.declareReqExchangeHandler = function() {
      return this.log("* Declared exchange. :" + this.config.req_exchange.exchange);
    };

    KaazingWsModel.prototype.declareReqSearchReadExchangeHandler = function() {
      return this.log("* Declared exchange. :" + this.config.req_search_read_exchange.exchange);
    };

    KaazingWsModel.prototype.declareResQueueHandler = function() {
      this.log("* Declared queue. :" + this.config.res_queue.queue);
      this.consumeChannel.bindQueue({
        queue: this.config.res_queue.queue,
        exchange: this.config.res_exchange.exchange,
        routingKey: this.config.res_queue.queue
      }, this.bindResQueueHandler);
      return this.consumeChannel.bindQueue({
        queue: this.config.res_queue.queue,
        exchange: this.config.res_exchange.exchange,
        routingKey: "all"
      }, this.noop);
    };

    KaazingWsModel.prototype.declareReqQueueHandler = function() {
      this.log("* Declared queue. :" + this.config.req_queue.queue);
      return this.consumeChannel.bindQueue({
        queue: this.config.req_queue.queue,
        exchange: this.config.req_exchange.exchange,
        routingKey: this.config.routingKey
      }, this.bindReqQueueHandler);
    };

    KaazingWsModel.prototype.declareReqSearchQueueHandler = function() {
      this.log("* Declared queue. :" + this.config.req_search_queue.queue);
      return this.publishSearchReadChannel.declareQueue(this.config.req_read_queue, this.declareReqReadQueueHandler);
    };

    KaazingWsModel.prototype.declareReqReadQueueHandler = function() {
      this.log("* Declared queue. :" + this.config.req_read_queue.queue);
      this.publishSearchReadChannel.bindQueue({
        queue: this.config.req_search_queue.queue,
        exchange: this.config.req_search_read_exchange.exchange,
        routingKey: "search"
      }, this.noop);
      return this.publishSearchReadChannel.bindQueue({
        queue: this.config.req_read_queue.queue,
        exchange: this.config.req_search_read_exchange.exchange,
        routingKey: "read"
      }, this.noop);
    };

    KaazingWsModel.prototype.bindResQueueHandler = function() {
      this.log("* Response Bind queue.");
      this.log("* QUEUE BOUND: " + this.config.res_exchange.exchange + " - " + this.config.res_queue.queue);
      return this.consume();
    };

    KaazingWsModel.prototype.bindReqQueueHandler = function() {
      this.log("* Request Bind queue.");
      return this.log("* QUEUE BOUND: " + this.config.req_exchange.exchange + " - " + this.config.req_queue.queue);
    };

    KaazingWsModel.prototype.consume = function() {
      return this.consumeChannel.consumeBasic({
        queue: this.config.res_queue.queue,
        consumerTag: this.config.myConsumerTag,
        noAck: this.config.noAck
      });
    };

    KaazingWsModel.prototype.messageHandler = function(m) {
      var body;
      body = m.body.getString(Charset.UTF8);
      return this.getMessage(body);
    };

    KaazingWsModel.prototype.getMessage = function(body) {
      return this.errorlog("Please implement this function at own module.");
    };

    KaazingWsModel.prototype.sendRankingMessage = function(messagekey, message) {
      var body, jsonstring, props, sendData;
      sendData = {
        name: messagekey,
        args: message
      };
      jsonstring = JSON.stringify(sendData);
      body = new ByteBuffer();
      body.putString(jsonstring, Charset.UTF8);
      body.flip();
      props = new AmqpProperties();
      props.setCorrelationId(this.config.correlationId);
      props.setAppId(this.appId);
      props.setReplyTo(this.config.res_queue.queue);
      props.setContentType("application/json");
      props.setContentEncoding("UTF-8");
      props.setTimestamp(new Date());
      return this.publishRankingChannel.publishBasic({
        body: body,
        properties: props,
        exchange: this.config.req_exchange.exchange,
        routingKey: this.config.routingKey
      });
    };

    KaazingWsModel.prototype.sendSearchMessage = function(messagekey, message) {
      return this.sendSearchReadMessage(messagekey, "search", message);
    };

    KaazingWsModel.prototype.sendReadMessage = function(messagekey, message) {
      return this.sendSearchReadMessage(messagekey, "read", message);
    };

    KaazingWsModel.prototype.sendSearchReadMessage = function(messagekey, routingKey, message) {
      var body, jsonstring, props, sendData;
      if (this.publishSearchReadChannel === null) {
        this.errorlog("search/read channgel is currently disabled.");
        return;
      }
      sendData = {
        name: messagekey,
        args: message
      };
      jsonstring = JSON.stringify(sendData);
      body = new ByteBuffer();
      body.putString(jsonstring, Charset.UTF8);
      body.flip();
      props = new AmqpProperties();
      props.setCorrelationId(this.config.correlationId);
      props.setAppId(this.appId);
      props.setReplyTo(this.config.res_queue.queue);
      props.setContentType("application/json");
      props.setContentEncoding("UTF-8");
      props.setTimestamp(new Date());
      return this.publishSearchReadChannel.publishBasic({
        body: body,
        properties: props,
        exchange: this.config.req_search_read_exchange.exchange,
        routingKey: routingKey
      });
    };

    KaazingWsModel.prototype.noop = function() {};

    KaazingWsModel.prototype.log = function(message) {
      return console.log(message);
    };

    KaazingWsModel.prototype.errorlog = function(message) {
      return console.error(message);
    };

    return KaazingWsModel;

  })(Model);

}).call(this);

});

require.register("models/model", function(exports, require, module) {
(function() {
  var Model,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      Model.__super__.constructor.apply(this, arguments);
    }

    return Model;

  })(Backbone.Model);

}).call(this);

});

require.register("models/select_ajax_model", function(exports, require, module) {
(function() {
  var Model, SelectAjaxModel,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Model = require('models/model');

  module.exports = SelectAjaxModel = (function(_super) {

    __extends(SelectAjaxModel, _super);

    function SelectAjaxModel() {
      SelectAjaxModel.__super__.constructor.apply(this, arguments);
    }

    SelectAjaxModel.prototype.type = null;

    SelectAjaxModel.prototype.value = null;

    SelectAjaxModel.prototype.url = '/2013-01-01/search';

    SelectAjaxModel.prototype.initialize = function() {
      return _.bindAll(this);
    };

    SelectAjaxModel.prototype.buildQueryParams = function(type, value, startIndex, size) {
      if (type === 'all') {
        return {
          q: value,
          start: startIndex,
          size: size
        };
      } else {
        return {
          q: "" + type + ":'" + value + "'",
          start: startIndex,
          size: size,
          'q.parser': 'structured'
        };
      }
    };

    SelectAjaxModel.prototype.convertJSONFormat = function(json, messageName, pageNo) {
      var convert2YYYYMM, dataConverted, dataConvertedObject, k, key, maxWorkCount, n, result, resultCount, v, _i, _len, _ref, _ref2;
      convert2YYYYMM = function(yyyymm) {
        var r;
        if (yyyymm.length !== 6) {
          return yyyymm;
        } else if ((r = yyyymm.match(/(....)(..)/))) {
          return "" + r[1] + "年" + r[2] + "月";
        }
      };
      dataConverted = [];
      if (messageName === "reqRead") {
        _ref = json.hits.hit;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          dataConvertedObject = {};
          dataConvertedObject["estimation"] = "";
          for (key in n.fields) {
            _ref2 = (function() {
              switch (key) {
                case "car_name":
                  return ["carName", n.fields[key]];
                case "mileage":
                  return ["mileage", n.fields[key]];
                case "inventory_number":
                  return ["inventoryNo", n.fields[key]];
                case "inventory_year":
                  return ["inventoryYear", n.fields[key]];
                case "registration_year":
                  return ["registrationYear", convert2YYYYMM(n.fields[key])];
                case "price":
                  return ["wholesalePrice", n.fields[key]];
                case "estimation":
                  return ["estimation", n.fields[key] || ""];
                default:
                  return [void 0, void 0];
              }
            })(), k = _ref2[0], v = _ref2[1];
            if (k !== void 0) dataConvertedObject[k] = v;
          }
          dataConverted.push(dataConvertedObject);
        }
      }
      resultCount = json.hits.hit.length;
      maxWorkCount = json.hits.found;
      result = {
        messageName: messageName,
        pageNo: pageNo,
        dataset: {
          resultCount: resultCount,
          maxWorkCount: maxWorkCount,
          data: dataConverted
        }
      };
      return result;
    };

    SelectAjaxModel.prototype.emitSearch = function(type, value, startIndex, size) {
      var _this = this;
      this.type = type;
      this.value = value;
      return $.ajax({
        type: 'GET',
        url: this.url,
        dataType: 'json',
        data: this.buildQueryParams(type, value, startIndex, size),
        success: function(json) {
          return _this.trigger('resSearch', _this.convertJSONFormat(json, "reqSearch", 0));
        },
        error: function(err) {
          return console.log("error: ", err);
        }
      });
    };

    SelectAjaxModel.prototype.emitRead = function(startIndex, size, pageNo) {
      var _this = this;
      return $.ajax({
        type: 'GET',
        url: this.url,
        dataType: 'json',
        data: this.buildQueryParams(this.type, this.value, startIndex, size),
        success: function(json) {
          return _this.trigger('resRead', _this.convertJSONFormat(json, "reqRead", pageNo));
        },
        error: function(err) {
          return console.log("error: ", err);
        }
      });
    };

    return SelectAjaxModel;

  })(Model);

}).call(this);

});

require.register("models/select_kaazing_model", function(exports, require, module) {
(function() {
  var KaazingWsModel, SelectKaazingModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  KaazingWsModel = require('models/kaazing_ws_model');

  module.exports = SelectKaazingModel = (function(_super) {

    __extends(SelectKaazingModel, _super);

    function SelectKaazingModel() {
      this.getMessage = __bind(this.getMessage, this);
      this.emitUpdateRank = __bind(this.emitUpdateRank, this);
      this.emitRank = __bind(this.emitRank, this);      SelectKaazingModel.__super__.constructor.call(this);
    }

    SelectKaazingModel.prototype.emitRank = function() {
      var json;
      this.log(this);
      json = {};
      return this.sendRankingMessage('reqRanking', json);
    };

    SelectKaazingModel.prototype.emitUpdateRank = function(json) {
      return this.sendRankingMessage('reqUpdateRanking', json);
    };

    SelectKaazingModel.prototype.getMessage = function(body) {
      var json;
      try {
        json = JSON.parse(body);
        return this.trigger(json.name, json.args);
      } catch (error) {
        return this.errorlog(error);
      }
    };

    SelectKaazingModel.prototype.emitSearch = function(d) {
      return this.sendSearchMessage('reqSearch', d);
    };

    SelectKaazingModel.prototype.emitRead = function(d) {
      return this.sendReadMessage('reqRead', d);
    };

    SelectKaazingModel.prototype.emitBodyTypeNum = function(d) {
      return this.sendSearchMessage('reqBodyTypeNum', d);
    };

    return SelectKaazingModel;

  })(KaazingWsModel);

}).call(this);

});

require.register("models/select_model", function(exports, require, module) {
(function() {
  var Model, SelectModel,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Model = require('models/model');

  module.exports = SelectModel = (function(_super) {

    __extends(SelectModel, _super);

    function SelectModel() {
      SelectModel.__super__.constructor.apply(this, arguments);
    }

    SelectModel.prototype.socket_dat = void 0;

    SelectModel.prototype.initialize = function() {
      return _.bindAll(this);
    };

    SelectModel.prototype.setSocketDat = function(socket) {
      var _this = this;
      this.socket_dat = socket;
      this.socket_dat.on('resRanking', function(d) {
        var data;
        data = JSON.parse(d);
        return _this.trigger('resRanking', data);
      });
      return this.socket_dat.on('resRead', function(d) {
        var data;
        data = JSON.parse(d);
        return _this.trigger('resRead', data);
      });
    };

    SelectModel.prototype.setSocketImg = function(socket) {};

    SelectModel.prototype.emitRank = function() {
      var json;
      return json = this.socket_dat.emit('reqRanking', json);
    };

    SelectModel.prototype.emitSearch = function(d) {
      d.imgSocketId = "undefined";
      return this.socket_dat.emit('reqSearch', d);
    };

    SelectModel.prototype.emitRead = function(d) {
      d.imgSocketId = "undefined";
      return this.socket_dat.emit('reqRead', d);
    };

    SelectModel.prototype.emitPing = function(d) {
      console.log("ping");
      return this.socket_dat.emit("ping", {});
    };

    return SelectModel;

  })(Model);

}).call(this);

});

require.register("setting", function(exports, require, module) {
(function() {
  var Setting;

  Setting = {
    initialize: function() {
      Backbone.AUCNET.CONST = {
        WS_DAT_URI: 'https://haze.aucmint.com',
        WS_IMG_URI: 'https://haze.aucmint.com'
      };
      Backbone.AUCNET.SOCKETIO_OPTION = {
        reconnect: false,
        'force new connection': true
      };
      return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
    }
  };

  module.exports = Setting;

}).call(this);

});

require.register("views/select_page_view", function(exports, require, module) {
(function() {
  var SelectAjaxModel, SelectKaazingModel, SelectModel, SelectPageView, View, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  View = require('views/view');

  template = require('views/templates/select_page');

  SelectModel = require('models/select_model');

  SelectAjaxModel = require('models/select_ajax_model');

  SelectKaazingModel = require('models/select_kaazing_model');

  module.exports = SelectPageView = (function(_super) {

    __extends(SelectPageView, _super);

    function SelectPageView() {
      this.isPC = __bind(this.isPC, this);
      this.edtComma = __bind(this.edtComma, this);
      this.makeWhereBodyType = __bind(this.makeWhereBodyType, this);
      this.makeWhereColor = __bind(this.makeWhereColor, this);
      this.makeWhereMaker = __bind(this.makeWhereMaker, this);
      this.init = __bind(this.init, this);
      this.afterRender = __bind(this.afterRender, this);
      this.connectSocket = __bind(this.connectSocket, this);
      this.reconnectSocket = __bind(this.reconnectSocket, this);
      this.clearScrollArea = __bind(this.clearScrollArea, this);
      this.changeCondition = __bind(this.changeCondition, this);
      this.getBodyTypeNum = __bind(this.getBodyTypeNum, this);
      this.updateScrollArea = __bind(this.updateScrollArea, this);
      this.makeScrollArea = __bind(this.makeScrollArea, this);
      this.setChangeDisp = __bind(this.setChangeDisp, this);
      this.makeOtherWhere = __bind(this.makeOtherWhere, this);
      this.makeWhere = __bind(this.makeWhere, this);
      this.addSortOption = __bind(this.addSortOption, this);
      this.evCloseDetail = __bind(this.evCloseDetail, this);
      this.evShowDetail = __bind(this.evShowDetail, this);
      this.evSelectBtn = __bind(this.evSelectBtn, this);
      this.evWhereLi = __bind(this.evWhereLi, this);
      this.evFreeTextSearch = __bind(this.evFreeTextSearch, this);
      this.evSortingButton = __bind(this.evSortingButton, this);
      this.evAllSelectBtn = __bind(this.evAllSelectBtn, this);
      this.evDispSize = __bind(this.evDispSize, this);
      this.evChangeDisp = __bind(this.evChangeDisp, this);
      this.evSort = __bind(this.evSort, this);
      this.evSearch = __bind(this.evSearch, this);
      this.evMenuBtn = __bind(this.evMenuBtn, this);
      this.evPrevCond = __bind(this.evPrevCond, this);
      this.evNextCond = __bind(this.evNextCond, this);
      this.evConditionModalCloseBox = __bind(this.evConditionModalCloseBox, this);
      this.evChangeScreenModalCloseBox = __bind(this.evChangeScreenModalCloseBox, this);
      this.dispRank = __bind(this.dispRank, this);
      this.resRankingFromKaazing = __bind(this.resRankingFromKaazing, this);
      this.resRanking = __bind(this.resRanking, this);
      this.resRead = __bind(this.resRead, this);
      this.resAjaxRead = __bind(this.resAjaxRead, this);
      this.resAjaxSearch = __bind(this.resAjaxSearch, this);
      this.resReadFromKaazing = __bind(this.resReadFromKaazing, this);
      this.buildRegistrationYearFormat = __bind(this.buildRegistrationYearFormat, this);
      this.resSearchFromKaazing = __bind(this.resSearchFromKaazing, this);
      this.resBodyTypeNumFromKaazing = __bind(this.resBodyTypeNumFromKaazing, this);
      this.evReSize = __bind(this.evReSize, this);
      this.resPushImage = __bind(this.resPushImage, this);
      this.mouseWheelDOM = __bind(this.mouseWheelDOM, this);
      this.mouseWheel = __bind(this.mouseWheel, this);
      this.initialize = __bind(this.initialize, this);
      SelectPageView.__super__.constructor.apply(this, arguments);
    }

    SelectPageView.prototype.id = 'select_page';

    SelectPageView.prototype.template = template;

    SelectPageView.prototype.searchTypeWS = 'ws';

    SelectPageView.prototype.searchTypeAjax = 'ajax';

    SelectPageView.prototype.initialize = function() {
      var events,
        _this = this;
      this.curCondition = 1;
      this.mDisp = [];
      this.myScroll = '';
      this.mTimerId = '';
      this.myScrollOld = 0;
      this.mMaxCnt = 0;
      this.mMaxPage = 0;
      this.mDispWidth = 0;
      this.mDispWcnt = 0;
      this.mDispHcnt = 0;
      this.mDispCnt = 0;
      this.mDispWli = 0;
      this.mDispHli = 0;
      this.mImageW = 0;
      this.mImageH = 0;
      this.mWindowH = $(window).height();
      this.mDispIdx = 0;
      this.mResizeTimer = '';
      this.searchType = 'ws';
      this.searchedFlag = false;
      this.searchedJSONData = null;
      this.touchStartTime = null;
      this.selectAjaxModel = new SelectAjaxModel();
      this.selectAjaxModel.bind('resSearch', this.resAjaxSearch);
      this.selectAjaxModel.bind('resRead', this.resAjaxRead);
      window.kaazingWS = this.selectKaazingModel = new SelectKaazingModel();
      this.selectKaazingModel.connect();
      this.selectKaazingModel.bind('resRanking', this.resRankingFromKaazing);
      this.selectKaazingModel.bind('resSearch', this.resSearchFromKaazing);
      this.selectKaazingModel.bind('resRead', this.resReadFromKaazing);
      this.selectKaazingModel.bind('resBodyTypeNum', this.resBodyTypeNumFromKaazing);
      if (location.hostname !== "d29af645urt2e8.cloudfront.net") {
        setTimeout(function() {
          return $('.freeSearch').css('display', 'none');
        }, 500);
      }
      this.reconnectInterval = null;
      if (this.isPC()) {
        events = {
          "click .changeScreenModal .closeBox": "evChangeScreenModalCloseBox",
          "click .conditionModal    .closeBox": "evConditionModalCloseBox",
          "click .nextCond": "evNextCond",
          "click .prevCond": "evPrevCond",
          "click .menuBtn": "evMenuBtn",
          "click #search": "evSearch",
          "click #sort": "evSort",
          "click #changeDisp": "evChangeDisp",
          "click .dispSize": "evDispSize",
          "click .allSelectBtn": "evAllSelectBtn",
          "click .selectBtn": "evSelectBtn",
          "click .manufacturer li": "evWhereLi",
          "click .colors li": "evWhereLi",
          "click .bodyType li": "evWhereLi",
          "click .sorting button": "evSortingButton",
          "submit #free_text_search_form": "evFreeTextSearch",
          "click #scroller li": "evShowDetail",
          "click .detailModal .closeBox": "evCloseDetail",
          "click .detailModal .closeBtn": "evCloseDetail",
          "click .sorting": "evSort",
          "mousewheel #scroller_wrapper": "mouseWheel",
          "DOMMouseScroll #scroller_wrapper": "mouseWheelDOM"
        };
        this.delegateEvents(events);
      } else {
        events = {
          "touchstart .changeScreenModal .closeBox": "evChangeScreenModalCloseBox",
          "touchstart .conditionModal    .closeBox": "evConditionModalCloseBox",
          "touchstart .nextCond": "evNextCond",
          "touchstart .prevCond": "evPrevCond",
          "touchstart .menuBtn": "evMenuBtn",
          "touchstart #search": "evSearch",
          "touchstart #sort": "evSort",
          "touchstart #changeDisp": "evChangeDisp",
          "touchstart .dispSize": "evDispSize",
          "touchstart .allSelectBtn": "evAllSelectBtn",
          "touchstart .selectBtn": "evSelectBtn",
          "touchstart .manufacturer li": "evWhereLi",
          "touchstart .colors li": "evWhereLi",
          "touchstart .bodyType li": "evWhereLi",
          "touchstart .sorting button": "evSortingButton",
          "submit #free_text_search_form": "evFreeTextSearch",
          "touchstart #scroller li": "evShowDetail",
          "touchstart .detailModal .closeBox": "evCloseDetail",
          "touchstart .detailModal .closeBtn": "evCloseDetail",
          "touchstart .sorting": "evSort"
        };
        this.delegateEvents(events);
      }
      setTimeout(this.init, 100);
      return $(window).resize(this.evReSize);
    };

    SelectPageView.prototype.mouseWheel = function(ev) {
      var $wrapper;
      $wrapper = $(ev.currentTarget);
      if (ev.originalEvent.wheelDelta < 0) {
        this.myScroll.scrollTo(this.myScroll.x - 100);
      } else {
        this.myScroll.scrollTo(this.myScroll.x + 100);
      }
      return false;
    };

    SelectPageView.prototype.mouseWheelDOM = function(ev) {
      var $wrapper;
      $wrapper = $(ev.currentTarget);
      if (ev.originalEvent.detail < 0) {
        this.myScroll.scrollTo(this.myScroll.x - 100);
      } else {
        this.myScroll.scrollTo(this.myScroll.x + 100);
      }
      return false;
    };

    SelectPageView.prototype.resPushImage = function(json) {};

    SelectPageView.prototype.evReSize = function() {
      var _this = this;
      if (this.mResizeTimer) clearTimeout(this.mResizeTimer);
      return this.mResizeTimer = setTimeout(function() {
        _this.mWindowH = $(window).height();
        return _this.setChangeDisp(_this.mDispIdx);
      }, 200);
    };

    SelectPageView.prototype.resBodyTypeNumMapping = {
      12: ".type1",
      10: ".type2",
      11: ".type3",
      14: ".type4",
      15: ".type5",
      16: ".type6",
      13: ".type7",
      20: ".type8"
    };

    SelectPageView.prototype.resBodyTypeNumFromKaazing = function(arr) {
      var n, _ref, _results;
      _results = [];
      for (n = 0, _ref = arr.length; 0 <= _ref ? n < _ref : n > _ref; 0 <= _ref ? n++ : n--) {
        _results.push($("ul.bodyType " + this.resBodyTypeNumMapping[arr[n][0]] + " span").text(arr[n][1]));
      }
      return _results;
    };

    SelectPageView.prototype.resSearchFromKaazing = function(json) {
      json.messageName = "reqSearch";
      json.dataset = {};
      json.dataset.maxWorkCount = json.maxWorkCount;
      json.dataset.data = [];
      return this.resRead(json);
    };

    SelectPageView.prototype.buildRegistrationYearFormat = function(yyyymm) {
      var result;
      if (yyyymm.length !== 6) return yyyymm;
      result = yyyymm.match(/(....)(..)/);
      return "" + result[1] + "年" + result[2] + "月";
    };

    SelectPageView.prototype.resReadFromKaazing = function(json) {
      var modifiedJSON, n, _i, _len, _o, _ref;
      modifiedJSON = {};
      modifiedJSON.pageNo = json.pageNo;
      modifiedJSON.dataset = {};
      modifiedJSON.dataset.data = [];
      modifiedJSON.dataset.resultCount = json.dataSet.length;
      _ref = json.dataSet;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _o = {};
        _o.carName = n[0];
        _o.estimation = n[1];
        _o.inventoryNo = n[2];
        _o.inventoryYear = n[3];
        _o.mileage = String(n[7]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        _o.registrationYear = this.buildRegistrationYearFormat("" + n[5]);
        _o.wholesalePrice = n[6];
        _o.outColor = n[8];
        modifiedJSON.dataset.data.push(_o);
      }
      return this.resRead(modifiedJSON);
    };

    SelectPageView.prototype.resAjaxSearch = function(json) {
      return this.resRead(json);
    };

    SelectPageView.prototype.resAjaxRead = function(json) {
      return this.resRead(json);
    };

    SelectPageView.prototype.outColorCdMapping = {
      1: "ホワイト",
      2: "パールホワイト",
      3: "ベージュ",
      4: "シルバー",
      5: "グレー",
      6: "ガンメタリック",
      7: "ブラック",
      8: "ピンク",
      9: "パープル",
      10: "ワインレッド",
      11: "レッド",
      12: "イエロー",
      13: "オレンジ",
      14: "ゴールド",
      15: "ブラウン",
      16: "ライトブルー",
      17: "ブルー",
      18: "ダークブルー",
      19: "グリーン",
      20: "マジョーラ",
      21: "その他"
    };

    SelectPageView.prototype.estimationMapping = {
      10: "S",
      9: "6",
      8: "5",
      7: "4.5",
      6: "4",
      5: "3.5",
      4: "3",
      3: "2",
      2: "1",
      1: "0",
      0: "-"
    };

    SelectPageView.prototype.resRead = function(json) {
      var carinfoDiv, cnt, detailDiv, eSpan, fragment, i, imageObj, imageUrl, inventoryYear, iySpan, key, mSpan, page, priceDiv, rows, sizePath, titleH3, url_path, ySpan, _results;
      cnt = json.dataset.resultCount;
      if (json.dataset.data.length === 2 && Object.prototype.toString.apply(json.dataset.data[0]) === "[object Object]" && Object.prototype.toString.apply(json.dataset.data[1]) === "[object Array]") {
        rows = RJSON.unpack(json.dataset.data);
      } else {
        rows = json.dataset.data;
      }
      page = json.pageNo;
      if (json.messageName === "reqSearch") {
        this.mMaxCnt = json.dataset.maxWorkCount;
        this.makeScrollArea();
      }
      i = 0;
      _results = [];
      while (i < rows.length) {
        key = rows[i].inventoryYear + rows[i].inventoryNo;
        sizePath = "0";
        if (this.mDispIdx > 0) sizePath = "1";
        if (rows[i].inventoryYear === 2014) {
          inventoryYear = 2012;
        } else {
          inventoryYear = rows[i].inventoryYear;
        }
        url_path = "stock/" + sizePath + "/" + inventoryYear + "/" + rows[i].inventoryNo + "_1.jpg";
        if (i % 2 === 0) {
          imageUrl = "http://baku.aucmint.com/" + url_path;
        } else {
          imageUrl = "http://durian.aucmint.com/" + url_path;
        }
        imageObj = new Image(this.mImageW, this.mImageH);
        imageObj.onerror = function() {
          return this.src = "http://baku.aucmint.com/thumbnails/dummy.jpg";
        };
        imageObj.src = imageUrl;
        imageObj.id = "img" + key;
        titleH3 = document.createElement('h3');
        $(titleH3).text("" + rows[i].carName);
        carinfoDiv = document.createElement('div');
        carinfoDiv.className = "carInfo";
        detailDiv = document.createElement('div');
        detailDiv.className = "infoDetails";
        ySpan = document.createElement('span');
        $(ySpan).text("年式:" + rows[i].registrationYear);
        eSpan = document.createElement('span');
        $(eSpan).text("評価点:" + this.estimationMapping[rows[i].estimation]);
        mSpan = document.createElement('span');
        $(mSpan).text("" + rows[i].mileage + "Km");
        iySpan = document.createElement('span');
        $(iySpan).text("" + rows[i].inventoryNo);
        priceDiv = document.createElement('div');
        priceDiv.className = "carPrice";
        $(priceDiv).text(this.edtComma(rows[i].wholesalePrice));
        detailDiv.appendChild(ySpan);
        detailDiv.appendChild(eSpan);
        detailDiv.appendChild(mSpan);
        detailDiv.appendChild(iySpan);
        carinfoDiv.appendChild(detailDiv);
        carinfoDiv.appendChild(priceDiv);
        fragment = document.createDocumentFragment();
        fragment.appendChild(imageObj);
        fragment.appendChild(titleH3);
        fragment.appendChild(carinfoDiv);
        this.$("#data" + page + "-" + i).parent().css('backgroundColor', '#222');
        this.$("#data" + page + "-" + i).append(fragment);
        this.$("#data" + page + "-" + i).css("display", "block");
        this.$("#data" + page + "-" + i).data("inventoryYear", rows[i].inventoryYear);
        this.$("#data" + page + "-" + i).data("inventoryNo", rows[i].inventoryNo);
        this.$("#data" + page + "-" + i).data("registrationYear", rows[i].registrationYear);
        this.$("#data" + page + "-" + i).data("estimation", this.estimationMapping[rows[i].estimation]);
        this.$("#data" + page + "-" + i).data("mileage", rows[i].mileage);
        this.$("#data" + page + "-" + i).data("price", this.edtComma(rows[i].wholesalePrice));
        this.$("#data" + page + "-" + i).data("carName", rows[i].carName);
        this.$("#data" + page + "-" + i).data("outColor", this.outColorCdMapping[rows[i].outColor]);
        _results.push(i++);
      }
      return _results;
    };

    SelectPageView.prototype.resRanking = function(json) {
      this.dispRank('manufacturer', json.dataSet.maker);
      this.dispRank('colors', json.dataSet.color);
      return this.dispRank('bodyType', json.dataSet.bodyType);
    };

    SelectPageView.prototype.resRankingFromKaazing = function(json) {
      this.dispRank('manufacturer', json.maker);
      this.dispRank('colors', json.color);
      return this.dispRank('bodyType', json.bodyType);
    };

    SelectPageView.prototype.dispRank = function(classname, rows) {
      var i, id, mark, obj, _results;
      obj = $("." + classname + ' li');
      i = 0;
      while (i < obj.length) {
        id = obj.eq(i).attr('data-value');
        $("#s_" + classname + id).html("");
        $("#" + classname + id).html("0");
        i++;
      }
      i = 0;
      _results = [];
      while (i < rows.length) {
        mark = '';
        if (i === 0) mark = '★★★';
        if (i === 1) mark = '★★';
        if (i === 2) mark = '★';
        $("#s_" + classname + rows[i].id).html(mark);
        $("#" + classname + rows[i].id).html(rows[i].score);
        _results.push(i++);
      }
      return _results;
    };

    SelectPageView.prototype.evChangeScreenModalCloseBox = function() {
      return $(".changeScreenModal").removeClass("show");
    };

    SelectPageView.prototype.evConditionModalCloseBox = function() {
      return $(".conditionModal").removeClass("show");
    };

    SelectPageView.prototype.evNextCond = function() {
      this.curCondition += 1;
      return this.changeCondition();
    };

    SelectPageView.prototype.evPrevCond = function() {
      this.curCondition -= 1;
      return this.changeCondition();
    };

    SelectPageView.prototype.evMenuBtn = function() {
      this.changeCondition();
      return $(".menuContainer").toggleClass("show");
    };

    SelectPageView.prototype.evSearch = function() {
      this.selectKaazingModel.emitRank();
      return $(".conditionModal").addClass("show");
    };

    SelectPageView.prototype.evSort = function(evt) {
      if (evt.target.tagName.toLowerCase() === "button") return;
      return $(".sorting").toggleClass("show");
    };

    SelectPageView.prototype.evChangeDisp = function() {
      return $(".changeScreenModal").addClass("show");
    };

    SelectPageView.prototype.evDispSize = function(e) {
      var _this = this;
      this.mDispIdx = 0;
      if ($(e.currentTarget).hasClass("size1")) this.mDispIdx = 0;
      if ($(e.currentTarget).hasClass("size2")) this.mDispIdx = 1;
      if ($(e.currentTarget).hasClass("size3")) this.mDispIdx = 2;
      $(".dispSize").removeClass("selected");
      $(e.currentTarget).addClass("selected");
      this.setChangeDisp(this.mDispIdx);
      $(e.currentTarget).parent().addClass("selected").siblings().removeClass("selected");
      $(".changeScreenModal").removeClass("show");
      $(".menuContainer").removeClass("show");
      return setTimeout(function() {
        return _this.myScroll.scrollLeft(0);
      }, 100);
    };

    SelectPageView.prototype.evAllSelectBtn = function(e) {
      var classname, i, isRemove, obj, _results;
      $(e.target).toggleClass("active");
      isRemove = false;
      if ($(e.target).hasClass("active")) {
        isRemove = false;
      } else {
        isRemove = true;
      }
      classname = ".manufacturer";
      if (this.curCondition === 1) classname = ".manufacturer";
      if (this.curCondition === 2) classname = ".colors";
      if (this.curCondition === 3) classname = ".bodyType";
      obj = $(classname + ' li');
      i = 0;
      _results = [];
      while (i < obj.length) {
        if (isRemove === true) {
          obj.eq(i).removeClass('active');
        } else {
          obj.eq(i).addClass('active');
        }
        _results.push(i++);
      }
      return _results;
    };

    SelectPageView.prototype.evSortingButton = function(event) {
      var $parent, target;
      target = $(event.currentTarget);
      $parent = target.parent();
      $parent.data('type', target.data('type'));
      console.log("@searchedFlag :", this.searchedFlag);
      target.siblings().removeClass("ascend");
      target.siblings().removeClass("descend");
      if (target.hasClass("ascend")) {
        target.addClass("descend");
        target.removeClass("ascend");
        $parent.data('order', 1);
      } else {
        target.addClass("ascend");
        target.removeClass("descend");
        $parent.data('order', 0);
      }
      if (this.searchedFlag === true) {
        this.searchedJSONData = this.addSortOption(this.searchedJSONData);
        return this.selectKaazingModel.emitSearch(this.searchedJSONData);
      }
    };

    SelectPageView.prototype.evFreeTextSearch = function(event) {
      var searchType, searchValue;
      searchType = $(event.currentTarget).find("select").val();
      searchValue = $(event.currentTarget).find("input[type='input']").val();
      this.searchType = this.searchTypeAjax;
      this.selectAjaxModel.emitSearch(searchType, searchValue, 0, 1);
      return event.preventDefault();
    };

    SelectPageView.prototype.evWhereLi = function(e) {
      return $(e.currentTarget).toggleClass("active");
    };

    SelectPageView.prototype.evSelectBtn = function() {
      var body, color, json, maker, other;
      this.searchType = this.searchTypeWS;
      $(".conditionModal").removeClass("show");
      $(".menuContainer").removeClass("show");
      maker = this.makeWhere(".manufacturer");
      color = this.makeWhere(".colors");
      body = this.makeWhere(".bodyType");
      other = this.makeOtherWhere();
      if (maker.length === 0 && color.length === 0 && body.length === 0) {
        alert("検索条件を設定して下さい。");
        return;
      }
      json = {
        imgSocketId: '',
        makerCd: maker,
        colorCd: color,
        bodyTypeCd: body,
        retCount: 0,
        pageNo: 0,
        estimation: other.estimation,
        inspect: other.inspect,
        mileage: other.mileage,
        modelyear: other.modelyear,
        shift: other.shift
      };
      json = this.addSortOption(json);
      this.selectKaazingModel.emitSearch(json);
      this.selectKaazingModel.emitUpdateRank(json);
      this.searchedFlag = true;
      return this.searchedJSONData = json;
    };

    SelectPageView.prototype.evShowDetail = function(evt) {
      var now, targetDataElem, timesince;
      now = (new Date()).getTime();
      timesince = now - this.touchStartTime;
      if (timesince < 200 && timesince > 0) {
        targetDataElem = $($(evt.currentTarget).children().get(0));
        $("#dmInventoryNo").text("問合No:" + (targetDataElem.data("inventoryNo")));
        $("#dmOutColor").text("外装色:" + (targetDataElem.data("outColor")));
        $("#dmRegistrationYear").text("年式:" + (targetDataElem.data("registrationYear")));
        $("#dmEstimation").text("評価点:" + (targetDataElem.data("estimation")));
        $("#dmMileage").text("走行距離:" + (targetDataElem.data("mileage")) + "Km");
        $("#dmImage").attr('src', targetDataElem.find('img').attr('src'));
        $("#dmPrice").text(targetDataElem.data("price"));
        $("#dmCarName").text(targetDataElem.data("carName"));
        $(".detailModal").addClass("show");
      }
      return this.touchStartTime = (new Date()).getTime();
    };

    SelectPageView.prototype.evCloseDetail = function(evt) {
      return $(".detailModal").removeClass("show");
    };

    SelectPageView.prototype.addSortOption = function(json) {
      var sortElem;
      sortElem = $('.sorting');
      json.sort = [sortElem.data('type'), sortElem.data('order')];
      return json;
    };

    SelectPageView.prototype.makeWhere = function(classname) {
      var i, obj, rc;
      rc = [];
      obj = this.$(classname + ' li');
      i = 0;
      while (i < obj.length) {
        if (obj.eq(i).hasClass('active')) rc.push(obj.eq(i).attr('data-value'));
        i++;
      }
      return rc;
    };

    SelectPageView.prototype.makeOtherWhere = function() {
      var estimation_from, estimation_to, inspect, mileage_from, mileage_to, modelyear_from, modelyear_to, shift;
      modelyear_from = $("#search_cond_modelyear_from").val();
      modelyear_to = $("#search_cond_modelyear_to").val();
      mileage_from = $("#search_cond_mileage_from").val();
      mileage_to = $("#search_cond_mileage_to").val();
      estimation_from = $("#search_cond_estimation_from").val();
      estimation_to = $("#search_cond_estimation_to").val();
      inspect = $("input[name='search_cond_inspect_value']:checked").val();
      shift = $("input[name='search_cond_shift_value']:checked").val();
      return {
        modelyear: [modelyear_from, modelyear_to],
        mileage: [mileage_from, mileage_to],
        estimation: [estimation_from, estimation_to],
        inspect: inspect,
        shift: shift
      };
    };

    SelectPageView.prototype.setChangeDisp = function(idx) {
      if (idx === 0) {
        this.mDispWcnt = 3;
        this.mDispHcnt = 2;
        this.mDispHli = Math.floor(this.mWindowH / this.mDispHcnt) - 44;
      }
      if (idx === 1) {
        this.mDispWcnt = 4;
        this.mDispHcnt = 3;
        this.mDispHli = Math.floor(this.mWindowH / this.mDispHcnt) - 36;
      }
      if (idx === 2) {
        this.mDispWcnt = 5;
        this.mDispHcnt = 4;
        this.mDispHli = Math.floor(this.mWindowH / this.mDispHcnt) - 30;
      }
      this.mDispWli = Math.floor(this.mDispHli * 1.4);
      this.mDispWidth = this.mDispWcnt * this.mDispWli + (8 * 2 * this.mDispWcnt);
      this.mDispCnt = this.mDispWcnt * this.mDispHcnt;
      this.mImageW = this.mDispWli;
      this.mImageH = this.mDispHli;
      return this.makeScrollArea();
    };

    SelectPageView.prototype.makeScrollArea = function() {
      var cnt, html, i, j,
        _this = this;
      console.log("makeScrollArea called..");
      this.$(".maxCount").html('検索結果：' + this.edtComma(this.mMaxCnt) + '件');
      this.mMaxPage = Math.ceil(this.mMaxCnt / this.mDispCnt);
      if (this.mMaxPage > 100) this.mMaxPage = 100;
      html = "";
      i = 0;
      while (i < this.mMaxPage) {
        this.mDisp[i] = false;
        html += "<ul>";
        j = 0;
        while (j < this.mDispCnt) {
          cnt = ((j % this.mDispWcnt) * this.mDispHcnt) + Math.floor(j / this.mDispWcnt);
          html += '<li><div id="data' + i + '-' + cnt + '"></div></li>';
          j++;
        }
        html += "</ul>";
        i++;
      }
      this.$("#scroller").html(html);
      this.$("#scroller ul").css("width", this.mDispWidth + "px");
      this.$("#scroller li").css("width", this.mDispWli + "px");
      this.$("#scroller li").css("height", this.mDispHli + "px");
      this.$("#scroller").css("width", this.mMaxPage * this.mDispWidth + "px");
      this.myScroll.refresh();
      this.myScroll.scrollToPage(0);
      if (this.mTimerId) clearInterval(this.mTimerId);
      this.updateScrollArea();
      return this.mTimerId = setInterval(function() {
        return _this.updateScrollArea();
      }, 200);
    };

    SelectPageView.prototype.updateScrollArea = function() {
      var html, i, j, json, old, scroll, _results;
      if (Math.abs(this.myScroll.x - this.myScrollOld) > Math.floor(this.mDispWidth / 4)) {
        this.myScrollOld = this.myScroll.x;
        return;
      }
      this.myScrollOld = this.myScroll.x;
      html = "";
      scroll = Math.floor(-this.myScroll.x);
      i = 0;
      _results = [];
      while (i < this.mMaxPage) {
        old = this.mDisp[i];
        if (Math.abs(Math.floor((scroll - this.mDispWidth / 2) / this.mDispWidth) - i) > 3) {
          this.mDisp[i] = false;
        } else {
          this.mDisp[i] = true;
        }
        if (this.mDisp[i] !== old) {
          if (this.mDisp[i] === false) {
            j = 0;
            while (j < this.mDispCnt) {
              this.$("#data" + i + "-" + j).html("");
              j++;
            }
          } else {
            if (this.searchType === this.searchTypeAjax) {
              this.selectAjaxModel.emitRead(i * this.mDispCnt, this.mDispCnt, i);
            } else {
              json = {};
              $.extend(json, this.searchedJSONData);
              json.imgSocketId = '';
              json.startIndex = i * this.mDispCnt;
              json.retCount = this.mDispCnt;
              json.pageNo = i;
              this.selectKaazingModel.emitRead(json);
            }
          }
        }
        _results.push(i++);
      }
      return _results;
    };

    SelectPageView.prototype.getBodyTypeNum = function() {
      var color, json, maker;
      maker = this.makeWhere(".manufacturer");
      color = this.makeWhere(".colors");
      json = {
        makerCd: maker,
        colorCd: color
      };
      return this.selectKaazingModel.emitBodyTypeNum(json);
    };

    SelectPageView.prototype.changeCondition = function() {
      if (this.curCondition === 2) {
        $(".searchSlider").css("left", "-100%");
        return $(".nextCond,.prevCond").show(0);
      } else {
        if (this.curCondition === 3) {
          this.getBodyTypeNum();
          $(".searchSlider").css("left", "-200%");
          $(".nextCond").show(0);
          return $(".prevCond").show(0);
        } else if (this.curCondition === 4) {
          $(".searchSlider").css("left", "-300%");
          $(".nextCond").hide(0);
          return $(".prevCond").show(0);
        } else {
          this.curCondition = 1;
          $(".searchSlider").css("left", "0%");
          return $(".prevCond").hide(0);
        }
      }
    };

    SelectPageView.prototype.clearScrollArea = function() {
      $('#scroller').html('');
      this.curCondition = 1;
      this.mDisp = [];
      this.mTimerId = '';
      this.myScrollOld = 0;
      this.mMaxCnt = 0;
      this.mMaxPage = 0;
      return this.$(".maxCount").html('検索結果：0件');
    };

    SelectPageView.prototype.reconnectSocket = function(con) {
      var _this = this;
      if (this.reconnectInterval !== null) return;
      return this.reconnectInterval = setInterval(function() {
        return con.socket.reconnect();
      }, 500);
    };

    SelectPageView.prototype.connectSocket = function() {
      var con1, con1SocketOption, con2, con2SocketOption, max_reconnects,
        _this = this;
      max_reconnects = 100;
      con1SocketOption = _.extend({
        'resource': 'b4003',
        'connect timeout': 5000,
        'try multiple transports': true,
        'reconnect': true,
        'reconnection delay': 500,
        'reconnection limit': 5000,
        'max reconnection attempts': 3,
        'sync disconnect on unload': false,
        'auto connect': true,
        'port': 443
      }, Backbone.AUCNET.SOCKETIO_OPTION);
      con1 = io.connect(Backbone.AUCNET.CONST.WS_DAT_URI + '/index', con1SocketOption);
      con1.on('connect', function() {
        if (_this.reconnectInterval === null) {
          Backbone.AUCNET.socket_dat = con1;
          _this.selectModel.setSocketDat(con1);
        }
        clearInterval(_this.reconnectInterval);
        return _this.reconnectInterval = null;
      });
      con1.on('reconnect', function() {
        console.log("con1 : reconnect", arguments);
        return _this.clearScrollArea();
      });
      con1.on('connecting', function() {
        return console.log("con1 : connecting", arguments);
      });
      con1.on('connect_failed', function() {
        return console.log("con1 : connect_failed", arguments);
      });
      con1.on('reconnect_failed', function() {
        return console.log("con1 : reconnect_failed", arguments);
      });
      con1.on('disconnect', function() {
        console.log("con1 : disconnect", arguments);
        return _this.reconnectSocket(con1);
      });
      con1.on("reconnecting", function(delay, attempt) {
        console.log("attempting reconnect - " + attempt);
        if (attempt === max_reconnects) {
          return console.log("all reconnect attempts failed");
        }
      });
      con1.socket.on('error', function(reason) {
        return console.log("con1 : socket error", reason);
      });
      con2SocketOption = _.extend({
        resource: 'b3011'
      }, Backbone.AUCNET.SOCKETIO_OPTION);
      con2 = io.connect(Backbone.AUCNET.CONST.WS_IMG_URI, con2SocketOption);
      con2.on('connect', function() {
        Backbone.AUCNET.socket_dat = con2;
        return _this.selectModel.setSocketImg(con2);
      });
      return con2.socket.on('error', function(reason) {
        return console.log("con2 : socket error", reason);
      });
    };

    SelectPageView.prototype.afterRender = function() {
      this.makeWhereMaker();
      this.makeWhereColor();
      this.makeWhereBodyType();
      return this.$(".dispSize.size1").addClass("selected");
    };

    SelectPageView.prototype.init = function() {
      this.myScroll = new iScroll('scroller_wrapper', {
        useTransition: false,
        vScroll: false
      });
      return this.setChangeDisp(this.mDispIdx);
    };

    SelectPageView.prototype.makeWhereMaker = function() {
      var html, id, json, obj, _i, _len;
      json = [
        {
          classname: "toyota",
          colname: "Toyota",
          id: "00"
        }, {
          classname: "honda",
          colname: "Honda",
          id: "20"
        }, {
          classname: "nissan",
          colname: "Nissan",
          id: "10"
        }, {
          classname: "mitsubishi",
          colname: "Mitsubishi",
          id: "30"
        }, {
          classname: "mazda",
          colname: "Mazda",
          id: "40"
        }, {
          classname: "subaru",
          colname: "Subaru",
          id: "50"
        }, {
          classname: "daihatsu",
          colname: "Daihatsu",
          id: "80"
        }, {
          classname: "suzuki",
          colname: "Suzuki",
          id: "60"
        }, {
          classname: "domestic",
          colname: "Domestic",
          id: "DC"
        }, {
          classname: "imported",
          colname: "imported",
          id: "IC"
        }
      ];
      html = "";
      for (_i = 0, _len = json.length; _i < _len; _i++) {
        obj = json[_i];
        id = "manufacturer" + obj.id;
        html += "<li class='" + obj.classname + "' data-type='メーカー' data-name='" + obj.colname + "' data-value='" + obj.id + "'>";
        html += "<div class='rankStar' id='s_" + id + "'></div>";
        html += "<div class='searchCount' id='" + id + "'></div>";
        html += "<span></span>";
        html += "</li>";
      }
      return this.$(".manufacturer").html(html);
    };

    SelectPageView.prototype.makeWhereColor = function() {
      var html, id, json, obj, _i, _len;
      json = [
        {
          classname: "color2",
          colname: "ホワイト",
          id: "1"
        }, {
          classname: "color3",
          colname: "パールホワイト",
          id: "2"
        }, {
          classname: "color4",
          colname: "ベージュ",
          id: "3"
        }, {
          classname: "color5",
          colname: "シルバー",
          id: "4"
        }, {
          classname: "color6",
          colname: "グレー",
          id: "5"
        }, {
          classname: "color7",
          colname: "ガンメタリック",
          id: "6"
        }, {
          classname: "color8",
          colname: "ブラック",
          id: "7"
        }, {
          classname: "color9",
          colname: "ピンク",
          id: "8"
        }, {
          classname: "color10",
          colname: "パープル",
          id: "9"
        }, {
          classname: "color11",
          colname: "ワインレッド",
          id: "10"
        }, {
          classname: "color12",
          colname: "レッド",
          id: "11"
        }, {
          classname: "color13",
          colname: "イエロー",
          id: "12"
        }, {
          classname: "color14",
          colname: "オレンジ",
          id: "13"
        }, {
          classname: "color15",
          colname: "ゴールド",
          id: "14"
        }, {
          classname: "color16",
          colname: "ブラウン",
          id: "15"
        }, {
          classname: "color17",
          colname: "ライトブルー",
          id: "16"
        }, {
          classname: "color18",
          colname: "ブルー",
          id: "17"
        }, {
          classname: "color19",
          colname: "ダークブルー",
          id: "18"
        }, {
          classname: "color20",
          colname: "グリーン",
          id: "19"
        }, {
          classname: "color21",
          colname: "マジョーラ",
          id: "20"
        }, {
          classname: "color22",
          colname: "その他",
          id: "21"
        }
      ];
      html = "";
      for (_i = 0, _len = json.length; _i < _len; _i++) {
        obj = json[_i];
        id = "colors" + obj.id;
        html += "<li class='" + obj.classname + "' data-type='色' data-name='" + obj.colname + "' data-value='" + obj.id + "'>";
        html += "<div class='searchCount' id='" + id + "'></div>";
        html += "<span></span>";
        html += "<div class='rankStar' id='s_" + id + "'></div>";
        html += "<label>" + obj.colname + "</label>";
        html += "</li>";
      }
      return this.$(".colors").html(html);
    };

    SelectPageView.prototype.makeWhereBodyType = function() {
      var html, id, json, obj, _i, _len;
      json = [
        {
          classname: "type1",
          colname: "ハッチバック",
          id: "12"
        }, {
          classname: "type2",
          colname: "セダン",
          id: "10"
        }, {
          classname: "type3",
          colname: "クーペ",
          id: "11"
        }, {
          classname: "type4",
          colname: "ステーションワゴン",
          id: "14"
        }, {
          classname: "type5",
          colname: "ワゴン",
          id: "15"
        }, {
          classname: "type6",
          colname: "ＳＵＶ",
          id: "16"
        }, {
          classname: "type7",
          colname: "コンバーチブル",
          id: "13"
        }, {
          classname: "type8",
          colname: "トラック",
          id: "20"
        }
      ];
      html = "";
      for (_i = 0, _len = json.length; _i < _len; _i++) {
        obj = json[_i];
        id = "bodyType" + obj.id;
        html += "<li class='" + obj.classname + "' data-type='ボディタイプ' data-name='" + obj.colname + "' data-value='" + obj.id + "'>";
        html += "<div class='rankStar' id='s_" + id + "'></div>";
        html += "<div class='searchCount' id='" + id + "'></div>";
        html += "<label>" + obj.colname + "</label>";
        html += "<span>0</span>";
        html += "</li>";
      }
      return this.$(".bodyType").html(html);
    };

    SelectPageView.prototype.rnd = function(val) {
      return Math.floor(Math.random() * val);
    };

    SelectPageView.prototype.edtComma = function(num) {
      return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    };

    SelectPageView.prototype.isPC = function() {
      var mUa;
      mUa = navigator.userAgent;
      if (/iPhone/.test(mUa) || /iPod/.test(mUa) || /iPad/.test(mUa) || /Android/.test(mUa)) {
        return false;
      } else {
        return true;
      }
    };

    return SelectPageView;

  })(View);

}).call(this);

});

require.register("views/templates/select_page", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div id=\"wrapper\">\n  <div class=\"sorting\" data-type='0' data-order='0'>\n    <label>並べ替え</label>\n    <button class=\"ascend\" data-type='0'>価格</button>\n    <button data-type='1'>年式</button>\n    <button data-type='2'>評価点</button>\n    <button data-type='4'>問合No</button>\n    <button data-type='8'>走行距離</button>\n    <strong></strong>\n    <div class=\"closeBtn\"></div>\n  </div>\n  <div class=\"conditionModal\">\n    <div class=\"prevBtn prevCond\"></div>\n    <div class=\"nextBtn nextCond\"></div>\n    <ul class=\"inner searchSlider\">\n      <li class=\"sContainer\">\n        <div class=\"closeBox\"></div>\n        <div class=\"conditionBox\">\n          <h1>メーカー</h1>\n          <div class=\"allSelectBtn\">全選択</div>\n          <ul class=\"manufacturer\"></ul>\n          <div class=\"selectBtn\">検索</div>\n        </div>\n      </li>\n      <li class=\"sContainer\">\n        <div class=\"closeBox\"></div>\n        <div class=\"conditionBox\">\n          <h1>色</h1>\n          <div class=\"allSelectBtn\">全選択</div>\n          <ul class=\"colors\"></ul>\n          <div class=\"selectBtn\">検索</div>\n        </div>\n      </li>\n      <li class=\"sContainer\">\n        <div class=\"closeBox\"></div>\n        <div class=\"conditionBox\">\n          <h1>ボディータイプ</h1>\n          <div class=\"allSelectBtn\">全選択</div>\n          <ul class=\"bodyType\"></ul>\n          <div class=\"selectBtn\">検索</div>\n        </div>\n      </li>\n      <li class=\"sContainer\">\n        <div class=\"closeBox\"></div>\n        <div class=\"conditionBox\">\n          <h1>その他</h1>\n          <div>\n            <div class=\"rangeBox\">\n              <h3 data-label=\"lb_search_cond_modelyear\" placeholder=\"年式\">年式</h3>\n              <div class=\"selectItem\">\n                <select id=\"search_cond_modelyear_from\" class=\"rangeBoxSelect\">\n                  <option value=\"\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</option>\n                  <option value=\"2014\">2014年\n                  </option><option value=\"2013\">2013年\n                  </option><option value=\"2012\">2012年\n                  </option><option value=\"2011\">2011年\n                  </option><option value=\"2010\">2010年\n                  </option><option value=\"2009\">2009年\n                  </option><option value=\"2008\">2008年\n                  </option><option value=\"2007\">2007年\n                  </option><option value=\"2006\">2006年\n                  </option><option value=\"2005\">2005年\n                  </option><option value=\"2004\">2004年\n                  </option><option value=\"2003\">2003年\n                  </option><option value=\"2002\">2002年\n                  </option><option value=\"2001\">2001年\n                  </option><option value=\"2000\">2000年\n                  </option><option value=\"1999\">1999年\n                  </option><option value=\"1998\">1998年\n                  </option><option value=\"1997\">1997年\n                  </option><option value=\"1996\">1996年\n                  </option><option value=\"1995\">1995年\n                  </option>\n                </select>\n                          ~\n                <select id=\"search_cond_modelyear_to\" class=\"rangeBoxSelect\">\n                  <option value=\"\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</option>\n                  <option value=\"2014\">2014年\n                  </option><option value=\"2013\">2013年\n                  </option><option value=\"2012\">2012年\n                  </option><option value=\"2011\">2011年\n                  </option><option value=\"2010\">2010年\n                  </option><option value=\"2009\">2009年\n                  </option><option value=\"2008\">2008年\n                  </option><option value=\"2007\">2007年\n                  </option><option value=\"2006\">2006年\n                  </option><option value=\"2005\">2005年\n                  </option><option value=\"2004\">2004年\n                  </option><option value=\"2003\">2003年\n                  </option><option value=\"2002\">2002年\n                  </option><option value=\"2001\">2001年\n                  </option><option value=\"2000\">2000年\n                  </option><option value=\"1999\">1999年\n                  </option><option value=\"1998\">1998年\n                  </option><option value=\"1997\">1997年\n                  </option><option value=\"1996\">1996年\n                  </option><option value=\"1995\">1995年\n                  </option>\n                </select>\n              </div>\n            </div>\n\n\n            <div class=\"rangeBox\">\n              <h3 data-label=\"lb_search_cond_mileage\" placeholder=\"走行距離\">走行距離</h3>\n              <div class=\"selectItem\">\n                <select id=\"search_cond_mileage_from\" class=\"rangeBoxSelect\">\n                  <option value=\"\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</option>\n                  <option value=\"0\" data-label=\"lb_search_cond_mileage_1\" placeholder=\"0km\">0km</option>\n                  <option value=\"1\" data-label=\"lb_search_cond_mileage_2\" placeholder=\"1万km\">1万km</option>\n                  <option value=\"2\" data-label=\"lb_search_cond_mileage_3\" placeholder=\"2万km\">2万km</option>\n                  <option value=\"3\" data-label=\"lb_search_cond_mileage_4\" placeholder=\"3万km\">3万km</option>\n                  <option value=\"4\" data-label=\"lb_search_cond_mileage_5\" placeholder=\"4万km\">4万km</option>\n                  <option value=\"5\" data-label=\"lb_search_cond_mileage_6\" placeholder=\"5万km\">5万km</option>\n                  <option value=\"6\" data-label=\"lb_search_cond_mileage_7\" placeholder=\"6万km\">6万km</option>\n                  <option value=\"7\" data-label=\"lb_search_cond_mileage_8\" placeholder=\"7万km\">7万km</option>\n                  <option value=\"8\" data-label=\"lb_search_cond_mileage_9\" placeholder=\"8万km\">8万km</option>\n                  <option value=\"9\" data-label=\"lb_search_cond_mileage_10\" placeholder=\"9万km\">9万km</option>\n                  <option value=\"10\" data-label=\"lb_search_cond_mileage_11\" placeholder=\"10万km\">10万km</option>\n                  <option value=\"11\" data-label=\"lb_search_cond_mileage_12\" placeholder=\"11万km\">11万km</option>\n                  <option value=\"12\" data-label=\"lb_search_cond_mileage_13\" placeholder=\"12万km\">12万km</option>\n                  <option value=\"13\" data-label=\"lb_search_cond_mileage_14\" placeholder=\"13万km\">13万km</option>\n                  <option value=\"14\" data-label=\"lb_search_cond_mileage_15\" placeholder=\"14万km\">14万km</option>\n                  <option value=\"15\" data-label=\"lb_search_cond_mileage_16\" placeholder=\"15万km\">15万km</option>\n                </select>\n                          ~\n                <select id=\"search_cond_mileage_to\" class=\"rangeBoxSelect\">\n                  <option value=\"\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</option>\n                  <option value=\"0\" data-label=\"lb_search_cond_mileage_1\" placeholder=\"0km\">0km</option>\n                  <option value=\"1\" data-label=\"lb_search_cond_mileage_2\" placeholder=\"1万km\">1万km</option>\n                  <option value=\"2\" data-label=\"lb_search_cond_mileage_3\" placeholder=\"2万km\">2万km</option>\n                  <option value=\"3\" data-label=\"lb_search_cond_mileage_4\" placeholder=\"3万km\">3万km</option>\n                  <option value=\"4\" data-label=\"lb_search_cond_mileage_5\" placeholder=\"4万km\">4万km</option>\n                  <option value=\"5\" data-label=\"lb_search_cond_mileage_6\" placeholder=\"5万km\">5万km</option>\n                  <option value=\"6\" data-label=\"lb_search_cond_mileage_7\" placeholder=\"6万km\">6万km</option>\n                  <option value=\"7\" data-label=\"lb_search_cond_mileage_8\" placeholder=\"7万km\">7万km</option>\n                  <option value=\"8\" data-label=\"lb_search_cond_mileage_9\" placeholder=\"8万km\">8万km</option>\n                  <option value=\"9\" data-label=\"lb_search_cond_mileage_10\" placeholder=\"9万km\">9万km</option>\n                  <option value=\"10\" data-label=\"lb_search_cond_mileage_11\" placeholder=\"10万km\">10万km</option>\n                  <option value=\"11\" data-label=\"lb_search_cond_mileage_12\" placeholder=\"11万km\">11万km</option>\n                  <option value=\"12\" data-label=\"lb_search_cond_mileage_13\" placeholder=\"12万km\">12万km</option>\n                  <option value=\"13\" data-label=\"lb_search_cond_mileage_14\" placeholder=\"13万km\">13万km</option>\n                  <option value=\"14\" data-label=\"lb_search_cond_mileage_15\" placeholder=\"14万km\">14万km</option>\n                  <option value=\"15\" data-label=\"lb_search_cond_mileage_16\" placeholder=\"15万km\">15万km</option>\n                </select>\n              </div>\n            </div>\n\n            <div class=\"rangeBox\">\n              <h3 data-label=\"lb_search_cond_estimation\" placeholder=\"評価点\">評価点</h3>\n              <div class=\"selectItem\">\n                <select id=\"search_cond_estimation_from\" class=\"rangeBoxSelect\">\n                  <option value=\"\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</option>\n                  <option value=\"10\" data-label=\"lb_search_cond_estimation_1\" placeholder=\"S\">S</option>\n                  <option value=\"9\" data-label=\"lb_search_cond_estimation_2\" placeholder=\"6\">6</option>\n                  <option value=\"8\" data-label=\"lb_search_cond_estimation_3\" placeholder=\"5\">5</option>\n                  <option value=\"7\" data-label=\"lb_search_cond_estimation_4\" placeholder=\"4.5\">4.5</option>\n                  <option value=\"6\" data-label=\"lb_search_cond_estimation_5\" placeholder=\"4\">4</option>\n                  <option value=\"5\" data-label=\"lb_search_cond_estimation_6\" placeholder=\"3.5\">3.5</option>\n                  <option value=\"4\" data-label=\"lb_search_cond_estimation_7\" placeholder=\"3\">3</option>\n                  <option value=\"3\" data-label=\"lb_search_cond_estimation_8\" placeholder=\"2\">2</option>\n                  <option value=\"2\" data-label=\"lb_search_cond_estimation_9\" placeholder=\"1\">1</option>\n                  <option value=\"1\" data-label=\"lb_search_cond_estimation_10\" placeholder=\"0\">0</option>\n                </select>\n                            ~\n                <select id=\"search_cond_estimation_to\" class=\"rangeBoxSelect\">\n                  <option value=\"\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</option>\n                  <option value=\"10\" data-label=\"lb_search_cond_estimation_1\" placeholder=\"S\">S</option>\n                  <option value=\"9\" data-label=\"lb_search_cond_estimation_2\" placeholder=\"6\">6</option>\n                  <option value=\"8\" data-label=\"lb_search_cond_estimation_3\" placeholder=\"5\">5</option>\n                  <option value=\"7\" data-label=\"lb_search_cond_estimation_4\" placeholder=\"4.5\">4.5</option>\n                  <option value=\"6\" data-label=\"lb_search_cond_estimation_5\" placeholder=\"4\">4</option>\n                  <option value=\"5\" data-label=\"lb_search_cond_estimation_6\" placeholder=\"3.5\">3.5</option>\n                  <option value=\"4\" data-label=\"lb_search_cond_estimation_7\" placeholder=\"3\">3</option>\n                  <option value=\"3\" data-label=\"lb_search_cond_estimation_8\" placeholder=\"2\">2</option>\n                  <option value=\"2\" data-label=\"lb_search_cond_estimation_9\" placeholder=\"1\">1</option>\n                  <option value=\"1\" data-label=\"lb_search_cond_estimation_10\" placeholder=\"0\">0</option>\n                </select>\n              </div>\n            </div>\n\n            <div class=\"otherConditions\">\n              <h3 data-label=\"lb_search_cond_inspect\" placeholder=\"車検\">車検</h3>\n              <div class=\"ocBox\" id=\"search_cond_inspect\">\n                <label class=\"chkBox_overwrite\">\n                  <input class=\"search_cond_inspect\" type=\"radio\" name=\"search_cond_inspect_value\" value=\"\" id=\"search_cond_inspect_id_\" checked>\n                  <label class=\"chkBox\" for=\"search_cond_inspect_id_\">\n                    <span class=\"searchCondItem\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</span>\n                  </label>\n                </label>\n\n                <label class=\"chkBox_overwrite\">\n                  <input class=\"search_cond_inspect\" type=\"radio\" name=\"search_cond_inspect_value\" value=\"1\" id=\"search_cond_inspect_id_1\">\n                  <label class=\"chkBox\" for=\"search_cond_inspect_id_1\">\n                    <span class=\"searchCondItem\" data-label=\"lb_search_cond_inspect_1\" placeholder=\"あり\">あり</span>\n                  </label>\n                </label>\n\n                <label class=\"chkBox_overwrite\">\n                  <input class=\"search_cond_inspect\" type=\"radio\" name=\"search_cond_inspect_value\" value=\"0\" id=\"search_cond_inspect_id_0\">\n                  <label class=\"chkBox\" for=\"search_cond_inspect_id_0\">\n                    <span class=\"searchCondItem\" data-label=\"lb_search_cond_inspect_2\" placeholder=\"なし\">なし</span>\n                  </label>\n                </label>\n\n                <div class=\"clear\"></div>\n              </div>\n            </div>\n\n            <div class=\"otherConditions\" style=\"display: none;\">\n              <h3 data-label=\"lb_search_cond_shift\" placeholder=\"シフト\">シフト</h3>\n              <div class=\"ocBox\" id=\"search_cond_shift\">\n\n                <label class=\"chkBox_overwrite\">\n                  <input class=\"search_cond_shift\" type=\"radio\" name=\"search_cond_shift_value\" value=\"\" id=\"search_cond_shift_id_\" checked>\n                  <label class=\"chkBox\" for=\"search_cond_shift_id_\">\n                    <span class=\"searchCondItem\" data-label=\"lb_search_cond_none\" placeholder=\"指定なし\">指定なし</span>\n                  </label>\n                </label>\n\n                <label class=\"chkBox_overwrite\">\n                  <input class=\"search_cond_shift\" type=\"radio\" name=\"search_cond_shift_value\" value=\"1\" id=\"search_cond_shift_id_1\">\n                  <label class=\"chkBox\" for=\"search_cond_shift_id_1\">\n                    <span class=\"searchCondItem\" data-label=\"lb_search_cond_shift_1\" placeholder=\"MT\">MT</span>\n                  </label>\n                </label>\n\n                <label class=\"chkBox_overwrite\">\n                  <input class=\"search_cond_shift\" type=\"radio\" name=\"search_cond_shift_value\" value=\"2\" id=\"search_cond_shift_id_2\">\n                  <label class=\"chkBox\" for=\"search_cond_shift_id_2\">\n                    <span class=\"searchCondItem\" data-label=\"lb_search_cond_shift_2\" placeholder=\"AT\">AT</span>\n                  </label>\n                </label>\n\n                <div class=\"clear\"></div>\n              </div>\n            </div>\n\n            <div class=\"clear\"></div>\n\n\n          </div>\n          <div class=\"selectBtn\">検索</div>\n        </div>\n      </li>\n    </ul>\n  </div>\n  <div class=\"changeScreenModal\">\n    <h1 class=\"title\">画像表示数切替</h1>\n    <div class=\"closeBox\"></div>\n    <div class=\"dispSize size1\"></div>\n    <div class=\"dispSize size2\"></div>\n    <div class=\"dispSize size3\"></div>\n  </div>\n  <div class=\"detailModal\">\n      <h1 class=\"title\">詳細情報</h1>\n\n      <div class=\"closeBox\"></div>\n\n      <div class=\"detailBox\">\n          <div class=\"closeBtn\"></div>\n          <h3 id=\"dmCarName\">ハイラックスサーフワゴン　４ＷＤ</h3>\n\n          <img id=\"dmImage\" src=\"http://baku.aucmint.com/stock/0/2013/34563558_1.jpg\" id=\"img201334563558\">\n\n          <div class=\"carInfoModal\">\n              <div class=\"infoDetailsModal\">\n                  <span id=\"dmInventoryNo\">問合No:</span>\n                  <span id=\"dmOutColor\">外装色:</span>\n                  <span id=\"dmRegistrationYear\">年式:1999年01月</span>\n                  <span id=\"dmEstimation\">評価点:</span>\n                  <span id=\"dmMileage\">走行距離:186,980</span>\n              </div>\n              <div class=\"carPriceModal\" id=\"dmPrice\">1,408,000</div>\n          </div>\n      </div>\n\n  </div>\n  <header>\n    <div class=\"main\">\n      <div class=\"maxCount\">検索結果：0件</div>\n      <div class=\"logo\"></div>\n      <div class=\"freeSearch\" style=\"display:block;\">\n        <form id='free_text_search_form'>\n          <select  style=\"display:none;\">\n            <option value='maker_jp'>メーカー</option>\n            <option value='color_jp'>色</option>\n            <option value='body_type_jp'>ボディータイプ</option>\n            <option value='point01'>特記事項</option>\n            <option value='all' selected>すべて</option>\n          </select>\n          <input type='input' />\n          <input type='submit' value='Go'/>\n        </form>\n      </div>\n    </div>\n  </header>\n  <section class=\"content\">\n    <div id=\"scroller_wrapper\">\n      <div id=\"scroller\"></div>\n    </div>\n    <div class=\"clear\"></div>\n  </section>\n\n  <div class=\"menuBtn\"><div class=\"menuBtnTitle\">メニュー</div></div>\n  <ul class=\"menuContainer\">\n    <li class=\"circleCont circ1\" id=\"changeDisp\"><span class=\"icon\"></span><span class=\"text\">表示数変更</span></li>\n    <li class=\"circleCont circ2\" id=\"sort\"><span class=\"icon\"></span><span class=\"text\">ソート</span></li>\n    <li class=\"circleCont circ3\" id=\"search\"><span class=\"icon\"></span><span class=\"text\">検索</span></li>\n  </ul>\n</div>\n";});
});

require.register("views/view", function(exports, require, module) {
(function() {
  var View,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = View = (function(_super) {

    __extends(View, _super);

    function View() {
      View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.template = function() {};

    View.prototype.getRenderData = function() {};

    View.prototype.render = function() {
      this.beforeRender();
      this.$el.html(this.template(this.getRenderData()));
      this.afterRender();
      return this;
    };

    View.prototype.beforeRender = function() {};

    View.prototype.afterRender = function() {};

    View.prototype.showMsgBox = function(message) {
      return alert(message);
    };

    return View;

  })(Backbone.View);

}).call(this);

});


//# sourceMappingURL=app.js.map