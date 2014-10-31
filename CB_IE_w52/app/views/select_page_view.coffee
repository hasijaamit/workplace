View        = require 'views/view'
template    = require 'views/templates/select_page'
SelectModel = require 'models/select_model'
SelectAjaxModel = require 'models/select_ajax_model'
SelectKaazingModel   = require 'models/select_kaazing_model'

module.exports = class SelectPageView extends View
  id       : 'select_page'
  template : template
  searchTypeWS : 'ws'
  searchTypeAjax : 'ajax'

  #--------------------------------------------------------
  # 初期処理
  #--------------------------------------------------------
  initialize: =>

    @curCondition = 1
    @mDisp        = []
    @myScroll     = ''
    @mTimerId     = ''
    @myScrollOld  = 0

    @mMaxCnt      = 0
    @mMaxPage     = 0

    @mDispWidth   = 0
    @mDispWcnt    = 0
    @mDispHcnt    = 0
    @mDispCnt     = 0
    @mDispWli     = 0
    @mDispHli     = 0
    @mImageW      = 0
    @mImageH      = 0
    @mWindowH     = $(window).height()
    @mDispIdx     = 0

    @mResizeTimer = ''

    @searchType = 'ws' # ajax

    @searchedFlag = false;   # if user click 'search' button tern it true.
    @searchedJSONData = null

    @touchStartTime = null

#    # model定義
#    @selectModel = new SelectModel();
#    @selectModel.bind 'resRanking',   @resRanking
#    @selectModel.bind 'resRead',      @resRead
#    @selectModel.bind 'resPushImage', @resPushImage
#
    @selectAjaxModel = new SelectAjaxModel();
    @selectAjaxModel.bind 'resSearch', @resAjaxSearch
    @selectAjaxModel.bind 'resRead',   @resAjaxRead

    window.kaazingWS = @selectKaazingModel = new SelectKaazingModel()
    @selectKaazingModel.connect()
    @selectKaazingModel.bind 'resRanking',   @resRankingFromKaazing
    @selectKaazingModel.bind 'resSearch',   @resSearchFromKaazing
    @selectKaazingModel.bind 'resRead',   @resReadFromKaazing
    @selectKaazingModel.bind 'resBodyTypeNum', @resBodyTypeNumFromKaazing

    if location.hostname isnt "d29af645urt2e8.cloudfront.net"
      setTimeout(() =>
        $('.freeSearch').css('display', 'none')
      , 500)

    @reconnectInterval = null
#    # websocket接続
#    @connectSocket()

    # タップイベントをＯＳで変える
    if @isPC()
      events=
        "click .changeScreenModal .closeBox" : "evChangeScreenModalCloseBox"
        "click .conditionModal    .closeBox" : "evConditionModalCloseBox"
        "click .nextCond"                    : "evNextCond"
        "click .prevCond"                    : "evPrevCond"
        "click .menuBtn"                     : "evMenuBtn"
        "click #search"                      : "evSearch"
        "click #sort"                        : "evSort"
        "click #changeDisp"                  : "evChangeDisp"
        "click .dispSize"                    : "evDispSize"
        "click .allSelectBtn"                : "evAllSelectBtn"
        "click .selectBtn"                   : "evSelectBtn"
        "click .manufacturer li"             : "evWhereLi"
        "click .colors li"                   : "evWhereLi"
        "click .bodyType li"                 : "evWhereLi"
        "click .sorting button"              : "evSortingButton"
        "submit #free_text_search_form"      : "evFreeTextSearch"
        "click #scroller li"                 : "evShowDetail"
        "click .detailModal .closeBox"       : "evCloseDetail"
        "click .detailModal .closeBtn"       : "evCloseDetail"
        "click .sorting"                     : "evSort"

## **
#        "mousewheel #scroller_wrapper"       : "mouseWheel"
#        "DOMMouseScroll #scroller_wrapper"   : "mouseWheelDOM"
##
      @delegateEvents(events)
    else
      events=
        "touchstart .changeScreenModal .closeBox" : "evChangeScreenModalCloseBox"
        "touchstart .conditionModal    .closeBox" : "evConditionModalCloseBox"
        "touchstart .nextCond"                    : "evNextCond"
        "touchstart .prevCond"                    : "evPrevCond"
        "touchstart .menuBtn"                     : "evMenuBtn"
        "touchstart #search"                      : "evSearch"
        "touchstart #sort"                        : "evSort"
        "touchstart #changeDisp"                  : "evChangeDisp"
        "touchstart .dispSize"                    : "evDispSize"
        "touchstart .allSelectBtn"                : "evAllSelectBtn"
        "touchstart .selectBtn"                   : "evSelectBtn"
        "touchstart .manufacturer li"             : "evWhereLi"
        "touchstart .colors li"                   : "evWhereLi"
        "touchstart .bodyType li"                 : "evWhereLi"
        "touchstart .sorting button"              : "evSortingButton"
        "submit #free_text_search_form"           : "evFreeTextSearch"
        "touchstart #scroller li"                 : "evShowDetail"
        "touchstart .detailModal .closeBox"       : "evCloseDetail"
        "touchstart .detailModal .closeBtn"       : "evCloseDetail"
        "touchstart .sorting"                     : "evSort"
      @delegateEvents(events)

    setTimeout @init, 100

