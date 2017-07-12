jQuery.fn.datePicker = function (userOptions) {
    var model = {};
    model.options = {
        mainClass: 'datePicker',
        toleranceUp: 10,
        toleranceDown: 10,
        pairFrom: undefined,
        pairTo: undefined,
        double: false,
        isCalendar: false,
        spaceDays: 0,
        startFrom: undefined,
        speed: 200,
        calendar: undefined,
        cookieLife: 365,
        cookiePrefix: 'datePicker',
        format: 'dd MMMM yyyy',
        selector: this
    };
    var mainFormat = 'yyyy/MM/dd';
    var defaultCalendar = 'grg';

    var calendars = [{ Title: datePickerSwitch.persian, Value: 'hsh' }, { Title: datePickerSwitch.gregorian, Value: 'grg' }];
    var persianNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    var getPersianNum = function (number) {
        return number.toString().replace(/0/g, persianNums[0]).replace(/1/g, persianNums[1]).replace(/2/g, persianNums[2]).replace(/3/g, persianNums[3]).replace(/4/g, persianNums[4]).replace(/5/g, persianNums[5]).replace(/6/g, persianNums[6]).replace(/7/g, persianNums[7]).replace(/8/g, persianNums[8]).replace(/9/g, persianNums[9]);
    }

    var elemCalendar = model.options.mainClass + 'Calendar';
    var elemYear = model.options.mainClass + 'Year';
    var elemMonth = model.options.mainClass + 'Month';
    var elemPopup = model.options.mainClass + 'Popup';
    var elemSelectCalendar = model.options.mainClass + 'SelectCalendar';
    var elemPopupDouble = model.options.mainClass + 'PopupDouble';
    var elemPopupNoneDouble = model.options.mainClass + 'PopupNoneDouble';
    var elemSelects = model.options.mainClass + 'Selects';
    var elemPage = model.options.mainClass + 'Page';
    var elemPageMonth = model.options.mainClass + 'PageMonth';
    var elemSide = model.options.mainClass + 'Side';
    var mainValue = 'input[type=hidden]';
    var showValue = 'input[type=text]';

    var setCookie = function (name, value) {
        var date = new Date();
        date.setTime(date.getTime() + (model.options.cookieLife * 1000 * 60 * 60 * 24))
        document.cookie = model.options.cookiePrefix + name + '=' + value + '; ' + 'expires=' + date.toGMTString() + '; path=/';
    }
    var getCookie = function (name) {
        name = model.options.cookiePrefix + name + '=';
        var dump = document.cookie.split(';');
        for (var count = 0; count < dump.length; count++) {
            var word = dump[count].trim();
            if (word.indexOf(name) == 0) return word.substring(name.length, word.length);
        }
        return null;
    }

    var setCalendar = function (Value) {
        model.options.calendar = Value;
        setCookie('Calendar', Value);
    };
    var getCalendar = function () {
        var calendar = model.options.calendar;
        if (calendar == undefined) {
            calendar = getCookie('Calendar');
            if (calendar == null) {
                calendar = defaultCalendar;
                setCalendar(defaultCalendar);
            }
        }
        return calendar;
    };

    var langCookie = function getCookie(cname) {
        try {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
        } catch (e) {
        }
    }
    if (langCookie('langISG') != '' && langCookie('langISG') != undefined && langCookie('langISG') != 'fa-IR' && getCookie('Calendar') == null) {
        model.options.calendar = 'grg';
        setCalendar('grg');
    }
    if (getCookie('Calendar') == null && langCookie('langISG') == 'fa-IR') {
        model.options.calendar = 'hsh';
        setCalendar('hsh');
    }

    var getMainValue = function ($Selector) {
        if ($Selector == undefined) $Selector = getWrapper();
        return $(mainValue, $Selector);
    }
    var getShowValue = function () {
        return model.options.selector;
    }
    var getPopup = function () {
        return $('.' + elemPopup, getWrapper());
    }
    var getControl = function () {
        return model.options.selector.closest('.' + model.options.mainClass)
    }
    var getWrapper = function () {
        return model.options.selector.closest('.' + model.options.mainClass + 'Control')
    }

    var render = function () {
        $.extend(model.options, userOptions);

        var $Wrapper = $('<div></div>').addClass(model.options.mainClass + 'Control');
        var $Control = $('<div></div>').addClass(model.options.mainClass)
        $Wrapper.addClass(model.options.mainClass + getCalendar());
        if (model.options.isCalendar) {
            $Wrapper.addClass(elemSelectCalendar);
            $Control.hide();
        }

        if (model.options.pairFrom != undefined)
            $Control.addClass(model.options.mainClass + 'From');
        if (model.options.pairTo != undefined)
            $Control.addClass(model.options.mainClass + 'To');

        $Wrapper.append($Control);
        model.options.selector.after($('<div></div>').addClass(model.options.mainClass + 'Wrapper').append($Wrapper));

        $Control.append(model.options.selector);
        model.options.selector.attr('readonly', 'readonly');
        model.options.selector.val(model.options.selector.attr('value'));

        var jStart = getStartFrom();
        if (model.options.selector.val() != '' && stringToJdate(model.options.selector.val()) < jStart) {
            model.options.selector.val(Format(jDateToDate(jStart), model.options.format));
        }

        var $Input = $('<input type="hidden" />').val('');
        if (model.options.selector.attr('name') != undefined) {
            $Input.attr('name', model.options.selector.attr('name'));
            model.options.selector.removeAttr('name');
        }
        $Control.append($Input);

        //var $Close = $('<i></i>').addClass(model.options.mainClass + 'Close').hide();
        //$Control.append($Close);

        if (model.options.selector.val() != undefined && model.options.selector.val() != '') {
            model.setValue(model.options.selector.val());
        }

        var $Popup = $('<div></div>').addClass(elemPopup);
        $Popup.append($('<i></i>').addClass(model.options.mainClass + 'Icon'));
        if (model.options.double)
            $Popup.addClass(elemPopupDouble);
        else
            $Popup.addClass(elemPopupNoneDouble);

        if (model.options.isCalendar == false) $Popup.hide();

        var $Selects = $('<div></div>').addClass(elemSelects);

        var $Calendar = $('<select></select>').addClass(elemCalendar).hide();
        for (var count = 0; count < calendars.length; count++) {
            $Calendar.append($('<option></option>').html(calendars[count].Title).val(calendars[count].Value));
        }
        $Calendar.val(getCalendar());

        if (model.options.double == false) $Selects.append($Calendar);

        changeCalendar($Selects);

        var $Side = $('<div></div>').addClass(elemSide);
        $Selects.append($Side);

        $Popup.append($Selects);

        if (model.options.double) {
            $Selects.hide();

            var $Navigate = $('<div></div>').addClass(model.options.mainClass + 'Navigate');

            var $ControlNext = $('<div class="fa fa-angle-left"></div>').addClass(model.options.mainClass + 'Next').html('');
            $ControlNext.click(function () {
                var $CurrentMonth = $('.' + elemMonth, getPopup());
                var $CurrentYear = $('.' + elemYear, getPopup());
                var maxYear = $('option:first', $CurrentYear).val();
                var minYear = $('option:last', $CurrentYear).val();

                if (parseInt($CurrentMonth.val()) == 12) {
                    if (parseInt($CurrentYear.val()) < maxYear && parseInt($CurrentYear.val()) >= minYear) {
                        $CurrentYear.val(parseInt($CurrentYear.val()) + 1);
                        $CurrentMonth.val(1).change();
                    }
                }
                else {
                    $CurrentMonth.val(parseInt($CurrentMonth.val()) + 1).change();
                }
            });
            $Navigate.append($ControlNext);

            var $ControlPrev = $('<div class="fa fa-angle-right"></div>').addClass(model.options.mainClass + 'Prev').html('');
            $ControlPrev.click(function () {
                var $CurrentMonth = $('.' + elemMonth, getPopup());
                var $CurrentYear = $('.' + elemYear, getPopup());
                var maxYear = $('option:first', $CurrentYear).val();
                var minYear = $('option:last', $CurrentYear).val();

                if (parseInt($CurrentMonth.val()) == 1) {
                    if (parseInt($CurrentYear.val()) <= maxYear && parseInt($CurrentYear.val()) > minYear) {
                        $CurrentMonth.val(12).change();
                        $CurrentYear.val(parseInt($CurrentYear.val()) - 1).change();
                    }
                }
                else {
                    $CurrentMonth.val(parseInt($CurrentMonth.val()) - 1).change();
                }
            });
            $Navigate.append($ControlPrev);

            var $MonthLeft = $('<div></div>').addClass(model.options.mainClass + 'MonthLeft');
            $Navigate.append($MonthLeft);
            var $MonthRight = $('<div></div>').addClass(model.options.mainClass + 'MonthRight');
            $Navigate.append($MonthRight);

            $Navigate.append($Calendar);

            $Popup.append($Navigate);
        }

        var $Page = $('<div></div>').addClass(elemPage);
        $Popup.append($Page);

        $Wrapper.append($Popup);

        disable();

        if ((model.options.pairFrom == undefined)) {
            $Calendar.switch({
                checked: 'grg',
                unchecked: 'hsh',
                labelOnHand: true,
                cssClass: elemCalendar + 'Switch'
            });
        }

        $Input.change(function () {
            if ($(this).val() == '')
                getShowValue().val($(this).val()).change();
            else
                getShowValue().val(Format(toCalender(stringToDate($(this).val(), 'grg')), model.options.format)).change();
        });

        $Wrapper.on('change', '.' + elemCalendar, function () {
            var $wrapper = getWrapper();
            var selectedCalendar = $(this).val();
            if ($(this).attr('data-prevVal') == selectedCalendar) return;

            $(this).attr('data-prevVal', selectedCalendar);
            setCalendar(selectedCalendar);
            $wrapper.removeClass(model.options.mainClass + calendars[0].Value);
            $wrapper.removeClass(model.options.mainClass + calendars[1].Value);
            $wrapper.addClass(model.options.mainClass + selectedCalendar);
            changeCalendar($Selects);
            changeDate($Popup);

            $('.' + elemCalendar).each(function () {
                if ($(this).val() != selectedCalendar)
                    $(this).val(selectedCalendar).change();
            });
        });

        $Wrapper.on('change', '.' + elemYear + ', .' + elemMonth, function () {
            var $Year = $('.' + elemYear, getWrapper());
            var $Month = $('.' + elemMonth, getWrapper());
            var year = parseInt($Year.val());
            var month = parseInt($Month.val());

            var startFrom = getStartFrom();
            if (model.options.double && startFrom != undefined) {
                var startPair = getStartDate();// getStartPair();
                var minDate = DateToJdate(intToDate(year, month, toCalender(jDateToDate(startFrom)).day, getCalendar()));
                if ((startPair != undefined && startPair.getFullYear() == minDate.getFullYear() && startPair.getMonth() == minDate.getMonth()) || startFrom <= minDate) {
                    $Year.attr('data-value', year);
                    $Month.attr('data-value', month);
                    disable();
                } else {
                    $Year.val($Year.attr('data-value'));
                    $Month.val($Month.attr('data-value'));
                    return false;
                }
            }

            var selectedValue = getMainValue().val();
            if (selectedValue != undefined && selectedValue != '') {
                var jdate = stringToJdate(selectedValue);
                var date = toCalender(jDateToDate(jdate));

                var day = date.day;

                if (date.calendar == 'hsh') {
                    var toDate = new DateToJdate(toGregorian({ year: year, month: month, day: day, calendar: getCalendar() }));
                }
                else if (date.calendar == 'grg') {
                    var toDate = new DateToJdate(toGregorian({ year: year, month: month, day: day, calendar: getCalendar() }));
                }

                var startDate = getStartFrom();
                if (startDate == undefined || toDate >= startDate)
                    selectDate(jDateToDate(toDate), 'auto');
                else if (model.options.double && jDateAddMonths(toDate, 1) >= startDate)
                    selectDate(jDateToDate(jDateAddMonths(toDate, 1)), 'auto');
            }

            changeDate($Popup);
            model.options.selector.focus();
        });

        if (model.options.isCalendar) {
            bindDate();
        }
        else {
            model.options.selector.click(function () {
                $(this).focus();
            });
            model.options.selector.focus(function () {
                var $CurrentPopup = getPopup();
                if ($CurrentPopup.is(':visible') == false) {
                    var $Control = getControl();
                    var $Wrapper = getWrapper();

                    bindDate();

                    $CurrentPopup.css('top', ($Wrapper.css('position').toLowerCase() == 'relative' ? $Control.outerHeight(true) + 'px' : ($Control.position().top + $Control.outerHeight()) + 'px'));
                    var width = $CurrentPopup.width();
                    var height = $CurrentPopup.height();
                    $('.' + model.options.mainClass + 'Close', $Control).show();
                    $CurrentPopup.slideDown(model.options.speed);
                    $('.' + elemCalendar, $CurrentPopup).change();
                }
            });
            $Wrapper.on('click', '.' + model.options.mainClass + 'Close', function () {
                $(this).hide();
                getPopup().slideUp(model.options.speed);
            });

            $Wrapper.on('click', '.' + elemPopup + ',.' + elemPopup + ' *', function (event) {
                if ($(this).hasClass('datePickerMonth') || $(this).hasClass('datePickerYear')) {
                    event.stopPropagation();
                    return;
                }
                model.options.selector.focus();
                event.stopPropagation();
            });

            var closeInterval;
            model.options.selector.focus(function () {
                clearInterval(closeInterval);
            });
            model.options.selector.blur(function () {

                var $Input = $(this);
                var $CurrentWrapper = getControl();
                var $CurrentPopup = getPopup();
                var yearSelectIsSelected = false;
                var monthSelectIsSelected = false;
                var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                if (isSafari) {
                    $Selects.children('.datePickerYear')[0].on('click', function () { yearSelectIsSelected = true; });
                    $Selects.children('.datePickerMonth')[0].on('click', function () { monthSelectIsSelected = true; });
                }
                else {
                    $Selects.children('.datePickerYear').on('click', function () { yearSelectIsSelected = true; });
                    $Selects.children('.datePickerMonth').on('click', function () { monthSelectIsSelected = true; });
                }

                closeInterval = setTimeout(function () {
                    if (($Input.is(':focus') == false) && !yearSelectIsSelected && !monthSelectIsSelected) {
                        $('.' + model.options.mainClass + 'Close', $Control).hide();
                        $CurrentPopup.slideUp(model.options.speed);
                    }
                }, 300);
            });

            model.options.selector.change(function () {
                var $CurrentPopup = getPopup();
                var $MainVal = getMainValue();
                if ($MainVal.attr('data-manual') == 'true') {
                    $('.' + model.options.mainClass + 'Close', $Control).hide();
                    $CurrentPopup.slideUp(model.options.speed);
                }
            });
        }

        if (model.options.pairFrom != undefined) {
            $(mainValue, $(model.options.pairFrom).closest('.' + model.options.mainClass + 'Control')).change(function () {
                if ($(this).val() == '' || ($(this).attr('data-manual') != 'true' && $(this).attr('data-auto') != 'true')) return;

                var $MainVal = getMainValue();
                var jFromDate = DateToJdate(stringToDate($(this).val(), 'grg'));
                var jToDate = DateToJdate(stringToDate($MainVal.val(), 'grg'));

                if (jToDate == undefined) {
                    $('.' + elemYear, getPopup()).val(toCalender(jDateToDate(jFromDate)).year);
                    $('.' + elemMonth, getPopup()).val(toCalender(jDateToDate(jFromDate)).month);

                    if ($(this).attr('data-manual') == 'true')
                        setTimeout(function () { model.options.selector.focus(); }, 100);
                }
                else {
                    if ($(this).attr('data-auto') == 'true') {
                        var preFromDate = $(this).attr('data-value') || $(this).val();
                        var jPreFromDate = DateToJdate(stringToDate(preFromDate, 'grg'));

                        var days = (jToDate.getTime() - jPreFromDate.getTime()) / (24 * 60 * 60 * 1000);
                        jFromDate.setDate(jFromDate.getDate() + days);

                        $MainVal.val(Format(jDateToDate(jFromDate), mainFormat)).change();
                    }
                    else if ($(this).attr('data-manual') == 'true') {
                        jFromDate = jDateAddDays(jFromDate, model.options.spaceDays);
                        if (jToDate == undefined || jFromDate >= jToDate)
                            $MainVal.val(Format(jDateToDate(jFromDate), mainFormat)).change();
                        setTimeout(function () { model.options.selector.focus(); }, 100);
                    }
                }
            });
            $Calendar.hide();
            $('.' + elemCalendar, $(model.options.pairFrom).closest('.' + model.options.mainClass + 'Control')).change(function () {
                $('.' + elemCalendar, getWrapper()).val($(this).val()).change();
            });
        }
    };
    var bindDate = function () {
        var $CurrentPopup = getPopup();
        var $MainVal = getMainValue();
        if ($MainVal.val() != '') {
            var date = toCalender(stringToDate($MainVal.val(), 'grg'));
            if (model.options.double && model.options.pairFrom != undefined && getMainValue($(model.options.pairFrom).closest('.' + model.options.mainClass + 'Control')).val() != '') {
                var pairFromdate = toCalender(stringToDate(getMainValue($(model.options.pairFrom).closest('.' + model.options.mainClass + 'Control')).val(), 'grg'));
                if (date.year == pairFromdate.year && date.month - pairFromdate.month <= 1 || pairFromdate.year < date.year)
                    date = pairFromdate;
                else
                    date = DateAddMonths(date, -1);
            }
            $('.' + elemYear, $CurrentPopup).val(date.year);
            $('.' + elemMonth, $CurrentPopup).val(date.month);
        }
        changeDate($CurrentPopup);
    }
    var changeDate = function ($Popup) {
        var $Page = $('.' + elemPage, $Popup);
        var $Side = $('.' + elemSide, $Popup);

        $('ul', $Page).remove();

        var date = intToDate($('.' + elemYear, $Popup).val(), $('.' + elemMonth, $Popup).val(), 1, getCalendar());

        var $MainVal = getMainValue();

        var selected;
        if ($MainVal.val() != '')
            selected = toCalender(stringToDate($MainVal.val(), 'grg'));

        $Page.append(MonthHTML(date.year, date.month, selected));

        if (model.options.double) {
            $('.' + model.options.mainClass + 'MonthLeft', getWrapper()).html(getCalendar() == 'hsh' ? hshMonthName(date.month) + ' ' + date.year + '<span class="MonthForeign">' + grgMonthName(date.month) + '</div>' : grgMonthName(date.month) + ' ' + date.year);

            date = DateAddMonths(date, 1);
            $Page.append(MonthHTML(date.year, date.month, selected));
            $Side.html((date.calendar == 'grg' ? grgMonthName(date.month) + ' ' + date.year : hshMonthName(date.month) + ' ' + getPersianNum(date.year)));

            $('.' + model.options.mainClass + 'MonthRight', getWrapper()).html(getCalendar() == 'hsh' ? hshMonthName(date.month) + ' ' + date.year + '<span class="MonthForeign">' + grgMonthName(date.month) + '</div>' : grgMonthName(date.month) + ' ' + date.year);
        }
    }
    var changeCalendar = function ($Selects) {
        $('.' + elemYear, $Selects).remove();
        $('.' + elemMonth, $Selects).remove();
        var startFrom = getStartFrom();

        var date;
        var $MainVal = getMainValue();
        if ($MainVal.val() != '') {
            date = toCalender(stringToDate($MainVal.val(), 'grg'));
            model.options.selector.val(Format(date, model.options.format));
        }
        else {
            if (model.options.toleranceUp >= 0)
                date = toCalender(jDateToDate(jDateAddDays(new Date(), model.options.spaceDays)));
            else
                date = toCalender(intToDate(new Date().getFullYear(), 1, 1, 'grg'));
        }
        var currentDate = toCalender(jDateToDate(new Date()));

        var $Years = $('<select></select>').addClass(elemYear);
        if (currentDate != undefined)
            for (var year = currentDate.year + model.options.toleranceUp; year >= currentDate.year - model.options.toleranceDown; year--) {

                $Years.append($('<option></option>').html((getCalendar() == 'grg' ? year : getPersianNum(year))).val(year));
            }
        if (date == undefined) return false;
        $Years.val(date.year).attr('data-value', date.year);
        $Selects.append($Years);

        var $Months = $('<select></select>').addClass(elemMonth);
        for (var month = 1; month <= 12; month++) {
            var monthName;
            if (getCalendar() == 'hsh')
                monthName = hshMonthName(month);
            else if (getCalendar() == 'grg')
                monthName = grgMonthName(month);

            $Months.append($('<option></option>').html((getCalendar() == 'grg' ? monthName : getPersianNum(monthName))).val(month));
        }
        $Months.val(date.month).attr('data-value', date.month);
        $Selects.append($Months);
    }
    var disable = function () {
        return;

        var startFrom = getStartFrom();
        if (startFrom == undefined) return;
        var startFromDate = toCalender(jDateToDate(startFrom));

        var $Year = $('.' + elemYear, getPopup());
        var $Month = $('.' + elemMonth, getPopup());
        var year = parseInt($Year.val());
        var month = parseInt($Month.val());

        $('option', $Year).each(function () {
            var yearValue = parseInt($(this).val());
            if (startFrom > DateToJdate(intToDate(yearValue, month, startFromDate.day, getCalendar())))
                $(this).attr('disabled', 'disabled');
            else
                $(this).removeAttr('disabled');
        });
        $('option', $Month).each(function () {
            var monthValue = parseInt($(this).val());
            if (startFrom > DateToJdate(intToDate(year, monthValue, startFromDate.day, getCalendar())))
                $(this).attr('disabled', 'disabled');
            else
                $(this).removeAttr('disabled');
        });
    }
    var selectDate = function (date, status) {
        $MainVal = getMainValue();
        $MainVal.attr('data-value', $MainVal.val());
        $MainVal.val(Format(date, mainFormat));

        if (status != undefined) status = status.toLowerCase();
        if (status == 'manual') {
            $MainVal.removeAttr('data-auto');
            $MainVal.attr('data-manual', true);
        }
        else if (status == 'auto') {
            $MainVal.removeAttr('data-manual');
            $MainVal.attr('data-auto', true);
        }

        $MainVal.change();

        $MainVal.removeAttr('data-manual');
        $MainVal.removeAttr('data-auto');
    }
    var getStartFrom = function () {
        var startFrom = getStartDate();
        var pairDate = getStartPair();
        if (startFrom == undefined || startFrom < pairDate) startFrom = pairDate;

        return startFrom;
    }
    var getStartDate = function () {
        var startDate = undefined;
        if (model.options.startFrom != undefined) {
            startDate = stringToJdate(model.options.startFrom);
            startDate = jDateAddDays(startDate, model.options.spaceDays);
        }
        return startDate;
    }
    var getStartPair = function () {
        var pairDate = undefined;
        if (model.options.pairFrom != undefined) {
            pairDate = DateToJdate(stringToDate($(mainValue, $(model.options.pairFrom).closest('.' + model.options.mainClass + 'Control')).val(), 'grg'));
            if (pairDate != undefined) pairDate = jDateAddDays(pairDate, model.options.spaceDays);
        }
        return pairDate;
    }
    var MonthHTML = function (year, month, selectedDate) {
        var jCurrentDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        var jSelectedDate = DateToJdate(selectedDate);
        var currentDate = toCalender(jDateToDate(new Date()));

        var startDate = getStartFrom();

        var pairToDate = undefined;
        if (model.options.pairTo != undefined && model.options.pairTo.parent().is(':visible'))
            pairToDate = DateToJdate(stringToDate(getMainValue($(model.options.pairTo).closest('.' + model.options.mainClass + 'Control')).val(), 'grg'));

        var pairFromDate = undefined;
        if (model.options.pairFrom != undefined && model.options.pairFrom.parent().is(':visible'))
            pairFromDate = DateToJdate(stringToDate(getMainValue($(model.options.pairFrom).closest('.' + model.options.mainClass + 'Control')).val(), 'grg'));

        var $Month = $('<ul></ul>').addClass(elemPageMonth);
        for (var weekDay = 0; weekDay <= 6; weekDay++) {
            var weekDayName;
            if (getCalendar() == 'hsh')
                weekDayName = hshDayName(weekDay)[0];
            else if (getCalendar() == 'grg')
                weekDayName = grgDayName(weekDay).substring(0, 2);

            $Month.append($('<li></li>').addClass(model.options.mainClass + 'WeekDaysTitle').html(weekDayName));
        }
        var week = 0
        var $Week = $('<ul></ul>');
        var monthDays;
        if (getCalendar() == 'hsh')
            monthDays = hshMonths[month - 1] + (month == 12 && hshIsLeap(year) ? 1 : 0);
        else if (getCalendar() == 'grg')
            monthDays = grgMonths[month - 1] + (month == 2 && grgIsLeap(year) ? 1 : 0);

        for (var day = 1; day <= monthDays; day++) {
            var date = intToDate(year, month, day, getCalendar());
            var jDate = DateToJdate(date);


            var $Item = $('<li></li>').html((getCalendar() == 'grg' ? day : getPersianNum(day))).attr('data-value', Format(jDateToDate(jDate), mainFormat));

            if (day == 1) {
                for (var weekday = 0; weekday < DayOfWeek(date) ; weekday++) {
                    $Week.append($('<li></li>').addClass(model.options.mainClass + 'EmptyFirst'));
                    week++;
                }
                $Item.addClass(model.options.mainClass + 'FirstDay').append($('<span></span>').addClass(model.options.mainClass + 'MonthName').html((getCalendar() == 'grg' ? grgMonthName(month) : hshMonthName(month))));
            }

            if (jDate.valueOf() == jCurrentDate.valueOf()) $Item.addClass(model.options.mainClass + 'CurrentDay');
            if (jSelectedDate != undefined && jDate.valueOf() == jSelectedDate.valueOf()) $Item.addClass(model.options.mainClass + 'SelectedDay');

            if (pairFromDate != undefined && jDate.valueOf() == pairFromDate.valueOf()) {
                $Item.addClass(model.options.mainClass + 'PairFrom');
            }
            if (pairToDate != undefined && jDate.valueOf() == pairToDate.valueOf()) {
                $Item.addClass(model.options.mainClass + 'PairTo');
            }
            if (jSelectedDate != undefined && pairFromDate != undefined && pairFromDate < jDate && jSelectedDate > jDate) {
                $Item.addClass(model.options.mainClass + 'Range');
            }
            if (jSelectedDate != undefined && pairToDate != undefined && pairToDate > jDate && jSelectedDate < jDate) {
                $Item.addClass(model.options.mainClass + 'Range');
            }
            if (jDate < startDate) {
                $Item.addClass(model.options.mainClass + 'DisabledDay');
            }
            else {
                $Item.addClass(model.options.mainClass + 'EnabledDay');
                $Item.click(function () {
                    selectDate(stringToDate($(this).attr('data-value'), 'grg'), 'manual');
                    $('.' + model.options.mainClass + 'SelectedDay', getWrapper()).removeClass(model.options.mainClass + 'SelectedDay');
                    $(this).addClass(model.options.mainClass + 'SelectedDay');
                });
                if (model.options.pairTo != undefined || model.options.pairFrom != undefined) {
                    $Item.mouseover(function () {
                        var $list = $('li[data-value]', getWrapper()), start, end;

                        start = $list.index($('.' + model.options.mainClass + 'PairFrom'));
                        if (start < 0) start = $list.index($(this));

                        end = $list.index($('.' + model.options.mainClass + 'PairTo'));
                        if (end < 0) end = $list.index($(this));

                        if (start == end) return;

                        $list.not($list.slice(start + 1, end)).removeClass(model.options.mainClass + 'RangeHover');
                        $list.slice(start + 1, end).addClass(model.options.mainClass + 'RangeHover');
                    });
                    $Item.mouseout(function () {
                        $('li[data-value]', getWrapper()).removeClass(model.options.mainClass + 'RangeHover')
                    });
                }
            }

            $Week.append($Item);
            week++;

            if (day == monthDays) {
                if (week == 7) {
                    $Month.addClass(model.options.mainClass + 'FullMonthWeek');
                }
                while (week < 7) {
                    $Week.append($('<li></li>').addClass(model.options.mainClass + 'EmptyLast'));
                    week++;
                }
            }

            if (week == 7) {
                week = 0;
                if ($Week != undefined) $Month.append($('<li></li>').addClass(model.options.mainClass + 'WeekDays').html($Week));
                $Week = $('<ul></ul>');
            }
        }
        return $Month;
    }
    model.setValue = function (value) {
        if (value == '')
            getMainValue().val(value).change();
        else {
            var jDate = stringToJdate(value);
            if (getStartFrom() > jDate) jDate = jDateAddDays(jDate, model.options.spaceDays);
            selectDate(jDateToDate(jDate));
        }
        return model;
    }

    var toShamsi = function (date) {
        if (date.calendar == 'hsh') return date;

        var hshDate = calendar().toShamsi(date.year, date.month, date.day);

        return intToDate(hshDate[0], hshDate[1], hshDate[2], 'hsh');
    }
    var toGregorian = function (date) {
        if (date.calendar == 'grg') return date;

        var grgDate = calendar().toGregorian(date.year, date.month, date.day);

        return intToDate(grgDate[0], grgDate[1], grgDate[2], 'grg');
    }

    var grgSumOfDays = Array(Array(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365), Array(0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366));
    var hshSumOfDays = Array(Array(0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 365), Array(0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336, 366));
    var grgMonths = Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    var hshMonths = Array(31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29);
    var grgIsLeap = function (Year) {
        return ((Year % 4) == 0 && ((Year % 100) != 0 || (Year % 400) == 0));
    }
    var hshIsLeap = function (Year) {
        Year = (Year - 474) % 128;
        Year = ((Year >= 30) ? 0 : 29) + Year;
        Year = Year - Math.floor(Year / 33) - 1;
        return ((Year % 4) == 0);
    }
    var hshDayName = function (dayOfWeek) {
        return ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"][dayOfWeek % 7];
    }
    var grgDayName = function (dayOfWeek) {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek % 7];
    }
    var hshMonthName = function (monthOfYear) {
        return ["فروردين", "ارديبهشت", "خرداد", "تير", "مرداد", "شهريور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"][monthOfYear - 1];
    }
    var grgMonthName = function (monthOfYear) {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthOfYear - 1];
    }
    var DayOfWeek = function (date) {
        if (date.calendar == 'hsh') {
            var value;
            value = date.year - 1376 + hshSumOfDays[0][date.month - 1] + date.day - 1;

            for (var i = 1380; i < date.year; i++)
                if (hshIsLeap(i)) value++;
            for (var i = date.year; i < 1380; i++)
                if (hshIsLeap(i)) value--;

            value = value % 7;
            if (value < 0) value = value + 7;

            return value;
        } else if (date.calendar == 'grg') {
            return new Date(date.year, date.month - 1, date.day).getDay();
        }
    }
    var Format = function (date, format) {
        if (date == undefined) return false;
        if (date.calendar == 'hsh') {
            return format
                .replace(/dddd/g, hshDayName(DayOfWeek(date)))
                .replace(/dd/g, ("0" + date.day).slice(-2))
                .replace(/MMMM/g, hshMonthName(date.month))
                .replace(/MM/g, ("0" + date.month).slice(-2))
                .replace(/yyyy/g, date.year);
        } else if (date.calendar == 'grg') {
            return format
                .replace(/dddd/g, grgDayName(DayOfWeek(date)))
                .replace(/dd/g, ("0" + date.day).slice(-2))
                .replace(/MMMM/g, grgMonthName(date.month))
                .replace(/MM/g, ("0" + date.month).slice(-2))
                .replace(/yyyy/g, date.year);
        }

    }
    var toCalender = function (date) {
        if (date.calendar == 'grg' && getCalendar() == 'hsh') {
            return toShamsi(date);
        } else if (date.calendar == 'grg' && getCalendar() == 'grg') {
            return date;
        }
    }
    var intToDate = function (year, month, day, calendar) {
        var now = new Date();
        month = (!month ? now.getMonth() : month);
        year = (!year ? now.getYear() : year);
        day = (!day ? now.getDay() : day);
        day = (day.toString().length == 2 && day.toString()[0] == '0' ? day.toString()[1] : day.toString());
        month = (month.toString().length == 2 && month.toString()[0] == '0' ? month.toString()[1] : month.toString());
        year = (year.toString().length == 2 && year.toString()[0] == '0' ? year.toString()[1] : year.toString());

        return { year: parseInt(year), month: parseInt(month), day: parseInt(day), calendar: calendar };
    }
    var stringToDate = function (date, calendar) {
        if (date == undefined) return false;
        var objDump = date.split('/');
        if (objDump.length == 3)
            return intToDate(objDump[0], objDump[1], objDump[2], calendar);
        else
            return undefined;
    }
    var jDateToDate = function (date) {
        return intToDate(date.getFullYear(), date.getMonth() + 1, date.getDate(), 'grg');
    }
    var DateToJdate = function (date) {
        if (date == undefined) return undefined;
        if (date.calendar == 'hsh')
            date = toGregorian(date);

        return stringToJdate(date.year + '/' + date.month + '/' + date.day);
    }
    var stringToJdate = function (input) {
        if (typeof input != 'string') return input;
        return new Date(input + ' 00:00:00 GMT');
    }
    var jDateAddDays = function (date, days) {
        if (date == undefined) return false;
        var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        newDate.setDate(date.getDate() + days);
        return newDate;
    }
    var jDateAddMonths = function (date, months) {
        var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        newDate.setMonth(date.getMonth() + months);
        return newDate;
    }
    var DateAddMonths = function (date, months) {
        date.month += months;
        while (date.month > 12) {
            date.month -= 12;
            date.year += 1;
        }
        return date;
    }

    var calendar = function () {
        var model = {};

        //  Frequently-used constants
        var
            J2000 = 2451545.0,              // Julian day of J2000 epoch
            JulianCentury = 36525.0,                // Days in Julian century
            JulianMillennium = (JulianCentury * 10),   // Days in Julian millennium
            AstronomicalUnit = 149597870.0,            // Astronomical unit in kilometres
            TropicalYear = 365.24219878,           // Mean solar tropical year
            GREGORIAN_EPOCH = 1721425.5,
            PERSIAN_EPOCH = 1948320.5;

        /*  ASTOR  --  Arc-seconds to radians.  */
        function astor(a) {
            return a * (Math.PI / (180.0 * 3600.0));
        }

        /*  DTR  --  Degrees to radians.  */
        function dtr(d) {
            return (d * Math.PI) / 180.0;
        }

        /*  RTD  --  Radians to degrees.  */
        function rtd(r) {
            return (r * 180.0) / Math.PI;
        }

        /*  FIXANGLE  --  Range reduce angle in degrees.  */
        function fixangle(a) {
            return a - 360.0 * (Math.floor(a / 360.0));
        }

        /*  FIXANGR  --  Range reduce angle in radians.  */
        function fixangr(a) {
            return a - (2 * Math.PI) * (Math.floor(a / (2 * Math.PI)));
        }

        //  DSIN  --  Sine of an angle in degrees
        function dsin(d) {
            return Math.sin(dtr(d));
        }

        //  DCOS  --  Cosine of an angle in degrees
        function dcos(d) {
            return Math.cos(dtr(d));
        }

        /*  MOD  --  Modulus function which works for non-integers.  */
        function mod(a, b) {
            return a - (b * Math.floor(a / b));
        }

        //  AMOD  --  Modulus function which returns numerator if modulus is zero
        function amod(a, b) {
            return mod(a - 1, b) + 1;
        }

        /*  JHMS  --  Convert Julian time to hour, minutes, and seconds, returned as a three-element array.  */
        function jhms(j) {
            var ij;

            j += 0.5;                 /* Astronomical to civil */
            ij = ((j - Math.floor(j)) * 86400.0) + 0.5;
            return new Array(
                             Math.floor(ij / 3600),
                             Math.floor((ij / 60) % 60),
                             Math.floor(ij % 60));
        }

        //  JWDAY  --  Calculate day of week from Julian day
        var Weekdays = new Array("Sunday", "Monday", "Tuesday", "Wednesday",
                                  "Thursday", "Friday", "Saturday");

        function jwday(j) {
            return mod(Math.floor((j + 1.5)), 7);
        }

        /*  OBLIQEQ  --  Calculate the obliquity of the ecliptic for a given
                         Julian date.  This uses Laskar's tenth-degree
                         polynomial fit (J. Laskar, Astronomy and
                         Astrophysics, Vol. 157, page 68 [1986]) which is
                         accurate to within 0.01 arc second between AD 1000
                         and AD 3000, and within a few seconds of arc for
                         +/-10000 years around AD 2000.  If we're outside the
                         range in which this fit is valid (deep time) we
                         simply return the J2000 value of the obliquity, which
                         happens to be almost precisely the mean.  */
        var oterms = new Array(
                -4680.93,
                   -1.55,
                 1999.25,
                  -51.38,
                 -249.67,
                  -39.05,
                    7.12,
                   27.87,
                    5.79,
                    2.45
        );

        function obliqeq(jd) {
            var eps, u, v, i;

            v = u = (jd - J2000) / (JulianCentury * 100);

            eps = 23 + (26 / 60.0) + (21.448 / 3600.0);

            if (Math.abs(u) < 1.0) {
                for (i = 0; i < 10; i++) {
                    eps += (oterms[i] / 3600.0) * v;
                    v *= u;
                }
            }
            return eps;
        }

        /* Periodic terms for nutation in longiude (delta \Psi) and
           obliquity (delta \Epsilon) as given in table 21.A of
           Meeus, "Astronomical Algorithms", first edition. */
        var nutArgMult = new Array(
             0, 0, 0, 0, 1,
            -2, 0, 0, 2, 2,
             0, 0, 0, 2, 2,
             0, 0, 0, 0, 2,
             0, 1, 0, 0, 0,
             0, 0, 1, 0, 0,
            -2, 1, 0, 2, 2,
             0, 0, 0, 2, 1,
             0, 0, 1, 2, 2,
            -2, -1, 0, 2, 2,
            -2, 0, 1, 0, 0,
            -2, 0, 0, 2, 1,
             0, 0, -1, 2, 2,
             2, 0, 0, 0, 0,
             0, 0, 1, 0, 1,
             2, 0, -1, 2, 2,
             0, 0, -1, 0, 1,
             0, 0, 1, 2, 1,
            -2, 0, 2, 0, 0,
             0, 0, -2, 2, 1,
             2, 0, 0, 2, 2,
             0, 0, 2, 2, 2,
             0, 0, 2, 0, 0,
            -2, 0, 1, 2, 2,
             0, 0, 0, 2, 0,
            -2, 0, 0, 2, 0,
             0, 0, -1, 2, 1,
             0, 2, 0, 0, 0,
             2, 0, -1, 0, 1,
            -2, 2, 0, 2, 2,
             0, 1, 0, 0, 1,
            -2, 0, 1, 0, 1,
             0, -1, 0, 0, 1,
             0, 0, 2, -2, 0,
             2, 0, -1, 2, 1,
             2, 0, 1, 2, 2,
             0, 1, 0, 2, 2,
            -2, 1, 1, 0, 0,
             0, -1, 0, 2, 2,
             2, 0, 0, 2, 1,
             2, 0, 1, 0, 0,
            -2, 0, 2, 2, 2,
            -2, 0, 1, 2, 1,
             2, 0, -2, 0, 1,
             2, 0, 0, 0, 1,
             0, -1, 1, 0, 0,
            -2, -1, 0, 2, 1,
            -2, 0, 0, 0, 1,
             0, 0, 2, 2, 1,
            -2, 0, 2, 0, 1,
            -2, 1, 0, 2, 1,
             0, 0, 1, -2, 0,
            -1, 0, 1, 0, 0,
            -2, 1, 0, 0, 0,
             1, 0, 0, 0, 0,
             0, 0, 1, 2, 0,
            -1, -1, 1, 0, 0,
             0, 1, 1, 0, 0,
             0, -1, 1, 2, 2,
             2, -1, -1, 2, 2,
             0, 0, -2, 2, 2,
             0, 0, 3, 2, 2,
             2, -1, 0, 2, 2
        );

        var nutArgCoeff = new Array(
            -171996, -1742, 92095, 89,          /*  0,  0,  0,  0,  1 */
             -13187, -16, 5736, -31,          /* -2,  0,  0,  2,  2 */
              -2274, -2, 977, -5,          /*  0,  0,  0,  2,  2 */
               2062, 2, -895, 5,          /*  0,  0,  0,  0,  2 */
               1426, -34, 54, -1,          /*  0,  1,  0,  0,  0 */
                712, 1, -7, 0,          /*  0,  0,  1,  0,  0 */
               -517, 12, 224, -6,          /* -2,  1,  0,  2,  2 */
               -386, -4, 200, 0,          /*  0,  0,  0,  2,  1 */
               -301, 0, 129, -1,          /*  0,  0,  1,  2,  2 */
                217, -5, -95, 3,          /* -2, -1,  0,  2,  2 */
               -158, 0, 0, 0,          /* -2,  0,  1,  0,  0 */
                129, 1, -70, 0,          /* -2,  0,  0,  2,  1 */
                123, 0, -53, 0,          /*  0,  0, -1,  2,  2 */
                 63, 0, 0, 0,          /*  2,  0,  0,  0,  0 */
                 63, 1, -33, 0,          /*  0,  0,  1,  0,  1 */
                -59, 0, 26, 0,          /*  2,  0, -1,  2,  2 */
                -58, -1, 32, 0,          /*  0,  0, -1,  0,  1 */
                -51, 0, 27, 0,          /*  0,  0,  1,  2,  1 */
                 48, 0, 0, 0,          /* -2,  0,  2,  0,  0 */
                 46, 0, -24, 0,          /*  0,  0, -2,  2,  1 */
                -38, 0, 16, 0,          /*  2,  0,  0,  2,  2 */
                -31, 0, 13, 0,          /*  0,  0,  2,  2,  2 */
                 29, 0, 0, 0,          /*  0,  0,  2,  0,  0 */
                 29, 0, -12, 0,          /* -2,  0,  1,  2,  2 */
                 26, 0, 0, 0,          /*  0,  0,  0,  2,  0 */
                -22, 0, 0, 0,          /* -2,  0,  0,  2,  0 */
                 21, 0, -10, 0,          /*  0,  0, -1,  2,  1 */
                 17, -1, 0, 0,          /*  0,  2,  0,  0,  0 */
                 16, 0, -8, 0,          /*  2,  0, -1,  0,  1 */
                -16, 1, 7, 0,          /* -2,  2,  0,  2,  2 */
                -15, 0, 9, 0,          /*  0,  1,  0,  0,  1 */
                -13, 0, 7, 0,          /* -2,  0,  1,  0,  1 */
                -12, 0, 6, 0,          /*  0, -1,  0,  0,  1 */
                 11, 0, 0, 0,          /*  0,  0,  2, -2,  0 */
                -10, 0, 5, 0,          /*  2,  0, -1,  2,  1 */
                 -8, 0, 3, 0,          /*  2,  0,  1,  2,  2 */
                  7, 0, -3, 0,          /*  0,  1,  0,  2,  2 */
                 -7, 0, 0, 0,          /* -2,  1,  1,  0,  0 */
                 -7, 0, 3, 0,          /*  0, -1,  0,  2,  2 */
                 -7, 0, 3, 0,          /*  2,  0,  0,  2,  1 */
                  6, 0, 0, 0,          /*  2,  0,  1,  0,  0 */
                  6, 0, -3, 0,          /* -2,  0,  2,  2,  2 */
                  6, 0, -3, 0,          /* -2,  0,  1,  2,  1 */
                 -6, 0, 3, 0,          /*  2,  0, -2,  0,  1 */
                 -6, 0, 3, 0,          /*  2,  0,  0,  0,  1 */
                  5, 0, 0, 0,          /*  0, -1,  1,  0,  0 */
                 -5, 0, 3, 0,          /* -2, -1,  0,  2,  1 */
                 -5, 0, 3, 0,          /* -2,  0,  0,  0,  1 */
                 -5, 0, 3, 0,          /*  0,  0,  2,  2,  1 */
                  4, 0, 0, 0,          /* -2,  0,  2,  0,  1 */
                  4, 0, 0, 0,          /* -2,  1,  0,  2,  1 */
                  4, 0, 0, 0,          /*  0,  0,  1, -2,  0 */
                 -4, 0, 0, 0,          /* -1,  0,  1,  0,  0 */
                 -4, 0, 0, 0,          /* -2,  1,  0,  0,  0 */
                 -4, 0, 0, 0,          /*  1,  0,  0,  0,  0 */
                  3, 0, 0, 0,          /*  0,  0,  1,  2,  0 */
                 -3, 0, 0, 0,          /* -1, -1,  1,  0,  0 */
                 -3, 0, 0, 0,          /*  0,  1,  1,  0,  0 */
                 -3, 0, 0, 0,          /*  0, -1,  1,  2,  2 */
                 -3, 0, 0, 0,          /*  2, -1, -1,  2,  2 */
                 -3, 0, 0, 0,          /*  0,  0, -2,  2,  2 */
                 -3, 0, 0, 0,          /*  0,  0,  3,  2,  2 */
                 -3, 0, 0, 0           /*  2, -1,  0,  2,  2 */
        );

        /*  NUTATION  --  Calculate the nutation in longitude, deltaPsi, and
                          obliquity, deltaEpsilon for a given Julian date
                          jd.  Results are returned as a two element Array
                          giving (deltaPsi, deltaEpsilon) in degrees.  */
        function nutation(jd) {
            var deltaPsi, deltaEpsilon,
                i, j,
                t = (jd - 2451545.0) / 36525.0, t2, t3, to10,
                ta = new Array,
                dp = 0, de = 0, ang;

            t3 = t * (t2 = t * t);

            /* Calculate angles.  The correspondence between the elements
               of our array and the terms cited in Meeus are:
        
               ta[0] = D  ta[0] = M  ta[2] = M'  ta[3] = F  ta[4] = \Omega
        
            */

            ta[0] = dtr(297.850363 + 445267.11148 * t - 0.0019142 * t2 +
                        t3 / 189474.0);
            ta[1] = dtr(357.52772 + 35999.05034 * t - 0.0001603 * t2 -
                        t3 / 300000.0);
            ta[2] = dtr(134.96298 + 477198.867398 * t + 0.0086972 * t2 +
                        t3 / 56250.0);
            ta[3] = dtr(93.27191 + 483202.017538 * t - 0.0036825 * t2 +
                        t3 / 327270);
            ta[4] = dtr(125.04452 - 1934.136261 * t + 0.0020708 * t2 +
                        t3 / 450000.0);

            /* Range reduce the angles in case the sine and cosine functions
               don't do it as accurately or quickly. */

            for (i = 0; i < 5; i++) {
                ta[i] = fixangr(ta[i]);
            }

            to10 = t / 10.0;
            for (i = 0; i < 63; i++) {
                ang = 0;
                for (j = 0; j < 5; j++) {
                    if (nutArgMult[(i * 5) + j] != 0) {
                        ang += nutArgMult[(i * 5) + j] * ta[j];
                    }
                }
                dp += (nutArgCoeff[(i * 4) + 0] + nutArgCoeff[(i * 4) + 1] * to10) * Math.sin(ang);
                de += (nutArgCoeff[(i * 4) + 2] + nutArgCoeff[(i * 4) + 3] * to10) * Math.cos(ang);
            }

            /* Return the result, converting from ten thousandths of arc
               seconds to radians in the process. */

            deltaPsi = dp / (3600.0 * 10000.0);
            deltaEpsilon = de / (3600.0 * 10000.0);

            return new Array(deltaPsi, deltaEpsilon);
        }

        /*  ECLIPTOEQ  --  Convert celestial (ecliptical) longitude and
                           latitude into right ascension (in degrees) and
                           declination.  We must supply the time of the
                           conversion in order to compensate correctly for the
                           varying obliquity of the ecliptic over time.
                           The right ascension and declination are returned
                           as a two-element Array in that order.  */
        function ecliptoeq(jd, Lambda, Beta) {
            var eps, Ra, Dec;

            /* Obliquity of the ecliptic. */

            eps = dtr(obliqeq(jd));
            log += "Obliquity: " + rtd(eps) + "\n";

            Ra = rtd(Math.atan2((Math.cos(eps) * Math.sin(dtr(Lambda)) -
                                (Math.tan(dtr(Beta)) * Math.sin(eps))),
                              Math.cos(dtr(Lambda))));
            log += "RA = " + Ra + "\n";
            Ra = fixangle(rtd(Math.atan2((Math.cos(eps) * Math.sin(dtr(Lambda)) -
                                (Math.tan(dtr(Beta)) * Math.sin(eps))),
                              Math.cos(dtr(Lambda)))));
            Dec = rtd(Math.asin((Math.sin(eps) * Math.sin(dtr(Lambda)) * Math.cos(dtr(Beta))) +
                         (Math.sin(dtr(Beta)) * Math.cos(eps))));

            return new Array(Ra, Dec);
        }


        /*  DELTAT  --  Determine the difference, in seconds, between
                        Dynamical time and Universal time.  */

        /*  Table of observed Delta T values at the beginning of
            even numbered years from 1620 through 2002.  */
        var deltaTtab = new Array(
            121, 112, 103, 95, 88, 82, 77, 72, 68, 63, 60, 56, 53, 51, 48, 46,
            44, 42, 40, 38, 35, 33, 31, 29, 26, 24, 22, 20, 18, 16, 14, 12,
            11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10,
            10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
            13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16,
            16, 16, 15, 15, 14, 13, 13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12,
            11.9, 11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3, 5.4, 5.6,
            5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6, 7.7, 7.3, 6.2, 5.2, 2.7,
            1.4, -1.2, -2.8, -3.8, -4.8, -5.5, -5.3, -5.6, -5.7, -5.9, -6,
            -6.3, -6.5, -6.2, -4.7, -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16,
            18.2, 20.2, 21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7,
            24, 24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2,
            33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5, 50.5,
            52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63, 65, 66.6
                                 );

        function deltat(year) {
            var dt, f, i, t;

            if ((year >= 1620) && (year <= 2000)) {
                i = Math.floor((year - 1620) / 2);
                f = ((year - 1620) / 2) - i;  /* Fractional part of year */
                dt = deltaTtab[i] + ((deltaTtab[i + 1] - deltaTtab[i]) * f);
            } else {
                t = (year - 2000) / 100;
                if (year < 948) {
                    dt = 2177 + (497 * t) + (44.1 * t * t);
                } else {
                    dt = 102 + (102 * t) + (25.3 * t * t);
                    if ((year > 2000) && (year < 2100)) {
                        dt += 0.37 * (year - 2100);
                    }
                }
            }
            return dt;
        }

        /*  EQUINOX  --  Determine the Julian Ephemeris Day of an
                         equinox or solstice.  The "which" argument
                         selects the item to be computed:
        
                            0   March equinox
                            1   June solstice
                            2   September equinox
                            3   December solstice
        
        */
        //  Periodic terms to obtain true time
        var EquinoxpTerms = new Array(
                               485, 324.96, 1934.136,
                               203, 337.23, 32964.467,
                               199, 342.08, 20.186,
                               182, 27.85, 445267.112,
                               156, 73.14, 45036.886,
                               136, 171.52, 22518.443,
                                77, 222.54, 65928.934,
                                74, 296.72, 3034.906,
                                70, 243.58, 9037.513,
                                58, 119.81, 33718.147,
                                52, 297.17, 150.678,
                                50, 21.02, 2281.226,
                                45, 247.54, 29929.562,
                                44, 325.15, 31555.956,
                                29, 60.93, 4443.417,
                                18, 155.12, 67555.328,
                                17, 288.79, 4562.452,
                                16, 198.04, 62894.029,
                                14, 199.76, 31436.921,
                                12, 95.39, 14577.848,
                                12, 287.11, 31931.756,
                                12, 320.81, 34777.259,
                                 9, 227.73, 1222.114,
                                 8, 15.45, 16859.074
                                     );

        JDE0tab1000 = new Array(
           new Array(1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071),
           new Array(1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025),
           new Array(1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074),
           new Array(1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006)
                               );

        JDE0tab2000 = new Array(
           new Array(2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057),
           new Array(2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030),
           new Array(2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078),
           new Array(2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032)
                               );

        function equinox(year, which) {
            var deltaL, i, j, JDE0, JDE, JDE0tab, S, T, W, Y;

            /*  Initialise terms for mean equinox and solstices.  We
                have two sets: one for years prior to 1000 and a second
                for subsequent years.  */

            if (year < 1000) {
                JDE0tab = JDE0tab1000;
                Y = year / 1000;
            } else {
                JDE0tab = JDE0tab2000;
                Y = (year - 2000) / 1000;
            }

            JDE0 = JDE0tab[which][0] +
                   (JDE0tab[which][1] * Y) +
                   (JDE0tab[which][2] * Y * Y) +
                   (JDE0tab[which][3] * Y * Y * Y) +
                   (JDE0tab[which][4] * Y * Y * Y * Y);

            //document.debug.log.value += "JDE0 = " + JDE0 + "\n";

            T = (JDE0 - 2451545.0) / 36525;
            //document.debug.log.value += "T = " + T + "\n";
            W = (35999.373 * T) - 2.47;
            //document.debug.log.value += "W = " + W + "\n";
            deltaL = 1 + (0.0334 * dcos(W)) + (0.0007 * dcos(2 * W));
            //document.debug.log.value += "deltaL = " + deltaL + "\n";

            //  Sum the periodic terms for time T

            S = 0;
            for (i = j = 0; i < 24; i++) {
                S += EquinoxpTerms[j] * dcos(EquinoxpTerms[j + 1] + (EquinoxpTerms[j + 2] * T));
                j += 3;
            }

            //document.debug.log.value += "S = " + S + "\n";
            //document.debug.log.value += "Corr = " + ((S * 0.00001) / deltaL) + "\n";

            JDE = JDE0 + ((S * 0.00001) / deltaL);

            return JDE;
        }

        /*  SUNPOS  --  Position of the Sun.  Please see the comments
                        on the return statement at the end of this function
                        which describe the array it returns.  We return
                        intermediate values because they are useful in a
                        variety of other contexts.  */

        function sunpos(jd) {
            var T, T2, L0, M, e, C, sunLong, sunAnomaly, sunR,
                Omega, Lambda, epsilon, epsilon0, Alpha, Delta,
                AlphaApp, DeltaApp;

            T = (jd - J2000) / JulianCentury;
            //document.debug.log.value += "Sunpos.  T = " + T + "\n";
            T2 = T * T;
            L0 = 280.46646 + (36000.76983 * T) + (0.0003032 * T2);
            //document.debug.log.value += "L0 = " + L0 + "\n";
            L0 = fixangle(L0);
            //document.debug.log.value += "L0 = " + L0 + "\n";
            M = 357.52911 + (35999.05029 * T) + (-0.0001537 * T2);
            //document.debug.log.value += "M = " + M + "\n";
            M = fixangle(M);
            //document.debug.log.value += "M = " + M + "\n";
            e = 0.016708634 + (-0.000042037 * T) + (-0.0000001267 * T2);
            //document.debug.log.value += "e = " + e + "\n";
            C = ((1.914602 + (-0.004817 * T) + (-0.000014 * T2)) * dsin(M)) +
                ((0.019993 - (0.000101 * T)) * dsin(2 * M)) +
                (0.000289 * dsin(3 * M));
            //document.debug.log.value += "C = " + C + "\n";
            sunLong = L0 + C;
            //document.debug.log.value += "sunLong = " + sunLong + "\n";
            sunAnomaly = M + C;
            //document.debug.log.value += "sunAnomaly = " + sunAnomaly + "\n";
            sunR = (1.000001018 * (1 - (e * e))) / (1 + (e * dcos(sunAnomaly)));
            //document.debug.log.value += "sunR = " + sunR + "\n";
            Omega = 125.04 - (1934.136 * T);
            //document.debug.log.value += "Omega = " + Omega + "\n";
            Lambda = sunLong + (-0.00569) + (-0.00478 * dsin(Omega));
            //document.debug.log.value += "Lambda = " + Lambda + "\n";
            epsilon0 = obliqeq(jd);
            //document.debug.log.value += "epsilon0 = " + epsilon0 + "\n";
            epsilon = epsilon0 + (0.00256 * dcos(Omega));
            //document.debug.log.value += "epsilon = " + epsilon + "\n";
            Alpha = rtd(Math.atan2(dcos(epsilon0) * dsin(sunLong), dcos(sunLong)));
            //document.debug.log.value += "Alpha = " + Alpha + "\n";
            Alpha = fixangle(Alpha);
            ////document.debug.log.value += "Alpha = " + Alpha + "\n";
            Delta = rtd(Math.asin(dsin(epsilon0) * dsin(sunLong)));
            ////document.debug.log.value += "Delta = " + Delta + "\n";
            AlphaApp = rtd(Math.atan2(dcos(epsilon) * dsin(Lambda), dcos(Lambda)));
            //document.debug.log.value += "AlphaApp = " + AlphaApp + "\n";
            AlphaApp = fixangle(AlphaApp);
            //document.debug.log.value += "AlphaApp = " + AlphaApp + "\n";
            DeltaApp = rtd(Math.asin(dsin(epsilon) * dsin(Lambda)));
            //document.debug.log.value += "DeltaApp = " + DeltaApp + "\n";

            return new Array(                 //  Angular quantities are expressed in decimal degrees
                L0,                           //  [0] Geometric mean longitude of the Sun
                M,                            //  [1] Mean anomaly of the Sun
                e,                            //  [2] Eccentricity of the Earth's orbit
                C,                            //  [3] Sun's equation of the Centre
                sunLong,                      //  [4] Sun's true longitude
                sunAnomaly,                   //  [5] Sun's true anomaly
                sunR,                         //  [6] Sun's radius vector in AU
                Lambda,                       //  [7] Sun's apparent longitude at true equinox of the date
                Alpha,                        //  [8] Sun's true right ascension
                Delta,                        //  [9] Sun's true declination
                AlphaApp,                     // [10] Sun's apparent right ascension
                DeltaApp                      // [11] Sun's apparent declination
            );
        }

        /*  EQUATIONOFTIME  --  Compute equation of time for a given moment.
                                Returns the equation of time as a fraction of
                                a day.  */

        function equationOfTime(jd) {
            var alpha, deltaPsi, E, epsilon, L0, tau

            tau = (jd - J2000) / JulianMillennium;
            //document.debug.log.value += "equationOfTime.  tau = " + tau + "\n";
            L0 = 280.4664567 + (360007.6982779 * tau) +
                 (0.03032028 * tau * tau) +
                 ((tau * tau * tau) / 49931) +
                 (-((tau * tau * tau * tau) / 15300)) +
                 (-((tau * tau * tau * tau * tau) / 2000000));
            //document.debug.log.value += "L0 = " + L0 + "\n";
            L0 = fixangle(L0);
            //document.debug.log.value += "L0 = " + L0 + "\n";
            alpha = sunpos(jd)[10];
            //document.debug.log.value += "alpha = " + alpha + "\n";
            deltaPsi = nutation(jd)[0];
            //document.debug.log.value += "deltaPsi = " + deltaPsi + "\n";
            epsilon = obliqeq(jd) + nutation(jd)[1];
            //document.debug.log.value += "epsilon = " + epsilon + "\n";
            E = L0 + (-0.0057183) + (-alpha) + (deltaPsi * dcos(epsilon));
            //document.debug.log.value += "E = " + E + "\n";
            E = E - 20.0 * (Math.floor(E / 20.0));
            //document.debug.log.value += "Efixed = " + E + "\n";
            E = E / (24 * 60);
            //document.debug.log.value += "Eday = " + E + "\n";

            return E;
        }

        function persiana_to_jd(year, month, day) {
            var adr, equinox, guess, jd;

            guess = (PERSIAN_EPOCH - 1) + (TropicalYear * ((year - 1) - 1));
            adr = new Array(year - 1, 0);

            while (adr[0] < year) {
                adr = persiana_year(guess);
                guess = adr[1] + (TropicalYear + 2);
            }
            equinox = adr[1];

            jd = equinox +
                    ((month <= 7) ?
                        ((month - 1) * 31) :
                        (((month - 1) * 30) + 6)
                    ) +
                    (day - 1);
            return jd;
        }
        function persiana_year(jd) {
            var guess = jd_to_gregorian(jd)[0] - 2,
                lasteq, nexteq, adr;

            lasteq = tehran_equinox_jd(guess);
            while (lasteq > jd) {
                guess--;
                lasteq = tehran_equinox_jd(guess);
            }
            nexteq = lasteq - 1;
            while (!((lasteq <= jd) && (jd < nexteq))) {
                lasteq = nexteq;
                guess++;
                nexteq = tehran_equinox_jd(guess);
            }
            adr = Math.round((lasteq - PERSIAN_EPOCH) / TropicalYear) + 1;

            return new Array(adr, lasteq);
        }
        function jd_to_gregorian(jd) {
            var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad,
                yindex, dyindex, year, yearday, leapadj;

            wjd = Math.floor(jd - 0.5) + 0.5;
            depoch = wjd - GREGORIAN_EPOCH;
            quadricent = Math.floor(depoch / 146097);
            dqc = mod(depoch, 146097);
            cent = Math.floor(dqc / 36524);
            dcent = mod(dqc, 36524);
            quad = Math.floor(dcent / 1461);
            dquad = mod(dcent, 1461);
            yindex = Math.floor(dquad / 365);
            year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
            if (!((cent == 4) || (yindex == 4))) {
                year++;
            }
            yearday = wjd - gregorian_to_jd(year, 1, 1);
            leapadj = ((wjd < gregorian_to_jd(year, 3, 1)) ? 0
                                                          :
                          (leap_gregorian(year) ? 1 : 2)
                      );
            month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
            day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

            return new Array(year, month, day);
        }
        function tehran_equinox_jd(year) {
            var ep, epg;

            ep = tehran_equinox(year);
            epg = Math.floor(ep);

            return epg;
        }
        function tehran_equinox(year) {
            var equJED, equJD, equAPP, equTehran, dtTehran;

            //  March equinox in dynamical time
            equJED = equinox(year, 0);

            //  Correct for delta T to obtain Universal time
            equJD = equJED - (deltat(year) / (24 * 60 * 60));

            //  Apply the equation of time to yield the apparent time at Greenwich
            equAPP = equJD + equationOfTime(equJED);

            /*  Finally, we must correct for the constant difference between
                the Greenwich meridian andthe time zone standard for
            Iran Standard time, 52°30' to the East.  */

            dtTehran = (52 + (30 / 60.0) + (0 / (60.0 * 60.0))) / 360;
            equTehran = equAPP + dtTehran;

            return equTehran;
        }
        function gregorian_to_jd(year, month, day) {
            return (GREGORIAN_EPOCH - 1) +
                   (365 * (year - 1)) +
                   Math.floor((year - 1) / 4) +
                   (-Math.floor((year - 1) / 100)) +
                   Math.floor((year - 1) / 400) +
                   Math.floor((((367 * month) - 362) / 12) +
                   ((month <= 2) ? 0 :
                                       (leap_gregorian(year) ? -1 : -2)
                   ) +
                   day);
        }
        function leap_gregorian(year) {
            return ((year % 4) == 0) &&
                    (!(((year % 100) == 0) && ((year % 400) != 0)));
        }
        function jd_to_persiana(jd) {
            var year, month, day,
                adr, equinox, yday;

            jd = Math.floor(jd) + 0.5;
            adr = persiana_year(jd);
            year = adr[0];
            equinox = adr[1];
            day = Math.floor((jd - equinox) / 30) + 1;

            yday = (Math.floor(jd) - persiana_to_jd(year, 1, 1)) + 1;
            month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
            day = (Math.floor(jd) - persiana_to_jd(year, month, 1)) + 1;

            return new Array(year, month, day);
        }

        model.toShamsi = function (year, month, day) {
            return jd_to_persiana(gregorian_to_jd(year, month, day));
        }

        model.toGregorian = function (year, month, day) {
            return jd_to_gregorian(persiana_to_jd(year, month, day) + 0.5);
        }

        return model;
    }

    if (model.options.selector.parent().hasClass(model.options.mainClass) == false) render();
    return model;
}
