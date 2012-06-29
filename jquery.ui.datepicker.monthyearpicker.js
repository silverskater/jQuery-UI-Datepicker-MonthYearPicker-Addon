/*
Month and Year picker for jQuery UI Datepicker 1.8.21

Written by Anton Ludescher (silverskater{at}gmail.com).
Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. */


(function( $, undefined ) {

	//overriding functions meant to be private (starting with an underscore)
	$.datepicker._updateDatepicker_MonthYearPicker = $.datepicker._updateDatepicker;
	$.datepicker._showDatepicker_MonthYearPicker = $.datepicker._showDatepicker;

	$.extend($.datepicker, {
		
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
			
			//inst.dpuuid
			this._retrieveDPUID_MonthYearPicker(inst);
			var dpuuid = inst.dpuuid;
			//console.log($('<div>').append(this.dpDiv.clone()).html());
			
			var uidptitle = inst.dpDiv.find('.ui-datepicker-title');
			uidptitle.wrapInner('<a href="#" onclick="DP_jQuery_' + dpuuid + 
				'.datepicker._toggleDisplay_MonthYearPicker(\'#' + inst.id + '\', 2);return false;" />');

			inst.dpDiv.children('table.ui-datepicker-calendar').after(this._generateExtraHTML_MonthYearPicker(inst));
		},		
		
		_retrieveDPUID_MonthYearPicker: function(inst) {
			if (!inst.dpuuid)
			{
				for(attr in window)
				{
					if(/^DP_jQuery_/.test(attr))
					{
						 inst.dpuuid = attr.replace(/^DP_jQuery_([0-9]+)/, '$1');
					}
				}
			}
		},
		
		_generateExtraHTML_MonthYearPicker: function(inst) {
			var dpuuid = inst.dpuuid;
			var minDate = this._getMinMaxDate(inst, 'min');
			var maxDate = this._getMinMaxDate(inst, 'max');
			var drawYear = inst.drawYear;
			var drawMonth = inst.drawMonth;
			var inMinYear = (minDate && minDate.getFullYear() == drawYear);
			var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);
			var monthNamesShort = this._get(inst, 'monthNamesShort');
			var unselectable = false;

			var monthPicker = '<table><tbody><tr>';
			
			for (var month = 0; month < 12; ) {
				unselectable = 	(inMinYear && month < minDate.getMonth()) ||
												(inMaxYear && month > maxDate.getMonth());
				monthPicker += '<td class="' +
					(unselectable ? ' ' + this._unselectableClass + ' ui-state-disabled': '') +  // highlight unselectable months
					(month == drawMonth ? ' ui-datepicker-today' : '') + '"' +
					(unselectable ? '' : ' onclick="DP_jQuery_' + dpuuid + 
						'.datepicker._pickMonthYear_MonthYearPicker(\'#' + inst.id + '\', ' + month + ', \'M\');return false;"') + '>' + // actions
					((unselectable ? '<span class="ui-state-default">' + monthNamesShort[month] + '</span>' : '<a class="ui-state-default ' +
					//(month == drawMonth ? ' ui-state-highlight' : '') +
					(month == drawMonth ? ' ui-state-active' : '') + // highlight selected day
					//(otherMonth ? ' ui-priority-secondary' : '') + // distinguish dates from other months
					'" href="#">' + monthNamesShort[month] + '</a>')) + '</td>'; // display selectable date
				
				if(++month % 4 == 0) {
					monthPicker += '</tr>';
					if(month != 12) {
						monthPicker += '<tr>';
					}
				}
			}
			monthPicker += '</tbody></table>';
			
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

		_toggleDisplay_MonthYearPicker: function(id, screen) {
			//var inst = this._curInst;
			var target = $(id);
			var inst = this._getInst(target[0]);
			if (this._isDisabledDatepicker(target[0])) {
				return;
			}
			var dpuuid = inst.dpuuid;
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
			
			switch (screen) {
				case 2:
					//month picker
					//var inMinYear = (minDate && minDate.getFullYear() == drawYear);
					//var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);
					var inMinYear = (minYear !== undefined && minYear == drawYear);
					var inMaxYear = (maxYear !== undefined && maxYear == drawYear);
					//change prev next behaviour
					var _advanceYear_MYP = function(diff) {
						inst.drawYear = drawYear += diff;
						dpTitle.children(':first').text(drawYear);
					}
					dpPrev.removeAttr('onclick');
					if(!inMinYear) {
						dpPrev.removeClass('ui-state-disabled').click(function() {_advanceYear_MYP(-1)});
					}
					else {
						dpPrev.addClass('ui-state-disabled');
					}
					dpNext.removeAttr('onclick');
					if(!inMaxYear) {
						dpNext.removeClass('ui-state-disabled').click(function() {_advanceYear_MYP(1)});
					}
					else {
						dpNext.addClass('ui-state-disabled');
					}
					//change title link behaviour
					dpTitle.html('<a href="#" onclick="DP_jQuery_' + dpuuid + 
						'.datepicker._toggleDisplay_MonthYearPicker(\'#' + inst.id + '\', 3);return false;">' + drawYear +'</a>');
					$('table.ui-datepicker-calendar').hide();
					$('.ui-datepicker-select-month').show();
					$('.ui-datepicker-select-year').hide();
					break;
				case 3:
					//year picker
					var year = parseInt(drawYear/10, 10) * 10;  //first year in this decade
					//change title link behaviour
					dpTitle.unbind('click');
					//change prev next behaviour
										
					var _generateYearPicker_MYP = function(year) {
						//title text
						dpTitle.text(year + '-' + (year + 9)); //2010 - 2019
						//change prev next behaviour
						dpPrev.unbind('click');
						dpNext.unbind('click');
						if(year > minYear) {
							dpPrev.removeClass('ui-state-disabled').click(function() {_generateYearPicker_MYP(year-21)}); //year is 2021 at this point
						}
						else {
							dpPrev.addClass('ui-state-disabled');
						}
						if(maxYear === undefined || year+9 < maxYear) {
							dpNext.removeClass('ui-state-disabled').click(function() {_generateYearPicker_MYP(year-1)});
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
								(unselectable ? '' : ' onclick="DP_jQuery_' + dpuuid + 
									'.datepicker._pickMonthYear_MonthYearPicker(\'#' + inst.id + '\', ' + year + ', \'Y\');return false;"') + '>' + // actions
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
					}

					_generateYearPicker_MYP(year);
					
					$('table.ui-datepicker-calendar').hide();
					$('.ui-datepicker-select-month').hide();
					$('.ui-datepicker-select-year').show();
					
					break;
			}

		}

	});

})(jQuery);
