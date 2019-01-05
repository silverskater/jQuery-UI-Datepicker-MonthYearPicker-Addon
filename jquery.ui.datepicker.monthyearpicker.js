/*
Month and Year picker for jQuery UI Datepicker 1.8.21

Written by Anton Ludescher (silverskater{at}gmail.com).
Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and
MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. */


(function($, undefined ) {

	//overriding functions meant to be private (starting with an underscore)
	$.datepicker._updateDatepicker_MonthYearPicker = $.datepicker._updateDatepicker;
	$.datepicker._showDatepicker_MonthYearPicker = $.datepicker._showDatepicker;
	$.datepicker._doKeyDown_MonthYearPicker = $.datepicker._doKeyDown;

	$.extend($.datepicker, {
		_doKeyDown: function(event) {
			var inst = $.datepicker._getInst(event.target);
			var handled = true;
			//var isRTL = inst.dpDiv.is('.ui-datepicker-rtl');
			inst._keyEvent = true;
			if ($.datepicker._datepickerShowing) {
				switch (event.keyCode) {
					case 27:
							if($('.ui-datepicker-select-month').is(':visible')) {
								$.datepicker._updateDatepicker(inst);
							}
							else if($('.ui-datepicker-select-year').is(':visible')) {
								$.datepicker._toggleDisplay_MonthYearPicker(inst, 2, this);
							}
							else {
								$.datepicker._hideDatepicker();
							}
							break; // hide on escape
					//TODO prev/next month/year on month/year picker screens
					default:
							//call the original function
							$.datepicker._doKeyDown_MonthYearPicker(event);
				}
			}
			else {
				//call the original function
				$.datepicker._doKeyDown_MonthYearPicker(event);
			}
		},

		_updateDatepicker: function(inst) {
			//call the original function
			this._updateDatepicker_MonthYearPicker(inst);

			//TODO: multiMonth
			var numMonths = this._getNumberOfMonths(inst);
			var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
			var changeMonth = this._get(inst, 'changeMonth');
			var changeYear = this._get(inst, 'changeYear');
			if(isMultiMonth || changeMonth || changeYear) {
				return ;
			}

			//console.log($('<div>').append(this.dpDiv.clone()).html());

			var uidptitle = inst.dpDiv.find('.ui-datepicker-title');
			var uidptitle_link = uidptitle.wrapInner('<a href="#"/>');
			uidptitle_link.click(function(){$.datepicker._toggleDisplay_MonthYearPicker('#' + inst.id, 2); return false;});

			inst.dpDiv.children('table.ui-datepicker-calendar').after(this._generateExtraHTML_MonthYearPicker(inst));
		
			this._reposition_MonthYearPicker(inst);
		},

		//focus the date input field
		_instInputFocus_MYP: function(inst) {
			//code copied from datePicker's _updateDatepicker()
			if (inst == $.datepicker._curInst && $.datepicker._datepickerShowing && inst.input &&
					// #6694 - don't focus the input if it's already focused
					// this breaks the change event in IE
					inst.input.is(':visible') && !inst.input.is(':disabled') && inst.input[0] != document.activeElement)
				inst.input.focus();

		},

		_generateMonthPickerHTML_MonthYearPicker: function(inst, minDate, maxDate, drawMonth, inMinYear, inMaxYear) {
			//TODO RTL?
			var monthNamesShort = this._get(inst, 'monthNamesShort');

			var monthPicker = '<table><tbody><tr>';

			var unselectable = false;
			for (var month = 0; month < 12; ) {
				unselectable = 	(inMinYear && month < minDate.getMonth()) ||
												(inMaxYear && month > maxDate.getMonth());
				monthPicker += '<td class="' +
					(unselectable ? ' ' + this._unselectableClass + ' ui-state-disabled': '') +  // highlight unselectable months
					(month == drawMonth ? ' ui-datepicker-today' : '') + '"' +
					(unselectable ? '' : ' onclick="jQuery.datepicker._pickMonthYear_MonthYearPicker(\'#' + inst.id + '\', ' + month + ', \'M\');return false;"') + '>' + // actions
					((unselectable ? '<span class="ui-state-default">' + monthNamesShort[month] + '</span>' : '<a class="ui-state-default ' +
					//(month == drawMonth ? ' ui-state-highlight' : '') +
					(month == drawMonth ? ' ui-state-active' : '') + // highlight selected day
					//(otherMonth ? ' ui-priority-secondary' : '') + // distinguish dates from other months
					'" href="#">' + monthNamesShort[month] + '</a>')) + '</td>'; // display selectable date

				if(++month % 4 === 0) {
					monthPicker += '</tr>';
					if(month != 12) {
						monthPicker += '<tr>';
					}
				}
			}
			monthPicker += '</tbody></table>';

			return monthPicker;
		},

		_generateExtraHTML_MonthYearPicker: function(inst) {
			var minDate = this._getMinMaxDate(inst, 'min');
			var maxDate = this._getMinMaxDate(inst, 'max');
			var drawYear = inst.drawYear;
			var drawMonth = inst.drawMonth;
			var inMinYear = (minDate && minDate.getFullYear() == drawYear);
			var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);

			var monthPicker = this._generateMonthPickerHTML_MonthYearPicker(inst, minDate, maxDate, drawMonth, inMinYear, inMaxYear);

			return '<div class="ui-datepicker-select-month" style="display: none">' + monthPicker + '</div>' +
				'<div class="ui-datepicker-select-year" style="display: none"></div>';	//yearPicker gets filled dinamically
		},

		_pickMonthYear_MonthYearPicker: function(id, valueMY, period) {
			var dummySelect = $('<select/>').append( new Option(valueMY, valueMY, true, true) );
			//select month and show datepicker or select year ...
			this._selectMonthYear(id, dummySelect[0], period);
				//... and show month picker
			if(period == 'Y') {
				this._toggleDisplay_MonthYearPicker(id, 2);
			}
		},

		_reposition_MonthYearPicker: function (inst) {
			if (inst.inline) {
				return;
			}
			inst.dpDiv.position({
				my: "left top",
				at: "left bottom",
				of: $(inst.input)
			});
		},

		_addHoverEvents_MonthYearPicker: function (parent) {
			var dpMonths = parent.find('.ui-state-default');
			dpMonths.hover(
				function () {
					$(this).addClass('ui-state-hover');
				},
				function () {
					$(this).removeClass("ui-state-hover");
				});
		},

		_toggleDisplay_MonthYearPicker: function(inst, screen, input) {
			if(typeof inst == 'string')  {
				//var inst = this._curInst;
				var target = $(inst);
				inst = this._getInst(target[0]);
			}
			else {
				//get the input element and put it in the target array
				var target = [ input !== undefined
					? input
					: instActive.inline ? dpDiv.parent()[0] : instActive.input[0]];
			}
			if (this._isDisabledDatepicker(target[0])) {
				return;
			}
			//keep the focus for _doKeyDown to work
			this._instInputFocus_MYP(inst);

			var minDate = this._getMinMaxDate(inst, 'min');
			var maxDate = this._getMinMaxDate(inst, 'max');
			var drawYear = inst.drawYear;	//inst.drawYear = inst.selectedYear = inst.currentYear
			var drawMonth = inst.drawMonth;
			var minYear = minDate ? minDate.getFullYear() : 0; //TODO
			var maxYear = maxDate ? maxDate.getFullYear() : undefined;
			var dpHeader = inst.dpDiv.children('.ui-datepicker-header');
			var dpPrev = dpHeader.children('a.ui-datepicker-prev');
			var dpNext = dpHeader.children('a.ui-datepicker-next');
			var dpTitle = dpHeader.children('.ui-datepicker-title');

			var self = this;

			switch (screen) {
				case 2:
					//month picker
					var inMinYear = (minYear !== undefined && minYear == drawYear);
					var inMaxYear = (maxYear !== undefined && maxYear == drawYear);
					var _advanceYear_MYP = function(diff) {
						inst.drawYear = drawYear += diff;
						dpTitle.children(':first').text(drawYear);
						//update screen
						if(minDate || maxDate) {
							inMinYear = minYear == drawYear;
							inMaxYear = maxYear == drawYear;
							//update month selection
							var monthPicker = self._generateMonthPickerHTML_MonthYearPicker(inst, minDate, maxDate, drawMonth, inMinYear, inMaxYear);
							inst.dpDiv.children('.ui-datepicker-select-month').html(monthPicker);
						}
						_updatePrevNextYear_MYP();
					};
					var _updatePrevNextYear_MYP = function() {
						dpPrev.unbind('click');
						if(!inMinYear) {
							dpPrev.removeClass('ui-state-disabled').click(function() {_advanceYear_MYP(-1); self._instInputFocus_MYP(inst);});
						}
						else {
							dpPrev.addClass('ui-state-disabled');
						}
						dpNext.unbind('click');
						if(!inMaxYear) {
							dpNext.removeClass('ui-state-disabled').click(function() {_advanceYear_MYP(1); self._instInputFocus_MYP(inst);});
						}
						else {
							dpNext.addClass('ui-state-disabled');
						}
					};
					//change title link behaviour
					dpTitle.html('<a href="#" class="ui-datepicker-yearpicker" onclick="jQuery.datepicker._toggleDisplay_MonthYearPicker(\'#' + inst.id + '\', 3);return false;">' + drawYear +'</a>');
					//change prev next behaviour
					dpPrev.removeAttr('onclick');  //remove DatePicker's onclick event
					dpNext.removeAttr('onclick');  //remove DatePicker's onclick event
					_updatePrevNextYear_MYP();

					var dpMonthSelector = inst.dpDiv.find('.ui-datepicker-select-month table');
					this._addHoverEvents_MonthYearPicker(dpMonthSelector);

					inst.dpDiv.find('table.ui-datepicker-calendar').hide();
					inst.dpDiv.find('.ui-datepicker-select-month').show();
					inst.dpDiv.find('.ui-datepicker-select-year').hide();

					this._reposition_MonthYearPicker(inst);

					break;
				case 3:
					//year picker
					var year = parseInt(drawYear/10, 10) * 10;  //first year in this decade
					//change title link behaviour
					dpTitle.unbind('click');
					//change prev next behaviour
					$.backToActualMonth = function() {
						//var d = new Date();
						//var month = d.getMonth()+1;
						$.datepicker._pickMonthYear_MonthYearPicker('#'+inst.id,drawMonth,'M');
						return false;
					};
					var _updateYearPicker_MYP = function(year) {
						//TODO RTL
						//change title html
                        dpTitle.html('<a class="ui-datepicker-title" '+
						'onclick="return $.backToActualMonth();" '+
					    'href="#">'+ year + '-' + (year + 9) + '</a>');
						//change prev next behaviour
						dpPrev.unbind('click');
						dpNext.unbind('click');
						if(year > minYear) {
							dpPrev.removeClass('ui-state-disabled').click(function() {_updateYearPicker_MYP(year-21); self._instInputFocus_MYP(inst);}); //year is 2021 at this point
						}
						else {
							dpPrev.addClass('ui-state-disabled');
						}
						if(maxYear === undefined || year+9 < maxYear) {
							dpNext.removeClass('ui-state-disabled').click(function() {_updateYearPicker_MYP(year-1); self._instInputFocus_MYP(inst);});
						}
						else {
							dpNext.addClass('ui-state-disabled');
						}

						//generate year picker HTML
						var yearPicker = '<table><tbody><tr>';
						//show years in 4x3 matrix (2009-2020)
						year--; //last year of the previous decade (2009)
						for (var i = 1; i <= 12; i++) {
							unselectable = (minYear !== 'undefined' && year < minYear) ||
								(maxYear !== 'undefined' && year > maxYear);
							//html += '<span class="year'+(i == -1 || i == 10 ? ' old' : '')+(currentYear == year ? ' active' : '')+'">'+year+'</span>';
							yearPicker += '<td class="' +
								(unselectable ? ' ' + this._unselectableClass + ' ui-state-disabled': '') +  // highlight unselectable months
								((!unselectable && (i==1 || i==12)) ? ' outoffocus' : '') +
								(year == drawYear ? ' ui-datepicker-today' : '') + '"' +
								(unselectable ? '' : ' onclick="jQuery.datepicker._pickMonthYear_MonthYearPicker(\'#' + inst.id + '\', ' + year + ', \'Y\');return false;"') + '>' + // actions
								((unselectable ? '<span class="ui-state-default">' + year + '</span>' : '<a class="ui-state-default ' +
								//(month == drawMonth ? ' ui-state-highlight' : '') +
								(year == drawYear ? ' ui-state-active' : '') + // highlight selected day
								//(otherMonth ? ' ui-priority-secondary' : '') + // distinguish dates from other months
								'" href="#">' + year + '</a>')) + '</td>'; // display selectable date
							if(i % 4 == 0) {
								yearPicker += '</tr>';
								if(i != 12) {
									yearPicker += '<tr>';
								}
							}
							year++;
						}
						yearPicker += '</tbody></table>';
						$('.ui-datepicker-select-year').html(yearPicker);
					};

					_updateYearPicker_MYP(year);

					var dpYearSelector = inst.dpDiv.find('.ui-datepicker-select-year table');
					this._addHoverEvents_MonthYearPicker(dpYearSelector);

					inst.dpDiv.find('table.ui-datepicker-calendar').hide();
					inst.dpDiv.find('.ui-datepicker-select-month').hide();
					inst.dpDiv.find('.ui-datepicker-select-year').show();

					this._reposition_MonthYearPicker(inst);
					
					break;
			}

		}

	});

})(jQuery);