#    setInterval(=>
#      @evPing()
#    , 5000)

    $(window).resize @evReSize

  #--------------------------------------------------------
  # Wheel scroll event callback
  #--------------------------------------------------------
  mouseWheel : (ev) =>
    $wrapper = $(ev.currentTarget)
    if ev.originalEvent.wheelDelta < 0
      # scroll down
      @myScroll.scrollTo(@myScroll.x - 100);
    else
      # scroll up
      @myScroll.scrollTo(@myScroll.x + 100);
    false

  #--------------------------------------------------------
  # Wheel scroll event callback
  #--------------------------------------------------------
  mouseWheelDOM : (ev) =>
    $wrapper = $(ev.currentTarget)
    if ev.originalEvent.detail < 0
      # scroll down
      @myScroll.scrollTo(@myScroll.x - 100);
    else
      # scroll up
      @myScroll.scrollTo(@myScroll.x + 100);
    false

  #--------------------------------------------------------
  # ■定期ping
  #--------------------------------------------------------
#  evPing:=>
#    @selectModel.emitPing()

  #--------------------------------------------------------
  # ●検索受信
  #--------------------------------------------------------
  resPushImage:(json)=>
#    rows = json.dataSet
#    key = rows.inventoryYear + rows.inventoryNo
#    @$("#img"+key).attr("src","data:image/png;base64,"+rows.imageFile)
#    imageUrl = "http://baku.aucmint.com/thumbnails/320x240/"+rows.inventoryNo+"_01.jpg"
#    @$("#img"+key).attr("src",imageUrl)
#    setTimeout(=>
#      @$("#img"+key).parent().css("display","block")
#    , @rnd(5)*200)

  #--------------------------------------------------------
  # ●検索受信
  #--------------------------------------------------------
  evReSize:=>
    clearTimeout @mResizeTimer if @mResizeTimer
    @mResizeTimer = setTimeout(=>
      @mWindowH = $(window).height()
      @setChangeDisp(@mDispIdx)
    , 200)

  resBodyTypeNumMapping:
    12: ".type1"
    10: ".type2"
    11: ".type3"
    14: ".type4"
    15: ".type5"
    16: ".type6"
    13: ".type7"
    20: ".type8"

  resBodyTypeNumFromKaazing:(arr) =>
    for n in [0...arr.length]
      $("ul.bodyType " + @resBodyTypeNumMapping[arr[n][0]] + " span").text(arr[n][1])

  resSearchFromKaazing:(json)=>
    json.messageName = "reqSearch"
    json.dataset = {}
    json.dataset.maxWorkCount = json.maxWorkCount
    json.dataset.data = []
    @resRead json

  buildRegistrationYearFormat: (yyyymm) =>
    if yyyymm.length isnt 6
      return yyyymm
    result = yyyymm.match(/(....)(..)/)
    "#{result[1]}年#{result[2]}月"

  resReadFromKaazing:(json)=>
    modifiedJSON = {}
    modifiedJSON.pageNo = json.pageNo
    modifiedJSON.dataset = {}
    modifiedJSON.dataset.data = []
    modifiedJSON.dataset.resultCount = json.dataSet.length

    for n in json.dataSet
      _o = {}
      _o.carName          = n[0]
      _o.estimation       = n[1]
      _o.inventoryNo      = n[2]
      _o.inventoryYear    = n[3]
      _o.mileage          = String(n[7]).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' );
      _o.registrationYear = @buildRegistrationYearFormat(""+n[5])
      _o.wholesalePrice   = n[6]
      _o.outColor         = n[8]
      modifiedJSON.dataset.data.push _o

    @resRead modifiedJSON

  resAjaxSearch:(json)=>
    @resRead json

  resAjaxRead:(json)=>
    @resRead json

  outColorCdMapping:
    1:"ホワイト"
    2:"パールホワイト"
    3:"ベージュ"
    4:"シルバー"
    5:"グレー"
    6:"ガンメタリック"
    7:"ブラック"
    8:"ピンク"
    9:"パープル"
    10:"ワインレッド"
    11:"レッド"
    12:"イエロー"
    13:"オレンジ"
    14:"ゴールド"
    15:"ブラウン"
    16:"ライトブルー"
    17:"ブルー"
    18:"ダークブルー"
    19:"グリーン"
    20:"マジョーラ"
    21:"その他"

  estimationMapping:
    10:"S"
    9:"6"
    8:"5"
    7:"4.5"
    6:"4"
    5:"3.5"
    4:"3"
    3:"2"
    2:"1"
    1:"0"
    0:"-"

  #--------------------------------------------------------
  # ●検索受信
  #--------------------------------------------------------
  resRead:(json)=>
    cnt  = json.dataset.resultCount
    if json.dataset.data.length is 2 and
       Object.prototype.toString.apply(json.dataset.data[0]) is "[object Object]" and
       Object.prototype.toString.apply(json.dataset.data[1]) is "[object Array]"
      rows = RJSON.unpack(json.dataset.data)
    else
      rows = json.dataset.data

    page = json.pageNo
    if (json.messageName=="reqSearch")
      @mMaxCnt  = json.dataset.maxWorkCount
      @makeScrollArea()
    i = 0
    while i < rows.length
      key=rows[i].inventoryYear+rows[i].inventoryNo
      sizePath = "0"
      if @mDispIdx > 0
        sizePath = "1"

      if rows[i].inventoryYear is 2014
        inventoryYear = 2012
      else
        inventoryYear = rows[i].inventoryYear

      url_path = "stock/#{sizePath}/#{inventoryYear}/#{rows[i].inventoryNo}_1.jpg"
      if i % 2 == 0
        #imageUrl = "http://baku.aucmint.com/thumbnails/#{sizePath}/"+rows[i].inventoryNo+"_01.jpg"
        imageUrl = "http://baku.aucmint.com/#{url_path}"
      else
        #imageUrl = "http://durian.aucmint.com/thumbnails/#{sizePath}/"+rows[i].inventoryNo+"_01.jpg"
        imageUrl = "http://durian.aucmint.com/#{url_path}"

      imageObj = new Image(@mImageW, @mImageH)
      imageObj.onerror = ->
        this.src = "http://baku.aucmint.com/thumbnails/dummy.jpg"
      imageObj.src = imageUrl
      imageObj.id = "img#{key}"

