// highlighted-series
$(document).ready(function () {
  var gs = []; // To put group of Dygraphs
  var generateData = function(numSeries, numRows) {
    // Generate random data for testing
    var data = [];

    for (var j = 0; j < numRows; ++j) {
      data[j] = [j];
    }
    for (var i = 0; i < numSeries; ++i) {
      var val = 0;
      for (var j = 0; j < numRows; ++j) {
        val += Math.random() - 0.5;
        data[j][i + 1] = val;
      }
    }
    return data;
  };

  var buildChart = function(className, numSeries, numRows) {
    var demo = document.getElementById('demo');
    var div = document.createElement('div');
    div.className = className;
    div.style.display = 'inline-block';
    div.style.margin = '4px';
    demo.appendChild(div);

      tooltipOn = function(e, x, pts, row, seriesName, i) {
        var tooltipElement = document.getElementById("tooltip"+i);
        tooltipElement.style.display = "inline";
        $("#tooltip"+i).position({
          my: "center bottom",
          of: e,
          collision: "fit"
        });
        getHighlightedValue = function(pt){
          if (pt.name == seriesName) {
            $("#tooltip"+i).html(pt.yval);
            // 소수점 처리하기
            return pt.yval;
          }
        };
        pts.forEach(getHighlightedValue);
      }

    var labels = ['x'];
    for (var i = 0; i < numSeries; ++i) {
      var label = '' + i;
      label = 's' + '000'.substr(label.length) + label;
      labels[i + 1] = label;
    }
    var g = new Dygraph(
        div,
        generateData(numSeries, numRows), // Sample data
        {
          width: 480,
          height: 320,
          labels: labels.slice(),

          highlightCircleSize: 2,
          strokeWidth: 1,
          strokeBorderWidth: 1,

          highlightSeriesOpts: {
            strokeWidth: 2,
            highlightCircleSize: 3
          },

          highlightCallback: function(e, x, pts, row, seriesName) {
            if (seriesName) {
              var me = this;
              tooltipOn(e, x, pts, row, seriesName, gs.indexOf(me));
              for (var i = 0; i < gs.length; i++) {
                // Access to the synchronized Dygraphs
                if (me != gs[i]) {
                  if (gs[i].file_.length > row) {
                    // Get y values with same x and get maximum among them
                    var valuesInRow = gs[i].file_[row];
                    valuesInRow.shift(); // 첫 element 는 row number 이므로 제외하고 max 값 구함
                    var newSeriesName = seriesName;
                    var max = valuesInRow.reduce( function (previous, current) {
                      return previous > current ? previous : current;
                    });
                    var newSeriesIndex = valuesInRow.indexOf(max);
                    var temp = '' + newSeriesIndex;
                    newSeriesName = 's' + '000'.substr(temp.length) + temp;
                    gs[i].setSelection(row, newSeriesName); // highlight the series with max value

                    // Tooltips for synchronized graphs
                    var maxPoint = gs[i].selPoints_.filter(function(point) {
                      return point.name === newSeriesName;
                    });
                    var canvas = gs[i].canvas_;
                    var parentDiv = ($(canvas).parent())[0];
                    var tooltip = document.getElementById("tooltip"+i);
                    tooltip.style.display = "inline";
                    tooltip.style.position = "absolute";
                    tooltip.style.top = parentDiv.offsetTop + maxPoint[0].canvasy + "px";
                    tooltip.style.left = parentDiv.offsetLeft + maxPoint[0].canvasx + "px";
                    $(tooltip).html(max);
                    valuesInRow.unshift(row); // 다시 그 row를 선택할 것을 대비해서 원래 형태로 보존
                  }
                }
              }
            }
              },
          unhighlightCallback: function(e) {
                var tooltipElement = document.getElementById('tooltip'+gs.indexOf(this));
                tooltipElement.style.display = "none";
                for (var i = 0; i < gs.length; i++) {
                  // Unhighlight synchronized graphs
                  // if (me != gs[i]) {
                  //   gs[i].clearSelection(); // 잘 작동하지 않는다
                  // }
                }
              },
           plugins: [
            new Dygraph.Plugins.Crosshair({
              direction: "vertical"
            })
          ]
        });
    
    // Max value 부분 표시
    g.ready(function() {
      g.setAnnotations([
      {
        series: "seriesName", // Series Name that contains maximum value
        x: "10", // x value with the maximum y value
        shortText: "L",
        text: "Testonetwo"
      }
      ]);
    });

    gs.push(g);
  };

  buildChart("many", 40, 50);
  buildChart("many", 40, 50);
  buildChart("many", 40, 50);
  buildChart("many", 40, 50);
  var sync = Dygraph.synchronize(gs, {
      selection: false
   });

});