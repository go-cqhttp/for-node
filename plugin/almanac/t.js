// 抓到的JS,不是自己写的,不用管里面内容

function t() {
  let now = new Date(),
    today = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    },
    gHolidayDropdownCtrl,
    defaultHolidayOpt = {
      value: 'default',
      text: '假期安排',
      selected: 1,
    },
    Utils = {
      doubleDate: function (str) {
        return ('0' + str).slice(-2)
      },
      formatDate: function (date) {
        if (date.year && date.month && date.day)
          date = [date.year, date.month, date.day].join('-')
        return date.replace(/-(\d[^\d])/, '-0$1').replace(/-(\d)$/, '-0$1')
      },
      formatTpl: function (str, obj) {
        return str.replace(/#{([^}]+)}/g, function (match, ret) {
          return obj[ret] || ''
        })
      },
      cutWord: function (str, len) {
        for (var count = 0, code, i = 0; str.charCodeAt(i); ) {
          if (((code = str.charCodeAt(i) > 255 ? 2 : 1), code + count > len))
            return str.slice(0, --i) + '...'
          ;(count += code), i++
        }
        return str.slice(0, i)
      },
      filterListdByStrLen: function (list, len) {
        for (var i = 0; i < list.length; i++)
          if (list[i] && list[i].length <= len) return list[i]
      },
    },
    DataCache = {
      almanacs: {},
      holidays: {},
      classifyAlmanacsByYearMonth: function (almanacs) {
        for (var i = 0, item, newcome = {}; (item = almanacs[i++]); ) {
          if (1 === +item.status) item.holiday = 1
          else if (2 === +item.status) item.work = 1
          else if ('六' === item.cnDay || '日' === item.cnDay) item.weekend = 1
          var ymkey = Utils.formatDate([item.year, item.month].join('-'))
          if (!this.almanacs[ymkey])
            (this.almanacs[ymkey] = [item]), (newcome[ymkey] = true)
          else if (newcome[ymkey]) this.almanacs[ymkey].push(item)
        }
      },
      setHolidays: function (holidays) {
        for (var i = 0, item; (item = holidays[i++]); )
          this.holidays[item.year] = item.list
      },
      getAlmanacsByDate: function (date) {
        if ('object' === typeof date) date = [date.year, date.month].join('-')
        else date = date.split('-').slice(0, 2).join('-')
        var ymkey = Utils.formatDate(date),
          ret = null
        if (this.almanacs[ymkey]) {
          ret = []
          for (var i = 0; i < this.almanacs[ymkey].length; i++)
            ret.push($.extend({}, this.almanacs[ymkey][i]))
        }
        return ret
      },
      getHolidaysByYear: function (year) {
        return this.holidays[year]
      },
      getSingleDate: function (date) {
        for (
          var ymkey = Utils.formatDate([date.year, date.month].join('-')),
            list = this.almanacs[ymkey],
            i = 0;
          i < list.length;
          i++
        )
          if (
            +list[i].year === date.year &&
            +list[i].month === date.month &&
            +list[i].day === date.day
          )
            return list[i]
      },
    },
    CalendarService = {
      fetchAlmanacs: function (date, cb) {
        gthis.ajax(date.year + '年' + date.month + '月', 39043, {
          params: {
            tn: 'wisetpl',
            format: 'json',
          },
          success: function (res) {
            try {
              DataCache.classifyAlmanacsByYearMonth(res[0].almanac), cb()
            } catch (e) {}
          },
        })
      },
      build: function (date) {
        var cndayMap = {
            一: 1,
            二: 2,
            三: 3,
            四: 4,
            五: 5,
            六: 6,
            日: 7,
          },
          currMonthDays = DataCache.getAlmanacsByDate(date)
        if (!currMonthDays) return null
        var prevMonthDate = this.getAdjacentMonthDate(date, -1),
          prevMonthDays = DataCache.getAlmanacsByDate(prevMonthDate),
          headLost = cndayMap[currMonthDays[0].cnDay] - 1
        if (prevMonthDays)
          for (var ds = prevMonthDays.slice(-headLost); headLost-- > 0; ) {
            var d = ds.pop()
            ;(d.othermonth = true), currMonthDays.unshift(d)
          }
        else return null
        var nextMonthDate = this.getAdjacentMonthDate(date, 1),
          nextMonthDays = DataCache.getAlmanacsByDate(nextMonthDate),
          tailLost = 42 - currMonthDays.length
        if (nextMonthDays)
          for (var ds = nextMonthDays.slice(0, tailLost); tailLost-- > 0; ) {
            var d = ds.shift()
            ;(d.othermonth = true), currMonthDays.push(d)
          }
        else return null
        for (var cn = currMonthDays.length, matrix = []; cn > 0; )
          matrix.unshift(currMonthDays.slice(cn - 7, cn)), (cn -= 7)
        return matrix
      },
      getLastDay: function (y, m) {
        return new Date(y, m, 0).getDate()
      },
      getAdjacentMonthDate: function (date, direction) {
        var year = +date.year,
          month = +date.month + direction,
          day = +date.day
        if (-1 === direction && month < 1) (month = 12), year--
        else if (1 === direction && month > 12) (month = 1), year++
        var lastDay = this.getLastDay(year, month)
        if (day > lastDay) day = lastDay
        return {
          year: year,
          month: month,
          day: day,
        }
      },
    }

  return DataCache
}

module.exports = t