#      html=''
#      html += '<img src="'+imageUrl+'" width='+@mImageW+'px height='+@mImageH+'px id="img'+key+'">'
#      html += '<h3>'+rows[i].carName+'('+imageObj.complete+'/'+rows[i].inventoryNo+')</h3>'
#      html += '<h3>'+rows[i].carName+'</h3>'
#      html += '<div class="carInfo">'
#      html += '<div class="infoDetails">';
#      html += ' <span>年式:'+rows[i].inventoryYear+'</span>'
#      html += ' <span>評価点:'+rows[i].estimation+'</span>'
#      html += ' <span>走行距離:'+rows[i].mileage+'</span>'
#      html += ' </div>'
#      html += '<div class="carPrice">'+@edtComma(rows[i].wholesalePrice)+'</div>'
#      html += '</div>'

      titleH3 = document.createElement('h3')
      $(titleH3).text("#{rows[i].carName}")
      carinfoDiv = document.createElement('div')
      carinfoDiv.className = "carInfo"
      detailDiv = document.createElement('div')
      detailDiv.className = "infoDetails"
      ySpan = document.createElement('span')
      $(ySpan).text("年式:#{rows[i].registrationYear}")
      eSpan = document.createElement('span')
      $(eSpan).text("評価点:#{@estimationMapping[rows[i].estimation]}")
      mSpan = document.createElement('span')
      $(mSpan).text("#{rows[i].mileage}Km")
      iySpan = document.createElement('span')
      $(iySpan).text("#{rows[i].inventoryNo}")

      priceDiv = document.createElement('div')
      priceDiv.className = "carPrice"
      $(priceDiv).text(@edtComma(rows[i].wholesalePrice))

      detailDiv.appendChild ySpan
      detailDiv.appendChild eSpan
      detailDiv.appendChild mSpan
      detailDiv.appendChild iySpan

      carinfoDiv.appendChild detailDiv
      carinfoDiv.appendChild priceDiv

      fragment = document.createDocumentFragment()
      fragment.appendChild imageObj
      fragment.appendChild titleH3
      fragment.appendChild carinfoDiv

      @$("#data"+page+"-"+i).parent().css('backgroundColor', '#222')
