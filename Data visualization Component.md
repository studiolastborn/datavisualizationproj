# Data visualization Component
작성자 : 인턴사원 서아현
Initial draft : 23 Jan, 2017
Last updated : 22 Feb, 2017

### Introduction
This project is to build a charting component using javascript. Using appropriate existing library, the component should implement key features such as 
* Max value
* Tooltip (Near value)
* Cross hairline (Synchronization)
* Tick value formatter
* Multiple charts (line, area)
* Null value handling

So it is important to choose appropriate library. Javascript charting library uses either HTML5 Canvas or SVG. For realtime data processing Canvas is better than SVG.

**Plans**
* Research for Javascript charting libraries (using Canvas)
* Decide library to use
* Go through tutorials
* Build a javascript component using the library
* Make sample use cases

### Research for Javascript charting libraries (using Canvas)
|                                        | Dygraphs.com                                                       | Chart.js                                               | Canvas.js                                 |
|----------------------------------------|--------------------------------------------------------------------|--------------------------------------------------------|-------------------------------------------|
| Max value                              | Get max value using API                                            | Manually                                               | Manually                                  |
| Tooltip                                | yes                                                                | yes                                                    | yes                                       |
| Near value(series)                     | Manually (example exists)                                          | Manually                                               | Manually                                  |
| Synchronization                        | yes (using option)                                                 | no                                                     | Manually (simple)                         |
| Cross hairline                         | yes                                                                | no                                                     | yes                                       |
| Tick value formatter (K, M, G after #) | yes                                                                | Manually                                               | Support K, M, G seperately                |
| Line and Area chart                    | Fill area below line chart  and display multiple charts            | Fill area below line chart and display multiple charts | Display line chart and  Spline area chart |
| Null value handling                    | Able to toggle connectSeparateData  (whether to display nonexisting value) | Manually                                               | Does not display null or empty values     |
| Performance                            | Good for large data set                                            | Only for small data set                                | Good for large data set                   |
| License                                | Free under MIT license                                             | Free                                                   | Paid service                              |


First of all, it is important to use free license library. Chart.js and Dygraphs.com were free but Chart.js is lack of some requires features. Dygraphs.com might be difficult to use, but it is well-documented and contains a lot of ready-to-use examples in the website.
**Considering all the options, I decided to use *Dygraphs.com*.**

### Dygraphs.com 기능 탐구
**MAX value 표시**
내장 함수로는 지원되지 않고 있다.
https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math/max
data 상에서 직접 max 값 찾은 후 setAnnotations 이용해서 그래프 위에 표시해주면 된다.
annotations은 data point 위에 표시하는 기능(tooltip)이다.

**TOOLTIP Mouseover**
mouseover로 data값 보여주는 것은 내장 함수로 구현되어 있다.
이 기능으로는 label들로 값을 보여준다. 
tooltip 기능은 annotations라는 이름으로 존재하지만 실시간으로 표시하려면 직접 구현해야 한다.
showLabelsOnHighlight  
Whether to show the legend upon mouseover.
이 기능은 default : true로 설정되어 있다.

**Near value 표시**
한 x value에 대해 여러 Series가 존재할 때 제일 가까운 series의 값을 표시해주는 기능이다.
Dygraphs options에 구현되어 있다.
Tooltip 보다 label로 표시하는 것이 더 좋을 수도 있을 것 같다.
해당 series의 label만 표시할지, 모든 series를 표시 후 제일 가까운 value를 강조할지는 간단한 css로 조절할 수 있다.
Highlight시 styling도 내장 option들을 이용하면 쉽다. (크기, 투명도, 색깔 등)

(Get the nearest series)
[highlightSeriesOpts] 
When set, the options from this object are applied to the timeseries closest to the mouse pointer for interactive highlighting. See also 'highlightCallback'. Example: highlightSeriesOpts: { strokeWidth: 3 }.

(Styling)
[highlightCircleSize]  
The size in pixels of the dot drawn over highlighted points.
highlightSeriesBackgroundAlpha  
Fade the background while highlighting series. 1=fully visible background (disable fading), 0=hiddden background (show highlighted series only).
highlightSeriesBackgroundColor  
Sets the background color used to fade out the series in conjunction with 'highlightSeriesBackgroundAlpha'.

Dygraphs methods
[getHighlightSeries()]
Returns the name of the currently-highlighted series. Only available when the highlightSeriesOpts option is in use.

**NULL value handing**
connectSeparatedPoints default : false
기본적으로 존재하지 않는 data point를 비워두게 되어 있다.

**Crosshairline (synchronize)**
http://dygraphs.com/tests/crosshair.html 이 예시를 보면
```sh
 plugins: [
            new Dygraph.Plugins.Crosshair({
              direction: "vertical"
            })
          ]
```
플러그인을 통해 마우스 오버 시 vertical/horizontal hairline을 추가할 수 있다.

 
Sync 된 두 차트 Dygraphs 에서도 나오게 하려면 다음 자료를 참고하면 된다.
http://stackoverflow.com/questions/23121893/two-dygraphs-with-synchronized-crosshair?noredirect=1&lq=1

synchronize 자체는 내장 함수로 구현되어 있으며  dygraphs.com를 group화 시키면 된다.
http://dygraphs.com/gallery/#g/synchronize
https://github.com/danvk/dygraphs/blob/master/src/extras/synchronizer.js

**Tick label formatter**
내장 함수로 구현되어 있다.
http://dygraphs.com/options.html#labelsKMB
KMB는 10진법, KMG2는 2진법으로 나타낸다.


### CHART component 기능구현


Sample data 로 4 개의 그래프를 그린후 서로 sync 시켜서 구현했다.
Crosshair 의 경우 기존에 존재하는 plugin 을 통해 쉽게 구현하였으나
plugin 자체의 error 가 자주 발생해서 대안을 모색중이다.

가장 난이도가 높을 것으로 예상된 tooltip 기능부터 구현을 시작했다.
원래는 mouseover 한 포인트의 data coordinate 에 div를 display 시키려고 했으나, 
jQuery 를 이용하여 다음과 같이 간단하게 tooltip을 구현할 수 있었다.

```sh
tooltipOn = function(e, x, pts, row, seriesName) {
        tooltipElement.style.display = "inline";
        $("#tooltip").position({
          my: "center bottom",
          of: e,
          collision: "fit"
        });
        getHighlightedValue = function(pt){
          if (pt.name == seriesName) {
            $("#tooltip").html(pt.yval);
            // 소수점 처리하기
            return pt.yval;
          }
        };
        pts.forEach(getHighlightedValue);
      }
```

tooltipOn 함수는 Dygraph의 highlight Callback 부분에 위치하게 된다.
```sh
highlightCallback: function(e, x, pts, row, seriesName) {}
```
Dygraph에 mouseover 했을 때 highlight 되며 이 때의 x 값이나 point값들을 등을 알 수 있다. 이때 e 는 mouseover event 여서 jQuery 를 통해 해당 event 의 position 을 알아내어 tooltip div를 위치시킬 수 있었다. tooltip 에는 해당 y value를 넣게 되는데 이 때는 pts(해당하는 x 값을 가지는 모든 점들) 중에서 seriesName 이 일치하는 값을 찾아서 넣었다.

Tooltip 시에 또 다른 중요한 것은 sync 된 다른 그래프에도 tooltip이 생겨야 하는 것이다. Digraph sync 의 기본 option 은 같은 Series 의 그래프가 highlight 되는 것인데, 현재 구현하는 chart component 의 경우 sync 된 그래프에서는 maximum value를 찾아서 표시해야 했다. sync 된 그래프는 gs 라는 Array에 모두 담겨 있어서, 현재 mouseover된 그래프를 제외한 나머지 그래프들 중에서 같은 x 를 가진 y value들 중 최대값을 구해서 해당하는 값과 그 값이 존재하는 seriesName을 알아냈다. highlight 시키기 귀해서 Digraphs API에 있는 setSelection 함수를 이용했다. Select 된 series 가 highlight 되므로 기존의 selection을 Clear 하고 새로운 Selection 을 지정할 수 있었다.

```sh
for (var i = 0; i < gs.length; i++) {
                // Access to the synchronized Dygraphs
                if (me != gs[i]) {
                  if (gs[i].file_.length > row) {
                    gs[i].clearSelection(); // reset auto highlight
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
                    valuesInRow.unshift(row); // 다시 그 row를 선택할 것을 대비해서 원래 형태로 보존
                  }
                }
              }
```

gs 의 각 원소(Digraph) 에서 file_ 에 접근하면 2D array로 raw data를 모두 볼 수 있었으며 row number를 index 로 접근하면 x 값이 같은 모든 y value들을 볼 수 있다. 단 이 때 0번째 value는 row number 이므로 max value 를 구하기 전에 shift 로 없애주고 나중에 setSelection을 한 이후에 unshift로 다시 넣어준다. 이렇게 해야하는 이유는 추후에 그 row 가 재차 highlight 됐을 때 이전에 shift 되었어서 missing value가 생기기 때문이다.


성공적으로 됐을 때 아래와 같은 양상을 보이는데, 가끔 div 가 밀려서 잘 나타나지 않는다. 이부분에 대해서는 trouble shooting 을 진행중이다.

이 기능을 완성시킬 시 남은 기능은 Max value를 표시하는 것인데,  이 경우 max 값을 plain javascript 로 구한 구 setAnnotation을 이용해서 그래프가 처음 그려질 때 바로 표시하면 된다. 오랜 시간이 소요되지는 않을 것으로 예상된다.

**Sync 된 그래프들의 Highlight 기능 보완**
기존엔 Highlight (Selection)을 sync 시킨 상태에서 clearSelection을 통해 해제하고 새로운 setSelection을 만들어주었는데, sync를 처음 시킬때 selection:false 옵션을 주어서 Highlight callback 에서 바로 max value를 가지는 series를 setSelection을 통해 별다른 오류 없이 highlight 시킬 수 있었다. 기존 방법이 다소 불안정했으나 새로운 접근을 통해 더 간단하고 안정적으로 구현할 수 있었다. 아직도 div 밀림이 간혹 발생하기 때문에 추가적인 troubleshooting이 필요하다.

```sh
  var sync = Dygraph.synchronize(gs, {
      selection: false
   });
```

**Max value 표시**
```sh
    g.ready(function() {
      g.setAnnotations([
      {
        series: "s008", // Series Name that contains maximum value
        x: "10", // x value with the maximum y value
        shortText: "L",
        text: "Testonetwo"
      }
      ]);
    });
```
g 즉 Dygraph를 그린 후에 annotation을 maximum value 부분에 추가하는 방식이다. 현재 series name과 x 를 제대로 넣어도 Annotation이 잘 표시되지 않아 찾아보는 중이다. series name 이 틀리지 않기 때문에 Annotation 자체의 issue 이거나 x value 의 문제일 것이다. Max value의 경우 raw data에서 max 값을 구해와서 진행할 것이다.

**Crosshair 안정화**
sync 할 때 selection: false를 준 이후에 crosshair plugin도 안정하게 작동한다.

**Unhighlight callback**
mouse over 한 그래프에서 커서를 밖으로 옮겼을 때 sync 되어있던 그래프에 아직도 highlight 되어 있어서 unhighlight callback에서 
```sh
unhighlightCallback: function(e) {
                var tooltipElement = document.getElementById('tooltip');
                tooltipElement.style.display = "none";
                for (var i = 0; i < gs.length; i++) {
                  // Unhighlight synchronized graphs
                  if (me != gs[i]) {
                    gs[i].clearSelection();
                  }
                }
              },
```
clearSelection 함수를 이용해서 없애주는 작업을 했는데, 의도대로 작동하지 않고 있어서 방법을 모색하는 중이다.

**Tooltip for synchronized Dygraphs**
이전 과정들에서 Synchronized graph에서 최댓값을 가지는 series와 x, y value를 알아냈다. 그 정보를 이용해서 Digraph 상의 좌표를 찾은 후 해당 Digraph canvas의 offSet을 고려해 직접 tooltip의 위치와 내용을 지정해줄 수 있었다. 약간의 위치 조정이 필요하지만 기능은 구현해낼 수 있었다.

```sh
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
```