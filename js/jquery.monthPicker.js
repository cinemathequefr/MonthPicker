$.widget("nlte.monthPicker", {

  options: {
    monthShortNames: [undefined, "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"],
    monthLongNames: [undefined, "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    minDate: null, // Min date ("yyyy-mm")
    maxDate: null, // Max date ("yyyy-mm")
    selectedDate: null, // Initially selected date ("yyyy-mm")
    isOpen: false, // Is the widget initially open?
    mode: "m", // "m": month, "q": quarter
    select: function () {}
  },

  _create: function () {
    var self = this;
    var $header, $calendar;
    this.$month = $("<table class='mp-month'><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>");
    this.$header = $header = $("<div class='mp-header'><div class='mp-prev'></div><div class='mp-label mp-labelYear'></div><div class='mp-label mp-labelDate'></div><div class='mp-next'></div></div>");
    this.$calendar = $calendar = $("<div class='mp-calendar'><div class='mp-slider'></div></div>");
    this.$slider = $calendar.children(".mp-slider");
    this.$labelYear = $header.children(".mp-labelYear");
    this.$labelDate = $header.children(".mp-labelDate");
    this.$prev = $header.children(".mp-prev");
    this.$next = $header.children(".mp-next");

    $(this.element).append($header);
    $("body").append($calendar);

    // DOM Bindings
    this._on(false, this.$month, {
      "click td:not(.mp-disabled)": function (e) {
        var date = $(e.target).data("date");
        this._setDate(date, e);
        this.close();
      }
    });

    this._on(false, $header, {
      "click .mp-prev:not(.mp-disabled)": function () {
        this._setYear(this.visibleYear - 1);
      },
      "click .mp-next:not(.mp-disabled)": function () {
        this._setYear(this.visibleYear + 1);
      },
      "click .mp-label": this.toggle
    });

    $("html").on("click", function () {
      if (self.isOpen) self.close();
    });

    $header.add($calendar).on("click", function (e) {
      e.stopPropagation();
    });

    $(window).on("resize", self._positionCalendar.bind(self));
  },


  _init: function () {
    this.nowYear = new Date().getFullYear();
    this._setMinMaxDate(this._YM(this.option().minDate), this._YM(this.option().maxDate));
    this.selectedDate = this._validateSelectedDate(this._YM(this.option().selectedDate));

    // TODO: if no selectedDate and nowYear is out of bounds, visibleYear could be the year closest to nowYear
    this.visibleYear = (this.selectedDate.full === null ? this.nowYear : this.selectedDate.year);

    this.$slider.empty().append(this._makeMonthTable(this.visibleYear)); // Redraw

    this.windowWidth = this.$calendar.width();
    this.isOpen = this.option().isOpen;

    if (!this.isOpen) {
      this.$calendar.hide();
    }

    this._positionCalendar();
    this._updateLabelDate();
    this._updateLabelYear();
    this._displayLabel();

    $(window).trigger("resize");

    this._trigger("select", null, { value: this.selectedDate.full }); // Emit initial event
  },


  open: function () {
    if (this.isOpen) {
      return;
    }

    var self = this;

    this._positionCalendar(); // NB: fixes this case: when the vertical scrollbar appears, it causes the calendar position to shift

    this._show(this.$calendar, { effect: "slideDown", duration: 200 }, function () {
      self.isOpen = true;
    });

    this._displayLabel(true); // NB: we explicitly pass the forthcoming value of this.isOpen
  },


  close: function () {
    if (!this.isOpen) {
      return;
    }

    var self = this;

    this._show(this.$calendar, { effect: "slideUp", duration: 200 }, function () {
      if (self.visibleYear !== self.selectedDate.year) {
        self._setYear(self.selectedDate.year, true); // Jump to selectedDate.year without animation
      }

      self.isOpen = false;
      self._displayLabel();
    });
  },


  toggle: function () {
    this[this.isOpen ? "close" : "open"].apply(this);
  },


  setDate: function (strDate) { // Public method (string parameter)
    this._setDate(this._validateSelectedDate(this._YM(strDate)), null, true); // true: we be passed on to _setYear noAnim
  },


  _displayLabel: function (isOpen) { // We may explicitly pass a value for isOpen
    isOpen = (isOpen === undefined ? this.isOpen : isOpen);

    if (!isOpen && this.visibleYear === this.selectedDate.year) {
      this.$labelYear.hide();
      this.$labelDate.show();
    } else {
      this.$labelDate.hide();
      this.$labelYear.show();
    }
  },


  _makeMonthTable: function (year) {
    var self = this;
    var $t = this.$month.clone(true);
    var monthShortNames = this.option().monthShortNames;

    $t.find("td").each(function (i) {
      var $this = $(this);
      var date = self._YM2(year, i + 1);
      $this.data("date", date);
      $this.html(monthShortNames[date.month]);

      if (self._isEqual(date, self.selectedDate)) {
        $this.addClass("mp-selected");
      }

      if (self._isOutOfBounds(date)) {
        $this.addClass("mp-disabled");
      }
    });

    return $t;
  },


  _positionCalendar: function () {
    this.elemX = this.$header.offset().left;
    this.elemY = this.$header.offset().top;
    this.elemWidth = this.$header.outerWidth();
    this.elemHeight = this.$header.outerHeight();
    this.$calendar.css({ top: (this.elemY + this.elemHeight) + "px", left: (this.elemX) + "px" }); // Positions the widget under the element
  },


  _setMinMaxDate: function (minDate, maxDate) {
    if (!(minDate.full === null || maxDate.full === null)) {
      if (this._isLesser(maxDate, minDate)) {
        minDate = maxDate = this._YM(null);  
      }
    }

    this.minDate = minDate;
    this.maxDate = maxDate;
  },


  _setDate: function (date, e, noAnim) {
    if (this._isEqual(date, this.selectedDate) && date.full !== null || this._isOutOfBounds(date)) {
      return;
    }

    this.selectedDate = date;
    this._setYear(date.year, !!noAnim);
    this._trigger("select", e, { value: date.full }); // Emit select event
  },


  _setYear: function (year, noAnim) {
    if (!noAnim) {
      this.open();
    }

    if (year === null || this._isYearOutOfBounds(year)) {
      year = this.nowYear;
    }

    this._slide(this.visibleYear, year, noAnim);
    this.visibleYear = year;
    this._updateLabelYear();
    this._updateLabelDate();
    this._displayLabel();
  },


  _slide: function (fromYear, toYear, noAnim) {
    var $slider = this.$slider;
    fromYear = parseInt(fromYear);
    toYear = parseInt(toYear);

    if ($slider.is(":animated") || isNaN(fromYear) || isNaN(toYear)) {
      return;
    }

    if (fromYear === toYear || !!noAnim) { // Same year: redraw calendar and exit
      this.$slider.empty().append(this._makeMonthTable(toYear));
      return;
    }

    var diffYear = toYear - fromYear;
    var absDiffYear = Math.abs(diffYear);
    var sign = diffYear / absDiffYear;
    var width = (absDiffYear + 1) * this.windowWidth;
    var duration = absDiffYear * this.windowWidth;

    var use = [
      { action: "prepend", cssAlign: { left: "auto", right: 0 } },
      null,
      { action: "append", cssAlign: { left: 0, right: "auto" } }
    ];

    for (var i = 1; i <= Math.abs(diffYear); i++) {
      var year = fromYear + sign * i;
      $slider[use[sign + 1].action](this._makeMonthTable(year));
    }

    $slider.css(use[sign + 1].cssAlign);
    $slider.css({ width: width + "px" });

    if (sign === -1) {
      $slider.animate({ right: (-width + this.windowWidth) + "px" }, duration, function () {
        $slider.css({ left: "auto", right: "auto" }).children(".mp-month").not(":first").remove();
      });
    } else if (sign === 1) {
      $slider.animate({ left: (-width + this.windowWidth) + "px" }, duration, function () {
        $slider.css({ left: "auto", right: "auto" }).children(".mp-month").not(":last").remove();
      });
    }
  },


  _updateLabelDate: function () {
    var d = this.selectedDate;

    if (d.full === null) {
      this.$labelDate.html("");
    } else {
      this.$labelDate.html(this.option().monthLongNames[d.month] + " " + d.year);
    }
  },


  _updateLabelYear: function () {
    var year = this.visibleYear;
    this.$labelYear.html(year);

    // Enables/disables the prev/next controls
    if (this._isYearOutOfBounds(year - 1)) {
      this.$prev.addClass("mp-disabled");
    } else {
      this.$prev.removeClass("mp-disabled");
    }

    if (this._isYearOutOfBounds(year + 1)) {
      this.$next.addClass("mp-disabled");
    } else {
      this.$next.removeClass("mp-disabled");
    }
  },


  _validateSelectedDate: function (d) {
    if (this._isOutOfBounds(d)) {
      return this._YM(null);
    } else {
      return d;
    }
  },


  _YM: function (strDate) { // "yyyy-mm" => { full: "yyyy-mm", year: y, month: m}
    var o;

    if (typeof strDate === "string") {
      o = strDate.match(/^(\d{4})\-(0[1-9]|1[012])/);
      if (o !== null) {
        return {
          full: o[0],
          year: parseInt(o[1], 10),
          month: parseInt(o[2], 10)
        };
      }
    }

    return {
      full: null,
      year: null,
      month: null
    };
  },


  _YM2: function (y, m) { // y, m => { full: "yyyy-mm", year: y, month: m }
    y = parseInt(y, 10);
    m = parseInt(m, 10);

    return {
      full: y + "-" + ("0" + m).slice(-2),
      year: y,
      month: m
    };
  },


  _isEqual: function (date1, date2) {
    return date1.full === date2.full;
  },


  _isLesser: function (date1, date2) {
    return !(
      date1.full === null ||
      date2.full === null ||
      !(date1.year < date2.year || (date1.year === date2.year && date1.month < date2.month))
    );
  },


  _isOutOfBounds: function (date) {
    return (
      this._isLesser(date, this.minDate) ||
      this._isLesser(this.maxDate, date)
    );
  },


  _isYearOutOfBounds: function (year) {
    if (typeof year !== "number") {
      return;
    }

    return (year < (this.minDate.year || undefined) || year > this.maxDate.year || undefined) || false;
  }
});