#      @$("#data"+page+"-"+i).html( html )
#      @$("#data"+page+"-"+i).append( imageObj )
      @$("#data"+page+"-"+i).append( fragment )
      @$("#data"+page+"-"+i).css("display","block")
      @$("#data"+page+"-"+i).data("inventoryYear", rows[i].inventoryYear)
      @$("#data"+page+"-"+i).data("inventoryNo", rows[i].inventoryNo)
      @$("#data"+page+"-"+i).data("registrationYear", rows[i].registrationYear)
      @$("#data"+page+"-"+i).data("estimation", @estimationMapping[rows[i].estimation])
      @$("#data"+page+"-"+i).data("mileage", rows[i].mileage)
      @$("#data"+page+"-"+i).data("price", @edtComma(rows[i].wholesalePrice))
      @$("#data"+page+"-"+i).data("carName", rows[i].carName)
      @$("#data"+page+"-"+i).data("outColor", @outColorCdMapping[rows[i].outColor])

#      setTimeout(
#        do (page, i) =>
#          =>
#            @$("#data"+page+"-"+i).css("display","block")
#
#        , @rnd(5)*100)
      i++

  #--------------------------------------------------------
  # ●ランキング受信
  #--------------------------------------------------------
  resRanking:(json)=>
    @dispRank('manufacturer',json.dataSet.maker   )
    @dispRank('colors',      json.dataSet.color   )
    @dispRank('bodyType',    json.dataSet.bodyType)

  resRankingFromKaazing:(json)=>
    @dispRank('manufacturer',json.maker   )
    @dispRank('colors',      json.color   )
    @dispRank('bodyType',    json.bodyType)

  #--------------------------------------------------------
  # ●ランキング表示
  #--------------------------------------------------------
  dispRank:(classname,rows)=>
    obj = $("."+classname+' li')
    i = 0
    while i < obj.length
      id = obj.eq(i).attr('data-value')
      $("#s_"+classname+id).html("")
      $("#"+classname+id).html("0")
      i++
    i = 0
    while i < rows.length
      mark=''
      if (i==0)
        mark='★★★'
      if (i==1)
        mark='★★';
      if (i==2)
        mark='★'
      $("#s_"+classname+rows[i].id).html(mark);
      $("#"  +classname+rows[i].id).html(rows[i].score);
      i++

  #--------------------------------------------------------
  # ●ポップアップクローズ（表示数）
  #--------------------------------------------------------
  evChangeScreenModalCloseBox:=>
    $(".changeScreenModal").removeClass("show")

  #--------------------------------------------------------
  # ●ポップアップクローズ（検索条件）
  #--------------------------------------------------------
  evConditionModalCloseBox:=>
    $(".conditionModal"   ).removeClass("show")

  #--------------------------------------------------------
  # ●検索条件移動ボタン
  #--------------------------------------------------------
  evNextCond:=>
    @curCondition+=1
    @changeCondition()

  #--------------------------------------------------------
  # ●検索条件移動ボタン
  #--------------------------------------------------------
  evPrevCond:=>
    @curCondition-=1
    @changeCondition()

  #--------------------------------------------------------
  # ●メニューボタン
  #--------------------------------------------------------
  evMenuBtn:=>
    @changeCondition();
    $(".menuContainer").toggleClass("show")

  #--------------------------------------------------------
  # ●メニューボタン（検索）
  #--------------------------------------------------------
  evSearch:=>
