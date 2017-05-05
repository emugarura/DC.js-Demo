function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

var data = [];
d3.csv("MOCK_DATA.csv")
    .row(function(d) { return {date: d.date, status: d.status, source: d.source, device: d.device}; })
    .get(function(error, rows) { assignData(rows);});
var assignData = function(data){

  console.log(data.length)

  var ndx = crossfilter(data);
  var parseDate = d3.time.format("%m/%d/%Y").parse;
  data.forEach(function(d) {
  	d.date = parseDate(d.date);
    d.Year=d.date.getFullYear();
  });

  var dateDim = ndx.dimension(function(d) {return d.date;});
  var statusDim = ndx.dimension(function(d) {return d.status;});
  var sourceDim = ndx.dimension(function(d) {return d.source;});
  var deviceDim = ndx.dimension(function(d) {return d.device;});
  var yearDim  = ndx.dimension(function(d) {return +d.Year;});
  var dayDim = ndx.dimension(function (d) {
     var day = d.date.getDay();
     switch (day) {
       case 0:
         return "0.Sun";
       case 1:
         return "1.Mon";
       case 2:
         return "2.Tue";
       case 3:
         return "3.Wed";
       case 4:
         return "4.Thu";
       case 5:
         return "5.Fri";
       case 6:
         return "6.Sat";
     }
   });

  var startDateGroup = dateDim.group().reduceCount();
  var statusGroup = statusDim.group().reduceCount();
  var sourceGroup = sourceDim.group().reduceCount();
  var deviceGroup = deviceDim.group().reduceCount();
  var year_total = yearDim.group().reduceCount();
  var dayGroup = dayDim.group();

  console.log(startDateGroup);
  var minDate = dateDim.bottom(1)[0].date;
  var maxDate = dateDim.top(1)[0].date;
  console.log(maxDate)



  console.log(year_total)

  var registeredLineChart  = dc.lineChart("#chart-line-registeredperday");
  var registeredBarChart  = dc.barChart("#chart-bar-registeredperday");
  var dayRowChart = dc.rowChart("#chart-row-day");
  var volumeChart  = dc.barChart("#volume-chart");
  var yearRingChart  = dc.pieChart("#chart-ring-year");
  var statusRingChart  = dc.pieChart("#chart-ring-status");
  var sourceRingChart  = dc.pieChart("#chart-ring-source");
  var deviceRingChart  = dc.pieChart("#chart-ring-device");

  registeredLineChart
    .width(560).height(200)
    .dimension(dateDim)
    .group(startDateGroup, "Start Date")
    .renderArea(true)
    .x(d3.time.scale().domain([minDate,addDays(maxDate,2)]))
    .rangeChart(volumeChart)
    .brushOn(false)
    .on('filtered', function(chart, filter){console.log(dateDim.top(Infinity))})
    .yAxisLabel("Number Registered")
    .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
  registeredBarChart
    .width(560).height(200)
    .dimension(dateDim)
    .group(startDateGroup, "Start Date")
    .x(d3.time.scale().domain([minDate,addDays(maxDate,2)]))
    .rangeChart(volumeChart)
    .brushOn(false)
    .on('filtered', function(chart, filter){console.log(dateDim.top(Infinity))})
    .yAxisLabel("Number Registered")
    .xUnits(function(){return 60;});
  dayRowChart
    .width(560)
    .height(220)
    .margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(dayDim)
    .group(dayGroup)
    .colors(d3.scale.category10())
    .label(function (d){
       return d.key.split(".")[1];
    })
    .title(function(d){return d.value;})
    .elasticX(true)
    .xAxis().ticks(4);
  volumeChart
    .width(1120) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
    .height(80)
    .margins({top: 0, right: 50, bottom: 20, left: 40})
    .dimension(dateDim)
    .group(startDateGroup)
    .centerBar(true)
    .gap(1)
    .x(d3.time.scale().domain([addDays(minDate,-2),addDays(maxDate, 2)]))
    .xUnits(function(){return 80;})
    .on("filtered", function (chart) {
              dc.events.trigger(function () {
                  registeredBarChart.focus(chart.filter());
                  registeredLineChart.focus(chart.filter());
                  dc.redrawAll(chart.chartGroup());
              });
          });

  volumeChart.yAxis().ticks(0);
  yearRingChart
    .width(280).height(280)
    .dimension(yearDim)
    .group(year_total)
    .innerRadius(30)
    .on('filtered', function(chart, filter){})
    .renderlet(function(chart){
          chart.selectAll('text.pie-slice').text( function(d) {
          return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
          })
      })
  statusRingChart
    .width(280).height(280)
    .dimension(statusDim)
    .group(statusGroup)
    .innerRadius(30)
    .on('filtered', function(chart, filter){})
    .renderlet(function(chart){
          chart.selectAll('text.pie-slice').text( function(d) {
          return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
          })
      })
  sourceRingChart
    .width(280).height(280)
    .dimension(sourceDim)
    .group(sourceGroup)
    .innerRadius(30)
    .on('filtered', function(chart, filter){})
    .renderlet(function(chart){
          chart.selectAll('text.pie-slice').text( function(d) {
          return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
          })
      })
  deviceRingChart
    .width(280).height(280)
    .dimension(deviceDim)
    .group(deviceGroup)
    .innerRadius(30)
    .on('filtered', function(chart, filter){})
    .renderlet(function(chart){
          chart.selectAll('text.pie-slice').text( function(d) {
          return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
          })
      })
  dc.renderAll();
}
