# MonthPicker widget

Version 0.1.0

A month picker for jQuery.

Built upon jQuery UI widget factory (http://api.jqueryui.com/jQuery.widget/).

Dependencies: jQuery, jQuery UI widget factory

## Instantiation

`$(".someElement").monthPicker(options);`

## Options

An options object can be passed to the constructor with the following properties:

Parameter|Description|Default
:--|:--|:--
minDate|**(String)** Lower year/month, "yyyy-mm"|`null`
maxDate|**(String)** Upper year/month "yyyy-mm"|`null`
selectedDate|**(String)** Selected year/month, "yyyy-mm"|`null`
isOpen|**(Boolean)** Is the calendar initially open (expanded)?|`false`
monthShortNames|**(Array)** Months -- short names|`[null, "Jan", "Fév"..."Déc"]`
monthLongNames|**(Array)** Months -- long names|`[null, "Janvier", "Février"..."Décembre"]`
select|**(Function)** Callback invoked when the selected date changes|noop

Month names defaults are in French. Note that the value at index 0 is ignored (the month indices follow the month numbers).

## API

Options can't currently be updated dynamically once the widget is instantianted (TODO). An API provides simple methods to interact programmatically with the widget.

Verb|Example|Remark
:-:|:--|:--
setDate|`$(el).monthPicker("setDate", "2010-10");`|
–|`$(el).monthPicker("setDate");`|No date selected
open|`$(el).monthPicker("open");`|Open calendar
close|`$(el).monthPicker("close");`|Close calendar
toggle|`$(el).monthPicker("toggle");`|Toggle open/close