#    @selectModel.emitRank()
    @selectKaazingModel.emitRank()
    $(".conditionModal").addClass("show")

  #--------------------------------------------------------
  # ●メニューボタン（ソート）
  #--------------------------------------------------------
  evSort: (evt)=>
    if evt.target.tagName.toLowerCase() is "button"
      return
    $(".sorting").toggleClass("show")

  #--------------------------------------------------------
  # ●メニューボタン（表示数変更）
  #--------------------------------------------------------
  evChangeDisp:=>
    $(".changeScreenModal").addClass("show")

  #--------------------------------------------------------
  # ●表示数変更
  #--------------------------------------------------------
  evDispSize:(e)=>
    @mDispIdx=0
    if $(e.currentTarget).hasClass("size1")
      @mDispIdx=0
    if $(e.currentTarget).hasClass("size2")
      @mDispIdx=1
    if $(e.currentTarget).hasClass("size3")
      @mDispIdx=2
    $(".dispSize").removeClass("selected")
    $(e.currentTarget).addClass("selected")
    @setChangeDisp(@mDispIdx)
    $(e.currentTarget).parent().addClass("selected").siblings().removeClass("selected")
    $(".changeScreenModal").removeClass("show")
    $(".menuContainer"    ).removeClass("show")
    setTimeout(=>
      @myScroll.scrollLeft(0)
    , 100)

  #--------------------------------------------------------
  # ●全選択／解除ボタン
  #--------------------------------------------------------
  evAllSelectBtn:(e)=>
    $(e.target).toggleClass("active")
    isRemove = false;
    if $(e.target).hasClass("active")
      isRemove=false
    else
      isRemove=true
    classname=".manufacturer"
    if (@curCondition==1)
      classname=".manufacturer"
    if (@curCondition==2)
      classname=".colors"
    if (@curCondition==3)
      classname=".bodyType"
    obj = $(classname+' li')
    i = 0
    while i < obj.length
      if (isRemove==true)
        obj.eq(i).removeClass('active')
      else
        obj.eq(i).addClass('active')
      i++

  #--------------------------------------------------------
  # ●ソートボタン
  #--------------------------------------------------------
  evSortingButton: (event)=>
    target = $(event.currentTarget)
    $parent = target.parent()
    $parent.data('type', target.data('type'))
    console.log "@searchedFlag :", @searchedFlag

    target.siblings().removeClass("ascend")
    target.siblings().removeClass("descend")
    if target.hasClass("ascend")
      target.addClass("descend")
      target.removeClass("ascend")
      $parent.data('order', 1)
    else
      target.addClass("ascend")
      target.removeClass("descend")
      $parent.data('order', 0)
    if @searchedFlag is true
      @searchedJSONData = @addSortOption(@searchedJSONData)
      @selectKaazingModel.emitSearch(@searchedJSONData)

  #--------------------------------------------------------
  #
  #--------------------------------------------------------
  evFreeTextSearch :(event)=>
    searchType = $(event.currentTarget).find("select").val()
    searchValue = $(event.currentTarget).find("input[type='input']").val()
    @searchType = @searchTypeAjax

    @selectAjaxModel.emitSearch(searchType, searchValue, 0, 1);

    event.preventDefault();

  #--------------------------------------------------------
  # ●検索条件選択時
  #--------------------------------------------------------
  evWhereLi:(e)=>
    $(e.currentTarget).toggleClass("active")

  #--------------------------------------------------------
  # ●検索ボタン
  #--------------------------------------------------------
  evSelectBtn:=>
    @searchType = @searchTypeWS
    $(".conditionModal").removeClass("show")
    $(".menuContainer" ).removeClass("show")
    maker = @makeWhere(".manufacturer")
    color = @makeWhere(".colors"      )
    body  = @makeWhere(".bodyType"    )
    other = @makeOtherWhere()
    if (maker.length==0 && color.length==0 && body.length==0)
      alert("検索条件を設定して下さい。")
      return
    json =
      imgSocketId : ''
      makerCd     : maker
      colorCd     : color
      bodyTypeCd  : body
      retCount    : 0
      pageNo      : 0
      estimation  : other.estimation
      inspect     : other.inspect
      mileage     : other.mileage
      modelyear   : other.modelyear
      shift       : other.shift
    json = @addSortOption(json)
