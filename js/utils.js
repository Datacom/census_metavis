
function generateText(){
  outputArray = _.uniq(_.pluck(field.top(10000),"index"))
  outputLength = outputArray.unshift(1,2,3)
  outputText = JSON.stringify(outputArray)
  d3.select("#out").attr({title : outputText}).node().value= outputText
  d3.select("#f-count").text(d3.format(",")(outputLength)) 
}

function copyToClip(){
  var copyText = d3.select("#out").node();
      copyText.select();
      document.execCommand("copy", false, null);
}

//------------formats-----------------

var format_s = d3.format('s') //SI prefix
var format_d = d3.format('d') //integer

var integer_format = function(d){if (d==0) {return format_d(d)} 
                                 else if(Math.floor(d) != d){return ""} //because you can't have fractional consents
                                 else {return format_s(d)} //SI prefix 
                                } 
var table_format = function(d){
  if (isNaN(d)){return "-"}
  else
  return d3.format(".2s")(d)
  //return "panda"
                              }

var title_integer_format =d3.format(',') 

var resetSearch = function(searchBox){
  d3.select("i#filter_reset").classed({noFilter:true})
  document.getElementById("filter").value = ""
}

var generateSearchbox = function(dimension,filterName) {
  document.getElementById(filterName).onkeyup = function(e) 
  {
    text = e?e.target.value.toUpperCase():'';
    d3.select("i#"+filterName+"_reset").classed({noFilter:function(){return text===''}});  
    dimension.filterFunction(function(d){
      return d.toUpperCase().indexOf(text) > -1;
    })
    generateText()
    dc.redrawAll()
  }
}

var long_string_format = function(d){ 
  if (d.length > 91){
    return d.slice(0,90)+"..."
  }
  else return d  
}

//------dc formatting stuff------------

function dim_zero_rows(chart) {
  chart.selectAll('text.row').classed('dim',function(d){return (d.value < 0.1)});
}