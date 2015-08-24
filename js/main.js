$(function () {

  var $e1 = $(".myMonthPicker").monthPicker({
    minDate: "2005-11",
    maxDate: "2016-01",
    selectedDate: "2015-08",
    // isOpen: true,
    selectBy: "quarter",
    select: updateSelectedMonth // Callback on select
  });

  function updateSelectedMonth (e, data) {
    $(".log").append("<div>" +  data.value + "</div>");
  }



});