#    @selectModel.emitSearch(json)
    @selectKaazingModel.emitSearch(json)
    @selectKaazingModel.emitUpdateRank(json)
    @searchedFlag = true
    @searchedJSONData = json

  evShowDetail: (evt) =>
    now = (new Date()).getTime()
    timesince = now - @touchStartTime;
    if timesince < 200 && timesince > 0
      targetDataElem = $($(evt.currentTarget).children().get(0))
      $("#dmInventoryNo").text("問合No:#{targetDataElem.data("inventoryNo")}")
      $("#dmOutColor").text("外装色:#{targetDataElem.data("outColor")}")
      $("#dmRegistrationYear").text("年式:#{targetDataElem.data("registrationYear")}")
      $("#dmEstimation").text("評価点:#{targetDataElem.data("estimation")}")
      $("#dmMileage").text("走行距離:#{targetDataElem.data("mileage")}Km")
      $("#dmImage").attr('src', targetDataElem.find('img').attr('src'))
      $("#dmPrice").text(targetDataElem.data("price"))
      $("#dmCarName").text(targetDataElem.data("carName"))

      $(".detailModal").addClass("show")

    @touchStartTime = (new Date()).getTime()

  evCloseDetail: (evt) =>
    $(".detailModal").removeClass("show")

  #--------------------------------------------------------
  # Add sort option to JSON object.
  #--------------------------------------------------------
  addSortOption:(json)=>
    sortElem = $('.sorting')
    json.sort = [sortElem.data('type'),sortElem.data('order')]
    json

  #--------------------------------------------------------
  # ■検索条件作成
  #--------------------------------------------------------
  makeWhere:(classname)=>
    rc = []
    obj = @$(classname+' li')
    i = 0
    while i < obj.length
      if obj.eq(i).hasClass('active')
        rc.push obj.eq(i).attr('data-value')
      i++
    return rc

  #--------------------------------------------------------
  # Get model-year/mileage/estimation/inspect/shift
  #--------------------------------------------------------
  makeOtherWhere:()=>
    modelyear_from  = $("#search_cond_modelyear_from").val()
    modelyear_to    = $("#search_cond_modelyear_to").val()
    mileage_from    = $("#search_cond_mileage_from").val()
    mileage_to      = $("#search_cond_mileage_to").val()
    estimation_from = $("#search_cond_estimation_from").val()
    estimation_to   = $("#search_cond_estimation_to").val()
    inspect         = $("input[name='search_cond_inspect_value']:checked").val()
    shift           = $("input[name='search_cond_shift_value']:checked").val()

    {
      modelyear  : [modelyear_from, modelyear_to]
      mileage    : [mileage_from, mileage_to]
      estimation : [estimation_from, estimation_to]
      inspect    : inspect
      shift      : shift
    }

  #--------------------------------------------------------
  # ■リサイズ情報設定
  #--------------------------------------------------------
  setChangeDisp:(idx)=>
    if (idx==0)
      @mDispWcnt = 3
      @mDispHcnt = 2
      @mDispHli  = Math.floor( @mWindowH/@mDispHcnt )-44
    if (idx==1)
      @mDispWcnt = 4
      @mDispHcnt = 3
      @mDispHli  = Math.floor( @mWindowH/@mDispHcnt )-36
    if (idx==2)
      @mDispWcnt = 5
      @mDispHcnt = 4
      @mDispHli  = Math.floor( @mWindowH/@mDispHcnt )-30
    @mDispWli   = Math.floor( @mDispHli*1.4 )
    @mDispWidth = @mDispWcnt*@mDispWli+( 8*2*@mDispWcnt )
    @mDispCnt   = @mDispWcnt*@mDispHcnt
    @mImageW    = @mDispWli
    @mImageH    = @mDispHli
    @makeScrollArea()

  #--------------------------------------------------------
  # ■スクロールエリア作成
  #--------------------------------------------------------
  makeScrollArea:=>
    console.log "makeScrollArea called.."
    @$(".maxCount").html('検索結果：'+@edtComma(@mMaxCnt)+'件')
    @mMaxPage = Math.ceil(@mMaxCnt/@mDispCnt)
    if (@mMaxPage>100)
      @mMaxPage=100
    html="";
    i = 0
    while i < @mMaxPage
      @mDisp[i]=false
      html += "<ul>"
      j = 0
      while j < @mDispCnt
        cnt = ((j % @mDispWcnt)*@mDispHcnt)+Math.floor(j/@mDispWcnt)
        html += '<li><div id="data'+i+'-'+cnt+'"></div></li>'
        j++
      html += "</ul>"
      i++
    @$("#scroller").html(html)
    @$("#scroller ul").css("width", @mDispWidth+"px")
    @$("#scroller li").css("width", @mDispWli+"px")
    @$("#scroller li").css("height",@mDispHli+"px")
    @$("#scroller").css("width",@mMaxPage*@mDispWidth+"px")
##
#    @myScroll.refresh()
#    @myScroll.scrollToPage(0)
##
    @myScroll.scrollLeft(0)
##
    if (@mTimerId)
      clearInterval(@mTimerId);

    @updateScrollArea()
#    console.log "scrolling : ", $("#scroller_wrapper").get(0)
#    scrolling($("#scroller_wrapper").get(0), @updateScrollArea);
#    $("#scroller_wrapper").scroll =>
#        @updateScrollArea()

    @mTimerId = setInterval(=>
      @updateScrollArea()
    , 200)

  #--------------------------------------------------------
  # ■スクロールエリア更新(タイマーで定期的にコール)
  #--------------------------------------------------------
  updateScrollArea:=>
##
#    if Math.abs(@myScroll.x - @myScrollOld) > Math.floor(@mDispWidth/4)
#      @myScrollOld = @myScroll.x
#      return
#    @myScrollOld = @myScroll.x
#    html = ""
#    scroll = Math.floor(-@myScroll.x)
##
    if Math.abs(@myScroll.scrollLeft() - @myScrollOld) > Math.floor(@mDispWidth/4)
      @myScrollOld = @myScroll.scrollLeft()
      return
    @myScrollOld = @myScroll.scrollLeft()
    html = ""
    scroll = Math.floor(-@myScroll.scrollLeft()) * -1
##

    i = 0
#    console.log "scroll : #{scroll} / @mDispWidth : #{@mDispWidth} / mMaxPage : #{@mMaxPage}"
    while i < @mMaxPage
      old = @mDisp[i]
      if Math.abs(Math.floor((scroll-@mDispWidth/2) / @mDispWidth) - i) > 3
        @mDisp[i] = false
      else
        @mDisp[i] = true
      unless @mDisp[i] is old
        if @mDisp[i] is false
          j = 0
          while j < @mDispCnt
            @$("#data" + i + "-" + j).html ""
            j++
        else
          # ページ取得
