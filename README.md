# markline.js
A simple & light js for painting marklines.
<p align="center">
  <a href="https://github.com/Molunerfinn/markline.js">
    <img width="300px" height="300px" src="https://raw.githubusercontent.com/Molunerfinn/markline.js/master/img/markline.gif">
  </a>
<p>
这是一个轻量的、无依赖的canvas库。使用它你能够快速画出漂亮的矢量标线（markline）。

## 特性

- 支持缩放、拖动
- 支持背景图放置类型有img和canvas
- 无依赖、轻量（min版仅9kb）

## 示例

[DEMO](https://Molunerfinn.github.io/markline.js)

#### html
```html
<link rel="stylesheet" type="text/css" href="markline.css">
<script type="text/javascript" src="markline.min.js"></script>
...
<canvas id="canvas" width="1366" height="768"></canvas> 
<img id="bg" src="bg.jpg"></img>
```

> 准备一个canvas容器，以及一个背景（可以是图片也可以是canvas）（如果不提供背景将会自动用黑色背景填充）

#### data
```js
var data = [{
  from: { x: 300, y: 50 },
  to: { x: 50, y: 300 },
  style: '#fff',
  info: ['Hi,this is markline!']
},{
  ...
}]

```

> 准备好在图上描的线的两端坐标以及线的颜色，和鼠标hover上去后提示的信息

#### js
```js
var mkLine = markline('canvas','bg',1366,768);
mkLine.setOption(data);
mkLine.paint();
```

> 使用`.setOption()`的方法将数据导入,调用`.paint()`方法画出markline

Done.

## 说明文档

### 方法

> `markline()` 用于生成markline对象

### 参数说明

|参数名|是否必须|参数说明|
|--|--|--|
|canvasId|是|提供所需绘制的canvas元素的id名|
|bgId|否|提供一个绘制的背景图的id名（img、canvas皆可）|
|bgWidth|否|提供绘制背景图的宽度（不提供将默认使用canvas宽度）|
|bgHeight|否|提供绘制背景图的宽度（不提供将默认使用canvas高度）|

### 示例

```js
var mkLine = markline('canvas','bgId',1366,768);
```

### 方法

> `.setOption(json)` 用于导入绘制的信息

### 参数说明

|参数名|是否必须|参数说明|
|--|--|--|
|from|是|提供绘制起点的x和y坐标|
|to|是|提供绘制终点的x和y坐标|
|style|否|提供markline的颜色（不提供将默认使用白色）|
|info|否|提供鼠标hover上markline显示的信息（不提供将不显示）|

### 示例

```js
mkLine.setOption([{
  from: { x: 300, y: 50 },
  to: { x: 50, y: 300 },
  style: '#fff',
  info: ['Hi,this is markline!']
},{
  from: { x: 100, y: 100 },
  to: { x: 50, y: 300 },
  style: '#000',
  info: ['Hi,this is another markline!']
}])
```

**注意**: 先要通过`.setOption()`将数据导入后，调用该方法才可以绘出markline

### 方法

> `.paint()` 用于绘制markline

### 参数说明

无参数

### 示例

```js
mkLine.paint()
```

**注意**: 先要通过`.setOption()`将数据导入后，调用本方法才可以绘出markline

### 方法

> `.paintPoint(json)` 用于绘制标记点

### 参数说明

|参数名|是否必须|参数说明|
|--|--|--|
|x|是|提供绘制标记点的x坐标|
|y|是|提供绘制标记点的y坐标|
|style|否|提供绘制点的颜色（不提供将默认使用红色）|
|info|否|提供鼠标hover上绘制点显示的信息（不提供将不显示）|

### 示例

```js
mkLine.paintPoint([{
  x: 300,
  y: 50,
  style: '#fff',
  info: ['Hi,this is markline!']
},{
  x: 200,
  y: 100,
  style: '#000',
  info: ['Hi,this is another markline!']
}])
```

**注意**: 先要调用`.paint()`方法，再调用本方法才可以绘出标记点

### 方法

> `.getLines()` 用于返回各个markline标记线的对象信息

### 返回类型

`json`

### 示例

`[Line,Line,Line...]`

### 使用

```js

var lines = mkLine.getLines();

lines[0].style = 'red'; //修改第一条标记线的颜色为红色

```

### 方法

> `.getLine(id)` 用于返回确定id的markline标记线的对象信息

### 返回类型

`Object`

### 使用

```js

var line = mkLine.getLine(0);

line.style = 'red'; //修改第一条标记线的颜色为红色

```

### 方法

> `.getBalls()` 用于返回各个markline标记线上运动点的对象信息

### 返回类型

`json`

### 示例

`[Ball,Ball,Ball...]`

### 使用

```js

var balls = mkLine.getBalls();

balls[0].style = 'red'; //修改第一条标记线的运动点的颜色为红色

```

### 方法

> `.getBall(id)` 用于返回确定id的markline标记线的运动点的对象信息

### 返回类型

`Object`

### 使用

```js

var ball = mkLine.getBall(0);

ball.style = 'red'; //修改第一条标记线的运动点的颜色为红色

```

### 方法

> `.getPoints()` 用于返回各个标记点的对象信息

### 返回类型

`json`

### 示例

`[Point,Point,Point...]`

### 使用

```js

var points = mkLine.getPoints();

points[0].style = '#fff'; //修改第一个标记点的颜色为白色

```

### 方法

> `.getPoint(id)` 用于返回确定id的标记点的对象信息

### 返回类型

`Object`

### 使用

```js

var point = mkLine.getPoint(0);

point.style = '#fff'; //修改第一个标记点的颜色为白色

```

### 方法

> `.getHover()` 用于返回当鼠标在线或者点上时的相关信息

### 返回类型

`Object`

### 示例

```js
{
  hover: false,
  type: "",
  id: null
}
```

### 参数说明

|参数名|参数示例|参数说明|
|--|--|--|
|hover|true or false|用于返回是否触摸在线或者点上|
|type|"point" or "line" or ""|用于返回鼠标触摸在什么类型上|
|id|num or null|用于返回触摸上的线或者点的id|

### 使用

```js

var isHover = mkLine.getHover()
console.log(isHover);

```

**Tips**:通常和`.onContextmenu()`或者`.onClick()`事件进行配合使用

### 方法

> `.onClick(callback)` 当鼠标在所绘制的canvas上左键单击时触发的事件

### 使用

```js

mkLine.onClick(function(){
  var e = window.event;
  var canvas = document.getElementById("canvas");
  var mouse = {
    x : e.clientX - canvas.getBoundingClientRect().left,
    y : e.clientY - canvas.getBoundingClientRect().top
  };

  var isHover = mkLine.getHover();
  console.log(isHover);
});

```

**Tips**:通常和`.getHover()`事件进行配合使用


### 方法

> `.onContextmenu(callback)` 当鼠标在所绘制的canvas上右击时触发的事件

### 使用

```js

mkLine.onContextmenu(function(){
  var e = window.event;
  var canvas = document.getElementById("canvas");
  var mouse = {
    x : e.clientX - canvas.getBoundingClientRect().left,
    y : e.clientY - canvas.getBoundingClientRect().top
  };

  var isHover = mkLine.getHover();
  console.log(isHover);
});

```

**Tips**:通常和`.getHover()`事件进行配合使用

### 修改鼠标hover的提示样式

只需要更改markline.css里的`#mk-info`和`#mk-info div`的样式即可。

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Molunerfinn


