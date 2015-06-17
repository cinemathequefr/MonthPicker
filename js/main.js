$(function () {

  var $e1 = $(".monthPicker").monthPicker({
    minDate: "2005-11",
    maxDate: "2015-08",
    selectedDate: "2015-06",
    isOpen: true,
    select: updateSelectedMonth, // NB: `select` event handler
  });

  function updateSelectedMonth (e, data) {
    $(".log").append("Mois sélectionné : " + data.value + "<br>");
  }

});