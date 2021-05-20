A.merge("calendar_pc", function() {
    A.setup(function() {
        var T = A.baidu, gthis = this, data = gthis.data.tplData, srcid = gthis.data.srcId, gSelectDay = gthis.data.selectday, gSelectDate = {
            year: +gSelectDay[0],
            month: +gSelectDay[1],
            day: +gSelectDay[2]
        }, gTimer1, gTimer2, now = new Date, today = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        }, gContainer = gthis.find(".op-calendar-pc")[0], gSelectedTd = null, showHoliday = data.showHoliday, gTableBox = gthis.find(".op-calendar-pc-table-box tbody")[0], gRightBox = gthis.find(".op-calendar-pc-right")[0], gDropdownCtrl, gDropDownBox = gthis.find(".op-calendar-pc-select-box")[0], gBackTodayBtn = gthis.find(".op-calendar-pc-backtoday")[0], gPrevMonth = gthis.find(".op-calendar-pc-prev-month")[0], gNextMonth = gthis.find(".op-calendar-pc-next-month")[0], gHolidayTip = gthis.find(".op-calendar-pc-holidaytip")[0], gYearDropdownCtrl, gMonthDropdownCtrl, gHolidayDropdownCtrl, defaultHolidayOpt = {
            value: "default",
            text: "假期安排",
            selected: 1
        }, Utils = {
            doubleDate: function(str) {
                return ("0" + str).slice(-2)
            },
            formatDate: function(date) {
                if (date.year && date.month && date.day)
                    date = [date.year, date.month, date.day].join("-");
                return date.replace(/-(\d[^\d])/, "-0$1").replace(/-(\d)$/, "-0$1")
            },
            formatTpl: function(str, obj) {
                return str.replace(/#{([^}]+)}/g, function(match, ret) {
                    return obj[ret] || ""
                })
            },
            cutWord: function(str, len) {
                for (var count = 0, code, i = 0; str.charCodeAt(i); ) {
                    if (code = str.charCodeAt(i) > 255 ? 2 : 1,
                    code + count > len)
                        return str.slice(0, --i) + "...";
                    count += code,
                        i++
                }
                return str.slice(0, i)
            },
            filterListdByStrLen: function(list, len) {
                for (var i = 0; i < list.length; i++)
                    if (list[i] && list[i].length <= len)
                        return list[i]
            }
        }, DataCache = {
            almanacs: {},
            holidays: {},
            classifyAlmanacsByYearMonth: function(almanacs) {
                for (var i = 0, item, newcome = {}; item = almanacs[i++]; ) {
                    if (1 === +item.status)
                        item.holiday = 1;
                    else if (2 === +item.status)
                        item.work = 1;
                    else if ("六" === item.cnDay || "日" === item.cnDay)
                        item.weekend = 1;
                    var ymkey = Utils.formatDate([item.year, item.month].join("-"));
                    if (!this.almanacs[ymkey])
                        this.almanacs[ymkey] = [item],
                            newcome[ymkey] = true;
                    else if (newcome[ymkey])
                        this.almanacs[ymkey].push(item)
                }
            },
            setHolidays: function(holidays) {
                for (var i = 0, item; item = holidays[i++]; )
                    this.holidays[item.year] = item.list
            },
            getAlmanacsByDate: function(date) {
                if ("object" === typeof date)
                    date = [date.year, date.month].join("-");
                else
                    date = date.split("-").slice(0, 2).join("-");
                var ymkey = Utils.formatDate(date)
                    , ret = null;
                if (this.almanacs[ymkey]) {
                    ret = [];
                    for (var i = 0; i < this.almanacs[ymkey].length; i++)
                        ret.push($.extend({}, this.almanacs[ymkey][i]))
                }
                return ret
            },
            getHolidaysByYear: function(year) {
                return this.holidays[year]
            },
            getSingleDate: function(date) {
                for (var ymkey = Utils.formatDate([date.year, date.month].join("-")), list = this.almanacs[ymkey], i = 0; i < list.length; i++)
                    if (+list[i].year === date.year && +list[i].month === date.month && +list[i].day === date.day)
                        return list[i]
            }
        }, CalendarService = {
            fetchHolidays: function() {
                var def = $.Deferred();
                return gthis.ajax("法定节假日", 39042, {
                    params: {
                        tn: "wisetpl",
                        format: "json"
                    },
                    success: function(res) {
                        try {
                            DataCache.setHolidays(res[0].holiday),
                                def.resolve()
                        } catch (e) {
                            def.reject()
                        }
                    }
                }),
                    def.promise()
            },
            fetchAlmanacs: function(date, cb) {
                gthis.ajax(date.year + "年" + date.month + "月", 39043, {
                    params: {
                        tn: "wisetpl",
                        format: "json"
                    },
                    success: function(res) {
                        try {
                            DataCache.classifyAlmanacsByYearMonth(res[0].almanac),
                                cb()
                        } catch (e) {}
                    }
                })
            },
            build: function(date) {
                var cndayMap = {
                    "一": 1,
                    "二": 2,
                    "三": 3,
                    "四": 4,
                    "五": 5,
                    "六": 6,
                    "日": 7
                }
                    , currMonthDays = DataCache.getAlmanacsByDate(date);
                if (!currMonthDays)
                    return null;
                var prevMonthDate = this.getAdjacentMonthDate(date, -1)
                    , prevMonthDays = DataCache.getAlmanacsByDate(prevMonthDate)
                    , headLost = cndayMap[currMonthDays[0].cnDay] - 1;
                if (prevMonthDays)
                    for (var ds = prevMonthDays.slice(-headLost); headLost-- > 0; ) {
                        var d = ds.pop();
                        d.othermonth = true,
                            currMonthDays.unshift(d)
                    }
                else
                    return null;
                var nextMonthDate = this.getAdjacentMonthDate(date, 1)
                    , nextMonthDays = DataCache.getAlmanacsByDate(nextMonthDate)
                    , tailLost = 42 - currMonthDays.length;
                if (nextMonthDays)
                    for (var ds = nextMonthDays.slice(0, tailLost); tailLost-- > 0; ) {
                        var d = ds.shift();
                        d.othermonth = true,
                            currMonthDays.push(d)
                    }
                else
                    return null;
                for (var cn = currMonthDays.length, matrix = []; cn > 0; )
                    matrix.unshift(currMonthDays.slice(cn - 7, cn)),
                        cn -= 7;
                return matrix
            },
            getLastDay: function(y, m) {
                return new Date(y,m,0).getDate()
            },
            getAdjacentMonthDate: function(date, direction) {
                var year = +date.year
                    , month = +date.month + direction
                    , day = +date.day;
                if (-1 === direction && month < 1)
                    month = 12,
                        year--;
                else if (1 === direction && month > 12)
                    month = 1,
                        year++;
                var lastDay = this.getLastDay(year, month);
                if (day > lastDay)
                    day = lastDay;
                return {
                    year: year,
                    month: month,
                    day: day
                }
            }
        }, CalendarController = {
            SELECTED_CLASS: "op-calendar-pc-table-selected",
            WEEKEND_CLASS: "op-calendar-pc-table-weekend",
            init: function(date) {
                var matrix = CalendarService.build(date);
                this.buildTable(matrix),
                    this.buildRightBox(date)
            },
            buildRightBox: function(date) {
                var html = ""
                    , buildDate = function(date) {
                    var tpl = '<p class="op-calendar-pc-right-date">#{date}</p>                        <p class="op-calendar-pc-right-day">#{day}</p>                        <p class="op-calendar-pc-right-lunar c-gap-top-small">                            <span>#{lDate}</span><span>#{gzYear}</span><span>#{gzDate}</span>                        </p>';
                    return Utils.formatTpl(tpl, {
                        date: Utils.formatDate(date),
                        day: date.day,
                        lDate: date.lMonth.replace(/^一/i, "正").replace("十二", "腊") + "月" + date.lDate,
                        gzYear: date.gzYear + "年 " + date.animal,
                        gzDate: date.gzMonth + "月 " + date.gzDate + "日"
                    })
                }
                    , buildAlmanac = function(date) {
                    var holids = [];
                    [date.festival, date.term, date.desc, date.value].forEach(function(item) {
                        if (item)
                            holids.push(item)
                    });
                    var holid1 = holids[0]
                        , holid2 = holids[1];
                    if (holid1 && holid2 && (holid1 === holid2 || -1 !== holid1.indexOf(holid2) || -1 !== holid2.indexOf(holid1)))
                        holid2 = null;
                    var tpl = (holid1 ? '<p class="op-calendar-pc-right-holid1">#{holid1}</p>' : "") + (holid2 ? '<p class="op-calendar-pc-right-holid2">#{holid2}</p>' : "") + '<div class="op-calendar-pc-right-almanacbox">                            <div class="op-calendar-pc-right-almanac">                                <span class="op-calendar-pc-right-suit"><i>宜</i>#{suit}</span>                                <span class="op-calendar-pc-right-avoid"><i>忌</i>#{avoid}</span>                            </div>                            <div class="op-calendar-hover-almanac">                                <span class="op-calendar-hover-suit"><i>宜</i>#{suitAll}</span>                                <span class="op-calendar-hover-avoid"><i>忌</i>#{avoidAll}</span>                            </div>                        </div>'
                        , suitAll = date.suit ? date.suit.split(".").slice(0, -1) : []
                        , avoidAll = date.avoid ? date.avoid.split(".").slice(0, -1) : []
                        , num = 9;
                    return [holid1, holid2].forEach(function(h) {
                        if (h)
                            num -= h.length > 6 ? 4 : 2
                    }),
                        Utils.formatTpl(tpl, {
                            holid1: holid1,
                            holid2: holid2,
                            suit: suitAll.slice(0, num).join("<br/>"),
                            avoid: avoidAll.slice(0, num).join("<br/>"),
                            suitAll: suitAll.join("、"),
                            avoidAll: avoidAll.join("、")
                        })
                };
                if (html += buildDate(date),
                    html += buildAlmanac(date),
                    gRightBox.innerHTML = html,
                date.suit && date.avoid && date.suit.length + date.avoid.length > 0)
                    almanacBox = gthis.find(".op-calendar-pc-right-almanacbox"),
                        almanacBox.on("mouseover", function() {
                            clearTimeout(gTimer1),
                                gTimer1 = setTimeout(function() {
                                    almanacBox.addClass("op-calendar-pc-right-hover")
                                }, 300)
                        }),
                        almanacBox.on("mouseout", function() {
                            clearTimeout(gTimer1),
                                gTimer1 = setTimeout(function() {
                                    almanacBox.removeClass("op-calendar-pc-right-hover")
                                }, 100)
                        })
            },
            buildThead: function() {
                if (this.thead)
                    return this.thead;
                else
                    return this.thead = "<tr>{一}{二}{三}{四}{五}{!六}{!日}</tr>",
                        this.thead = this.thead.replace(/\{\!?|\}/g, function(match) {
                            return "{" == match ? "<th>" : "{!" == match ? '<th class="' + this.WEEKEND_CLASS + '">' : "</th>"
                        }),
                        this.thead
            },
            buildTbody: function(matrix) {
                for (var REST_CLASS = "op-calendar-pc-table-rest", WORK_CLASS = "op-calendar-pc-table-work", FESTIVAL_CLASS = "op-calendar-pc-table-festival", TODAY_CLASS = "op-calendar-pc-table-today", OTHER_MONTH_CLASS = "op-calendar-pc-table-other-month", tbody = "", tdTpl = '<td>                        <div class="op-calendar-pc-relative">                            <a href="javascript:void(0);" #{title} data-click="{fm:\'beha\'}" hidefocus="true" class="#{classname}" date="#{date}">                                #{tag}                                <span class="op-calendar-pc-daynumber">#{day}</span>                                <span class="op-calendar-pc-table-almanac">#{almanac}</span>                            </a>                        </div>                    </td>', i = 0; i < matrix.length; i++) {
                    var tr = matrix[i];
                    tbody += "<tr>";
                    for (var j = 0; j < tr.length; j++) {
                        var td = tr[j]
                            , classname = [];
                        if (+td.year === +gSelectDate.year && +td.month === +gSelectDate.month && +td.day === +gSelectDate.day)
                            classname.push(this.SELECTED_CLASS);
                        if ("六" === td.cnDay || "日" === td.cnDay)
                            classname.push(this.WEEKEND_CLASS);
                        if (td.festival || td.term || td.desc || td.value)
                            classname.push(FESTIVAL_CLASS);
                        if (td.othermonth)
                            classname.push(OTHER_MONTH_CLASS);
                        else if (+td.year === today.year && +td.month === today.month && +td.day === today.day)
                            classname.push(TODAY_CLASS);
                        var tag = '<span class="op-calendar-pc-table-holiday-sign">#{text}</span>';
                        if (td.holiday)
                            classname.push(REST_CLASS),
                                tag = Utils.formatTpl(tag, {
                                    text: "休"
                                });
                        else if (td.work)
                            classname.push(WORK_CLASS),
                                tag = Utils.formatTpl(tag, {
                                    text: "班"
                                });
                        else
                            tag = "";
                        tbody += Utils.formatTpl(tdTpl, {
                            tag: tag,
                            date: [td.year, td.month, td.day].join("-"),
                            classname: classname.join(" "),
                            day: td.day,
                            almanac: Utils.filterListdByStrLen([td.festival, td.term, td.desc, td.value, td.lDate], 4)
                        })
                    }
                    tbody += "</tr>"
                }
                return tbody
            },
            buildTable: function(matrix) {
                gTableBox.innerHTML = this.buildTbody(matrix)
            },
            onSelectChange: function(td) {
                if (td) {
                    var date = $(td).attr("date");
                    if (!date)
                        return;
                    $("." + this.SELECTED_CLASS).removeClass(this.SELECTED_CLASS),
                        $(td).addClass(this.SELECTED_CLASS),
                        gSelectedTd = td;
                    var darr = date.split("-");
                    if (+darr[1] !== +gSelectDate.month)
                        this.onDateChange("date", date);
                    else {
                        var selectDate = {
                            year: +darr[0],
                            month: +darr[1],
                            day: +darr[2]
                        };
                        if (selectDate.day !== +gSelectDate.day)
                            gHolidayDropdownCtrl.setIndex(0);
                        gSelectDate = DataCache.getSingleDate(selectDate),
                            this.buildRightBox(gSelectDate),
                            this.setHolidayStyle(gSelectDate)
                    }
                }
            },
            onDateChange: function(type, date) {
                var _this = this
                    , year = +gSelectDate.year
                    , month = +gSelectDate.month
                    , day = +gSelectDate.day
                    , yearChange = false;
                if ("year" === type)
                    year = +date;
                else if ("month" === type) {
                    if (month = +date,
                    month < 1)
                        month = 12,
                            year--;
                    else if (month > 12)
                        month = 1,
                            year++
                } else if ("holiday" === type || "date" === type) {
                    var dd = date.split("-");
                    year = +dd[0],
                        month = +dd[1],
                        day = +dd[2]
                } else if ("today" === type)
                    year = date.year,
                        month = date.month,
                        day = date.day;
                var lastDay = CalendarService.getLastDay(year, month);
                if (day > lastDay)
                    day = lastDay;
                var selectDate = {
                    year: year,
                    month: month,
                    day: day
                };
                if (selectDate.year !== +gSelectDate.year)
                    yearChange = true;
                var matrix = CalendarService.build(selectDate)
                    , updateCalendar = function(date, matrix) {
                    if (_this.buildTable(matrix),
                        _this.buildRightBox(date),
                        _this.setHolidayStyle(date),
                        gMonthDropdownCtrl.setIndex(+date.month - 1),
                        gYearDropdownCtrl.setIndex(+date.year - 1900),
                    "holiday" !== type)
                        gHolidayDropdownCtrl.setIndex(0);
                    if (yearChange)
                        _this.resetHolidayDropdown(date.year)
                };
                if (matrix)
                    gSelectDate = DataCache.getSingleDate(selectDate),
                        updateCalendar(gSelectDate, matrix);
                else
                    CalendarService.fetchAlmanacs(selectDate, function() {
                        gSelectDate = DataCache.getSingleDate(selectDate),
                            matrix = CalendarService.build(selectDate),
                            updateCalendar(gSelectDate, matrix)
                    })
            },
            setHolidayStyle: function(date) {
                for (var blacklist = ["五四", "立夏", "寒露", "清明"], toggle = date.holiday && (date.desc || date.value || date.term), i = 0; i < blacklist.length; i++) {
                    if (date.term && date.term.indexOf(blacklist[i]) >= 0) {
                        toggle = false;
                        break
                    }
                    if (date.desc && date.desc.indexOf(blacklist[i]) >= 0) {
                        toggle = false;
                        break
                    }
                }
                $(gContainer).toggleClass("op-calendar-pc-holidaystyle", !!toggle)
            },
            resetHolidayDropdown: function(year) {
                gHolidayDropdownCtrl.removeAll(),
                    gHolidayDropdownCtrl.add(defaultHolidayOpt);
                for (var holidayList = DataCache.getHolidaysByYear(year), i = 0; i < holidayList.length; i++)
                    gHolidayDropdownCtrl.add({
                        value: holidayList[i].date,
                        text: holidayList[i].name
                    })
            },
            toggleHolidayTip: function(date) {
                if (date.desc || date.value) {
                    var tpl = '<span class="op-calendar-new-holidaytip-icon">○<i>!</i></span>                        <p>#{desc}</p>                        <p>#{rest}</p>';
                    gHolidayTip.style.display = "block",
                        gHolidayTip.innerHTML = Utils.formatTpl(tpl, {
                            desc: date.desc,
                            rest: date.rest
                        })
                } else
                    gHolidayTip.style.display = "none"
            }
        }, asyncd = CalendarService.fetchHolidays();
        DataCache.classifyAlmanacsByYearMonth(data.almanac),
            gSelectDate = DataCache.getSingleDate(gSelectDate),
            CalendarController.init(gSelectDate),
            A.use("dropdown21", function() {
                gDropdownCtrl = A.ui.dropdown21;
                var initDropdown = function(data, defaultIndex, boxClass, onchange, onopen) {
                    var cache = [];
                    if ("[object Array]" !== Object.prototype.toString.call(data))
                        for (var i = data.min; i <= data.max; i++)
                            cache.push({
                                value: i,
                                text: i + data.unit,
                                selected: i == defaultIndex
                            });
                    else
                        cache = data;
                    return gDropdownCtrl(cache, {
                        appendTo: gthis.find("." + boxClass)[0],
                        number: 12,
                        onchange: onchange,
                        onopen: onopen
                    })
                };
                gYearDropdownCtrl = initDropdown({
                    min: 1900,
                    max: 2050,
                    unit: "年"
                }, gSelectDate.year, "op-calendar-pc-year-box", function(obj) {
                    CalendarController.onDateChange("year", obj.item.value)
                }),
                    gMonthDropdownCtrl = initDropdown({
                        min: 1,
                        max: 12,
                        unit: "月"
                    }, gSelectDate.month, "op-calendar-pc-month-box", function(obj) {
                        CalendarController.onDateChange("month", obj.item.value)
                    }),
                    gHolidayDropdownCtrl = initDropdown([defaultHolidayOpt], "default", "op-calendar-pc-holiday-box", function(obj) {
                        var value = obj.item.value;
                        if ("default" != value)
                            CalendarController.onDateChange("holiday", value)
                    }),
                    asyncd.then(function() {
                        CalendarController.resetHolidayDropdown(gSelectDate.year),
                            gDropDownBox.style.visibility = "visible"
                    }),
                    $(gContainer).delegate("a", "click", function(e) {
                        e.preventDefault(),
                            CalendarController.onSelectChange(this)
                    }),
                    $(gBackTodayBtn).click(function() {
                        CalendarController.onDateChange("today", today)
                    }),
                    $(gPrevMonth).click(function() {
                        CalendarController.onDateChange("month", +gSelectDate.month - 1)
                    }),
                    $(gNextMonth).click(function() {
                        CalendarController.onDateChange("month", +gSelectDate.month + 1)
                    })
            }),
            this.dispose = function() {
                clearTimeout(gTimer1),
                    clearInterval(gTimer2),
                gDropdownCtrl && gDropdownCtrl.dispose && gDropdownCtrl.dispose()
            }
    });
});
A.merge("right_recommends_merge", function() {
    A.setup(function() {
        function bindLayers($btns, a) {
            if (bds.se && bds.se.tip)
                $.each($btns, function(i, v) {
                    var $v = $(v)
                        , $parent = $v.parents(".opr-recommends-merge-item")
                        , $layer = $parent.find(".opr-recommends-merge-layer-p")
                        , $contentHtml = $layer.find(".opr-recommends-merge-layer")
                        , x = getX($v);
                    $.each($contentHtml.find("img"), function(i, v) {
                        var $v = $(v);
                        if ($v.attr("data-img"))
                            $v.attr("src", $v.attr("data-img"))
                    });
                    var tip = new bds.se.tip({
                        target: v,
                        align: "right",
                        content: $contentHtml,
                        arrow: {
                            offset: x
                        },
                        offset: {
                            x: x,
                            y: 25
                        }
                    });
                    obj.push({
                        dom: v,
                        tip: tip
                    })
                })
        }
        var _this = this
            , $layerbtns = _this.find(".opr-recommends-merge-layerbtn")
            , $moreBtn = _this.find(".opr-recommends-merge-more-btn")
            , $dodgeBtn = _this.find(".opr-recommends-merge-dodge")
            , $dodgeTip = _this.find(".opr-recommends-merge-dodge-tip")
            , $content = _this.find(".opr-recommends-merge-content")
            , obj = []
            , pageFormat = bds.comm.containerSize
            , showType = _this.data.showType
            , getX = function($o) {
            $o = $($o);
            var $container = $(_this.container)
                , x = $container.width() - ($o.offset().left - $container.offset().left) - $o.width()
                , maxX = 185;
            if (x < 0)
                x = 0;
            else if (x > maxX)
                x = maxX;
            return x
        };
        if ($dodgeBtn[0] && function() {
            $dodgeBtn.click(function() {
                var $this = $(this);
                if ($content.toggle(),
                "隐藏信息" == $this.html()) {
                    if ("1" == showType)
                        $.setCookie("BD_CON_LEVEL", "1", {
                            expires: 15552e6
                        });
                    else
                        $.removeCookie("BD_CON_LEVEL");
                    $this.html("继续浏览"),
                        $dodgeTip.html("以下图片可能让您感觉不适，您可以")
                } else {
                    if ($this.html("隐藏信息"),
                    "1" == showType)
                        $.removeCookie("BD_CON_LEVEL");
                    else
                        $.setCookie("BD_CON_LEVEL", "1", {
                            expires: 15552e6
                        });
                    $dodgeTip.html("如果以下图片让您感觉不适，您可以")
                }
            })
        }(),
        "pc" == _this.data.platform)
            bds.event.on("se.window_resize", function() {
                if (bds.comm.containerSize !== pageFormat)
                    pageFormat = bds.comm.containerSize,
                        $.each(obj, function(i, v) {
                            var tip = v.tip
                                , _x = getX(v.dom);
                            tip.setOffset({
                                x: _x
                            }),
                                tip.setArrow({
                                    offset: _x
                                })
                        })
            }),
                bds.event.on("se.api_tip_ready", function() {
                    bindLayers($layerbtns)
                }),
                bindLayers($layerbtns);
        $moreBtn.on("click", function() {
            var $this = $(this)
                , dom_this = $this[0];
            if ($moreTxt = $this.find("span"),
                $moreIcon = $this.find(".c-icon"),
                $panel = $this.parent().next(".opr-recommends-merge-panel"),
            !dom_this.moreLists && (dom_this.moreLists = []),
                $this.hasClass("opr-recommends-merge-close")) {
                if ($moreTxt.text("展开"),
                bds && bds.comm && bds.comm.samContentNewStyle)
                    $moreIcon.text("");
                else
                    $moreIcon.removeClass("c-icon-chevron-top").addClass("c-icon-chevron-bottom");
                $(dom_this.moreLists).hide()
            } else {
                if ($moreTxt.text("收起"),
                bds && bds.comm && bds.comm.samContentNewStyle)
                    $moreIcon.text("");
                else
                    $moreIcon.addClass("c-icon-chevron-top").removeClass("c-icon-chevron-bottom");
                if (!dom_this.moreLists.length) {
                    var $textarea = $panel.find(".opr-recommends-merge-more-textarea")
                        , $moreLayerBtns = [];
                    $panel.append($textarea.val()),
                        $textarea.remove(),
                        dom_this.moreLists = $panel.find(".opr-recommends-merge-morelists"),
                        $moreLayerBtns = dom_this.moreLists.find(".opr-recommends-merge-layerbtn");
                    var $_imgs = dom_this.moreLists.find(".opr-recommends-merge-img");
                    $.each($_imgs, function(i, v) {
                        var $v = $(v);
                        $v.attr("src", $v.attr("data-img"))
                    });
                    var $_imgsB = dom_this.moreLists.find(".opr-recommends-merge-imgtext");
                    if ($_imgsB.parent().remove(),
                    "pc" == _this.data.platform)
                        bds.event.on("se.api_tip_ready", function() {
                            bindLayers($moreLayerBtns)
                        }),
                            bindLayers($moreLayerBtns, 1)
                } else
                    $(dom_this.moreLists).show()
            }
            $this.toggleClass("opr-recommends-merge-close")
        });
        var $userIcon = _this.find(".opr-recommends-merge-user-layer-icon")
            , $layerCon = _this.find(".opr-recommends-merge-user-layer-con")
            , $layerp1 = _this.find(".opr-recommends-merge-user-layer-p1")
            , $layerp2 = _this.find(".opr-recommends-merge-user-layer-p2");
        $layerCon.on("click", function(e) {
            e.preventDefault()
        }),
            $userIcon.hover(function() {
                $layerCon.removeClass("opr-recommends-merge-user-layer-hide"),
                ns_c && ns_c({
                    item: "right_recommends_merge",
                    act: "user_hover",
                    qid: bds.comm.qid
                })
            }, function() {
                $layerCon.addClass("opr-recommends-merge-user-layer-hide")
            }),
            $userIcon.on("click", function(e) {
                e.preventDefault()
            }),
            $layerCon.hover(function() {
                $layerCon.removeClass("opr-recommends-merge-user-layer-hide")
            }, function() {
                $layerCon.addClass("opr-recommends-merge-user-layer-hide")
            });
        var userLayerTimer;
        $layerCon.find("button").on("click", function() {
            $layerp1.remove(),
                $layerCon.find("button").remove(),
                $layerp2.text("感谢您的反馈"),
                userLayerTimer = setTimeout(function() {
                    $userIcon.hide(),
                        $layerCon.css("z-index", "999"),
                        $layerCon.fadeOut()
                }, 600)
        }),
            _this.dispose = function() {
                userLayerTimer && clearTimeout(userLayerTimer),
                    $layerCon.stop()
            }
    });
});
A.merge("right_toplist1", function() {
    A.setup(function() {
        var _this = this
            , $tb = _this.find("tbody")
            , $refresh = _this.find(".toplist-refresh-btn")
            , $a = _this.find(".FYB_RD tbody a")
            , currentPage = 0;
        if (_this.data.num > 0)
            $refresh.on("click", function(e) {
                if (currentPage < _this.data.num - 1)
                    ++currentPage;
                else
                    currentPage = 0;
                $tb.hide(),
                    $tb.eq(currentPage).show(),
                    e.preventDefault()
            });
        $a.each(function(i) {
            $a.eq(i).attr("href", $a.eq(i).attr("href") + "&rqid=" + window.bds.comm.qid)
        });
        var pn = 15
            , reRender = function() {
            var $tr = _this.find("tr")
                , reg = new RegExp("(^|&)rsf=([^&]*)","i");
            $tb.each(function(i) {
                $tb.eq(i).html($tr.slice(i * pn, Math.min((i + 1) * pn), $tr.length - i * pn))
            }),
                _this.data.num = Math.ceil($tr.length / pn),
                $a.each(function(i) {
                    var new_href = $a.eq(i).attr("href").replace(reg, function(value) {
                        var valueArr = value.slice(5).split("_");
                        if (valueArr[3] % 15 == 0)
                            valueArr[1] = valueArr[3] - 14,
                                valueArr[2] = valueArr[3];
                        else if (valueArr[1] = valueArr[3] - valueArr[3] % 15 + 1,
                            valueArr[2] = valueArr[3] - valueArr[3] % 15 + 15,
                        valueArr[2] > $a.length)
                            valueArr[2] = $a.length;
                        return "&rsf=" + valueArr.join("_")
                    });
                    $a.eq(i).attr("href", new_href)
                })
        };
        $(window).on("swap_end", function(e, cacheItem) {
            if (1 === $("#con-ar").children(".result-op").length && !$("#con-ar").hasClass("nocontent"))
                reRender()
        })
    });
});
