var _data = [];
var geoID = ["Area","Code","Description"]
var small_chart_height = 120
var fake = {}



function cleanup(d) {
  if (!_.contains(geoID,d.field.split("_")[0])){
    for(i in d){
      d[i]=d[i].trim()
      d[i] = +d[i] || d[i]
    }
    d.year = +d.year || "N/A"
    d.nMissing = +d.nMissing
    d.fractionMissing = +d.fractionMissing
    d.min = +d.min
    d.mean = +d.mean
    d.max = +d.max
    d.nBin = d.nMissing
    d.fracBin = 5*Math.floor(d.fractionMissing*20) //gives us a percentage, binned by 5%
   // console.log(d.fractionMissing, d.fracBin)
    _data.push(d)
  }
}

queue()
    .defer(d3.csv, "data/census_dict5.csv")
    .await(showCharts);

function showCharts(err, data) {

  for (i in data) {
    cleanup(data[i]);
  }
  
  ndx = crossfilter(_data);
  
filter_dim = ndx.dimension(function(d) {return d.field});

function number_geos_selected () {
  var l = geo_chart.filters().length;
  return (l==0)?6:l;
}
  
  
// ------------------------------ charts ----------------------------------- 

  
  geo = ndx.dimension(function(d) {return d.geography});
  geo_group = geo.group().reduceCount();
  geo_chart = dc.rowChart('#geo')
    .dimension(geo)
    .group(geo_group)
    .transitionDuration(200)
    .height(2*small_chart_height+38)
    .elasticX(true)
    .ordering(function(d){return -d.value})

  geo_chart.xAxis().ticks(2).tickFormat(integer_format);
  geo_chart.on('pretransition.dim', dim_zero_rows)

  year = ndx.dimension(function(d) { return d.year});

  year_group = year.group().reduceCount();
  year_chart = dc.rowChart('#year')
    .dimension(year)
    .group(year_group)
    .transitionDuration(200)
    .height(small_chart_height)
    .elasticX(true)
  
  year_chart.xAxis().ticks(4).tickFormat(integer_format);
  year_chart.on('pretransition.dim', dim_zero_rows)
  
  isMedian = ndx.dimension(function(d){return d.isMedian});
  isMedian_group = isMedian.group().reduceCount();
  
  isMedian_chart = dc.rowChart('#isMedian')
    .dimension(isMedian)
    .group(isMedian_group)
    .transitionDuration(200)
    .height(small_chart_height)
    .elasticX(true)
 
  isMedian_chart.xAxis().ticks(4).tickFormat(integer_format);
  isMedian_chart.on('pretransition.dim', dim_zero_rows)
  
  isTotal = ndx.dimension(function(d){return d.isTotal});
  isTotal_group = isTotal.group().reduceCount();  
  
   isTotal_chart = dc.rowChart('#isTotal')
    .dimension(isTotal)
    .group(isTotal_group)
    .transitionDuration(150)
    .height(small_chart_height)
    .elasticX(true)
 
  isTotal_chart.xAxis().ticks(4).tickFormat(integer_format);
  isTotal_chart.on('pretransition.dim', dim_zero_rows)  
  
  isHousehold = ndx.dimension(function(d){return d.isHousehold});
  isHousehold_group = isHousehold.group().reduceCount();  
  
   isHousehold_chart = dc.rowChart('#isHousehold')
    .dimension(isHousehold)
    .group(isHousehold_group)
    .transitionDuration(200)
    .height(small_chart_height)
    .elasticX(true)
   
  isHousehold_chart.xAxis().ticks(4).tickFormat(integer_format);
  isHousehold_chart.on('pretransition.dim', dim_zero_rows)  
  
  isFamily = ndx.dimension(function(d){return d.isFamily});
  isFamily_group = isFamily.group().reduceCount();  
  
   isFamily_chart = dc.rowChart('#isFamily')
    .dimension(isFamily)
    .group(isFamily_group)
    .transitionDuration(200)
    .height(small_chart_height)
    .elasticX(true)

  isFamily_chart.xAxis().ticks(4).tickFormat(integer_format);
  isFamily_chart.on('pretransition.dim', dim_zero_rows) 
  
  isDwelling = ndx.dimension(function(d){return d.isDwelling});
  isDwelling_group = isDwelling.group().reduceCount();  
  
   isDwelling_chart = dc.rowChart('#isDwelling')
    .dimension(isDwelling)
    .group(isDwelling_group)
    .transitionDuration(200)
    .height(small_chart_height)
    .elasticX(true)

  isDwelling_chart.xAxis().ticks(4).tickFormat(integer_format);
  isDwelling_chart.on('pretransition.dim', dim_zero_rows) 
  
  fracMissing = ndx.dimension(function(d){return d.fracBin});
  fracMissing_group = fracMissing.group().reduceCount();  
  
   fracMissing_chart = dc.barChart('#fracMissing')
    .dimension(fracMissing)
    .group(fracMissing_group)
    .x(d3.scale.linear().domain([0,100]))
    .xUnits(dc.units.fp.precision(5))
    .transitionDuration(200)
    .height(small_chart_height)
    .elasticY(true)   
   
   
  fracMissing_chart.yAxis().ticks(3).tickFormat(integer_format);
  fracMissing_chart.xAxis().ticks(4).tickFormat(function(d){return d+"%"});
  
  
  
  
  field = ndx.dimension(function(d){return d.field});

    var table_chart = dc.dataTable("#dc-table-graph")
     .dimension(field)
     .group(function (d) {
      return d.geography;
     })
    .columns([
      function (d) {return d.index},
      function (d) {return long_string_format(d.field)},
      function (d) {return table_format(d.min)},
      function (d) {return table_format(d.mean)},
      function (d) {return table_format(d.max)},
      function (d) {return table_format(d.nMissing) +" (" +d3.format("%")(d.fractionMissing)+")"},
      function (d) {return d.dataType}
    ])
    .on("pretransition.title", function(){
      d3.selectAll("tr.dc-table-row").attr({title: function(d){return d.field}})
    })

    outputArray = _.uniq(_.pluck(field.top(10000),"index"))
    d3.select("#t-count").text(d3.format(",")(outputArray.length)) 
 //--------------events------------------------------------------------------     
    
    generateSearchbox(field,'filter')
    //d3.select("i#generate-array").on("click", generateText)
    d3.select("i#to-clipboard").on("click", copyToClip)
    generateText()
    _.map(dc.chartRegistry.list(),function(d){d.on("filtered.generateText", generateText)})
     
    _.map(dc.chartRegistry.list(),function(d){d.on("postRedraw.invisibleTick",
        function(){d3.selectAll(".tick").classed("invisible_tick", function(d){return Math.floor(d) != d})}
                                                   )})
    
    
  dc.renderAll();
  
  
  
  
}