#          console.log "scroll : #{scroll} / @mDisp[#{i}] : #{@mDisp[i]} / @mDisp[#{i}] : #{@mDisp[i]}"
          if @searchType is @searchTypeAjax
            @selectAjaxModel.emitRead i * @mDispCnt, @mDispCnt, i
          else
            json = {}
            $.extend(json, @searchedJSONData)
            json.imgSocketId = ''
            json.startIndex  = i * @mDispCnt
            json.retCount    = @mDispCnt
            json.pageNo      = i
#            @selectModel.emitRead json
            @selectKaazingModel.emitRead(json)
      i++

  getBodyTypeNum: =>
    maker = @makeWhere(".manufacturer")
    color = @makeWhere(".colors"      )
    json =
      makerCd     : maker
      colorCd     : color

    @selectKaazingModel.emitBodyTypeNum(json)

  #--------------------------------------------------------
  # ■検索条件ページ遷移
  #--------------------------------------------------------
  changeCondition:=>
    if (@curCondition == 2)
      $(".searchSlider").css("left", "-100%")
      $(".nextCond,.prevCond").show(0)
    else
      if (@curCondition == 3)
        @getBodyTypeNum()
        $(".searchSlider").css("left", "-200%")
        $(".nextCond").show(0)
        $(".prevCond").show(0)
      else if(@curCondition == 4)
        $(".searchSlider").css("left", "-300%")
        $(".nextCond").hide(0)
        $(".prevCond").show(0)
      else
        @curCondition = 1
        $(".searchSlider").css("left", "0%")
        $(".prevCond").hide(0)

  clearScrollArea: =>
    $('#scroller').html('')
    @curCondition = 1
    @mDisp        = []
    @mTimerId     = ''
    @myScrollOld  = 0

    @mMaxCnt      = 0
    @mMaxPage     = 0
    @$(".maxCount").html('検索結果：0件')

  reconnectSocket: (con)=>
    return if @reconnectInterval != null
    @reconnectInterval = setInterval(=>
          con.socket.reconnect()
    , 500)

  #--------------------------------------------------------
  # ■websocket接続
  #--------------------------------------------------------
  connectSocket: =>
    max_reconnects = 100
    con1SocketOption = _.extend {
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
        }, Backbone.AUCNET.SOCKETIO_OPTION

    con1 = io.connect(Backbone.AUCNET.CONST.WS_DAT_URI+'/index', con1SocketOption)
    con1.on 'connect', =>
      if @reconnectInterval == null
        Backbone.AUCNET.socket_dat= con1
        @selectModel.setSocketDat(con1);
      clearInterval(@reconnectInterval)
      @reconnectInterval = null
    con1.on 'reconnect', =>
      console.log "con1 : reconnect", arguments
      @clearScrollArea()
    con1.on 'connecting', =>
      console.log "con1 : connecting", arguments
    con1.on 'connect_failed', =>
      console.log "con1 : connect_failed", arguments
    con1.on 'reconnect_failed', =>
      console.log "con1 : reconnect_failed", arguments
    con1.on 'disconnect', =>
      console.log "con1 : disconnect", arguments
      @reconnectSocket(con1)
    con1.on "reconnecting", (delay, attempt) ->
      console.log "attempting reconnect - " + attempt
      if attempt is max_reconnects
        console.log "all reconnect attempts failed"
    con1.socket.on 'error',(reason) =>
      console.log "con1 : socket error", reason

    con2SocketOption = _.extend {resource: 'b3011'}, Backbone.AUCNET.SOCKETIO_OPTION
    con2 = io.connect(Backbone.AUCNET.CONST.WS_IMG_URI, con2SocketOption)
    con2.on 'connect', =>
      Backbone.AUCNET.socket_dat= con2
      @selectModel.setSocketImg(con2);
    con2.socket.on 'error',(reason) =>
      console.log "con2 : socket error", reason

  #--------------------------------------------------------
  # ■描画後処理
  #--------------------------------------------------------
  afterRender: =>
    @makeWhereMaker()
    @makeWhereColor();
    @makeWhereBodyType();
    @$(".dispSize.size1").addClass("selected");

  #--------------------------------------------------------
  # ■初期処理
  #--------------------------------------------------------
  init:=>
##
#    @myScroll = new iScroll('scroller_wrapper',{useTransition: false, vScroll : false})
##
    @myScroll = $("#scroller_wrapper")
