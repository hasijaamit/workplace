Model = require 'models/model'

module.exports = class SelectAjaxModel extends Model

  type: null
  value: null
  url: '/2013-01-01/search'
#  url: 'https://baku.aucmint.com/w30/asdf'

  initialize: ->
    _.bindAll @

  buildQueryParams:(type, value, startIndex, size) ->
    if type is 'all'
      {
        q: value
        start: startIndex
        size: size
      }
    else
      {
        q: "#{type}:'#{value}'"
        start: startIndex
        size: size
        'q.parser': 'structured'
      }

  convertJSONFormat: (json, messageName, pageNo) ->

    convert2YYYYMM = (yyyymm) ->
      if yyyymm.length isnt 6
        yyyymm
      else if(r = yyyymm.match(/(....)(..)/))
        "#{r[1]}年#{r[2]}月"

    dataConverted = []
    if messageName is "reqRead"
      for n in json.hits.hit
        dataConvertedObject = {}
        dataConvertedObject["estimation"] = ""
        for key of n.fields
          [k, v] = switch key
            when "car_name" then ["carName", n.fields[key]]
            when "mileage"  then ["mileage", n.fields[key]]
            when "inventory_number"  then ["inventoryNo", n.fields[key]]
            when "inventory_year"  then ["inventoryYear", n.fields[key]]
            when "registration_year"  then ["registrationYear", convert2YYYYMM(n.fields[key])]
            when "price"  then ["wholesalePrice", n.fields[key]]
            when "estimation"  then ["estimation", n.fields[key] || ""]
            else [undefined, undefined]
          if k isnt undefined
            dataConvertedObject[k] = v

        dataConverted.push dataConvertedObject

    resultCount = json.hits.hit.length
    maxWorkCount = json.hits.found
    result =
      messageName:  messageName
      pageNo:       pageNo
      dataset:
        resultCount:  resultCount
        maxWorkCount: maxWorkCount
        data: dataConverted

    result

  emitSearch:(type, value, startIndex, size) ->
    @type = type
    @value = value
    $.ajax
      type: 'GET',
      url: @url
      dataType: 'json',
      data: @buildQueryParams(type, value, startIndex, size)
      success: (json) =>
        @trigger 'resSearch', @convertJSONFormat(json, "reqSearch", 0)
      error: (err) =>
        console.log "error: ", err

  emitRead:(startIndex, size, pageNo) ->
    $.ajax
      type: 'GET',
      url: @url
      dataType: 'json',
      data: @buildQueryParams(@type, @value, startIndex, size)
      success: (json) =>
        @trigger 'resRead', @convertJSONFormat(json, "reqRead", pageNo)
      error: (err) =>
        console.log "error: ", err