##
    @setChangeDisp(@mDispIdx)

  #--------------------------------------------------------
  # ■検索条件（メーカー）作成
  #--------------------------------------------------------
  makeWhereMaker:=>
    json=[
      {classname:"toyota",    colname:"Toyota",    id:"00"}
      {classname:"honda",     colname:"Honda",     id:"20"}
      {classname:"nissan",    colname:"Nissan",    id:"10"}
      {classname:"mitsubishi",colname:"Mitsubishi",id:"30"}
      {classname:"mazda",     colname:"Mazda",     id:"40"}
      {classname:"subaru",    colname:"Subaru",    id:"50"}
      {classname:"daihatsu",  colname:"Daihatsu",  id:"80"}
      {classname:"suzuki",    colname:"Suzuki",    id:"60"}
      {classname:"domestic",  colname:"Domestic",  id:"DC"}
      {classname:"imported",  colname:"imported",  id:"IC"}
    ]
    html=""
    for obj in json
      id ="manufacturer"+obj.id
      html+="<li class='"+obj.classname+"' data-type='メーカー' data-name='"+obj.colname+"' data-value='"+obj.id+"'>"
      html+="<div class='rankStar' id='s_"+id+"'></div>"
      html+="<div class='searchCount' id='"+id+"'></div>"
      html+="<span></span>"
      html+="</li>"
    @$(".manufacturer").html(html)

  #--------------------------------------------------------
  # ■検索条件（色）作成
  #--------------------------------------------------------
  makeWhereColor:=>
    json=[
      {classname:"color2", colname:"ホワイト",      id:"1" }
      {classname:"color3", colname:"パールホワイト",id:"2" }
      {classname:"color4", colname:"ベージュ",      id:"3" }
      {classname:"color5", colname:"シルバー",      id:"4" }
      {classname:"color6", colname:"グレー",        id:"5" }
      {classname:"color7", colname:"ガンメタリック",id:"6" }
      {classname:"color8", colname:"ブラック",      id:"7" }
      {classname:"color9", colname:"ピンク",        id:"8" }
      {classname:"color10",colname:"パープル",      id:"9" }
      {classname:"color11",colname:"ワインレッド",  id:"10"}
      {classname:"color12",colname:"レッド",        id:"11"}
      {classname:"color13",colname:"イエロー",      id:"12"}
      {classname:"color14",colname:"オレンジ",      id:"13"}
      {classname:"color15",colname:"ゴールド",      id:"14"}
      {classname:"color16",colname:"ブラウン",      id:"15"}
      {classname:"color17",colname:"ライトブルー",  id:"16"}
      {classname:"color18",colname:"ブルー",        id:"17"}
      {classname:"color19",colname:"ダークブルー",  id:"18"}
      {classname:"color20",colname:"グリーン",      id:"19"}
      {classname:"color21",colname:"マジョーラ",    id:"20"}
      {classname:"color22",colname:"その他",        id:"21"}
    ]
    html=""
    for obj in json
      id ="colors"+obj.id
      html+="<li class='"+obj.classname+"' data-type='色' data-name='"+obj.colname+"' data-value='"+obj.id+"'>"
      html+="<div class='searchCount' id='"+id+"'></div>"
      html+="<span></span>"
      html+="<div class='rankStar' id='s_"+id+"'></div>"
      html+="<label>"+obj.colname+"</label>"
      html+="</li>"
    @$(".colors").html(html)

  #--------------------------------------------------------
  # ■検索条件（ボディタイプ）作成
  #--------------------------------------------------------
  makeWhereBodyType:=>
    json=[
      {classname:"type1",colname:"ハッチバック",      id:"12"}
      {classname:"type2",colname:"セダン",            id:"10"}
      {classname:"type3",colname:"クーペ",            id:"11"}
      {classname:"type4",colname:"ステーションワゴン",id:"14"}
      {classname:"type5",colname:"ワゴン",            id:"15"}
      {classname:"type6",colname:"ＳＵＶ",            id:"16"}
      {classname:"type7",colname:"コンバーチブル",    id:"13"}
      {classname:"type8",colname:"トラック",          id:"20"}
    ]
    html=""
    for obj in json
      id ="bodyType"+obj.id
      html+="<li class='"+obj.classname+"' data-type='ボディタイプ' data-name='"+obj.colname+"' data-value='"+obj.id+"'>"
      html+="<div class='rankStar' id='s_"+id+"'></div>"
      html+="<div class='searchCount' id='"+id+"'></div>"
      html+="<label>"+obj.colname+"</label>"
      html+="<span>0</span>"
      html+="</li>"
    @$(".bodyType").html(html)

  #--------------------------------------------------------
  # ■乱数処理
  #--------------------------------------------------------
  rnd:(val)->
    return Math.floor(Math.random()*val)

  #--------------------------------------------------------
  # ■カンマ編集
  #--------------------------------------------------------
  edtComma:(num)=>
    return String( num ).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' );

  #--------------------------------------------------------
  # ■OS判定
  #--------------------------------------------------------
  isPC:=>
    mUa = navigator.userAgent;
    if( /iPhone/.test(mUa) || /iPod/.test(mUa) || /iPad/.test(mUa) || /Android/.test(mUa) )
      return false;
    else
      return true;
