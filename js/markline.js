(function(window,undefined){

  // 球、点、线相关
  var balls = [];
  var lines = [];
  var points = [];
  var lineCount = 0;
  var ballCount = 0;
  var pointCount = 0;
  // 小球运动速度
  var percent = 0;   
  // 画布全局变量
  var cvs;
  var ctxGlobal;
  // 背景长宽
  var canWidth,
      canHeight;
  // 背景id 
  var imgId = "";
  // 点击、触摸相关
  var clickFlag = "false";
  var pointerStyle = "default";
  var hoverFlag = {
    hover: false,
    type: "",
    id: null
  }
  // 缩放变量
  var scaleFlag = 0;
  // 背景位置（主要参考位置）
  var imgPosition = {
    x : 0,
    y : 0
  }
  // 描点的配置选项
  var pointOption;

  // 创建提示窗
  var create_info = document.createElement("div");
      create_info.id = "mk-info";
      create_info.style.display = "none";
      document.body.appendChild(create_info);
  var info = document.getElementById("mk-info");

  // 运动的球的原始个体
  var cvsBall = document.createElement('canvas'),
  ctxBall = cvsBall.getContext('2d');
  cvsBall.width = 100;
  cvsBall.height = 100;
  ctxBall.beginPath();
  ctxBall.arc(50, 50, 15, 0, Math.PI * 2);
  ctxBall.fillStyle = 'rgba(255,255,255,1)';
  ctxBall.fill()

  // 创建默认背景
  var cvsBg = document.createElement('canvas'),
  ctxBg = cvsBg.getContext('2d');
  cvsBg.width = 100;
  cvsBg.height = 100;
  ctxBg.beginPath();
  ctxBg.fillStyle = '#000';
  ctxBg.fillRect(0,0,100,100);
  ctxBg.fill();


  //  运动函数刷新相关 
  if (!Date.now)
    Date.now = function() { return new Date().getTime(); };
  (function() {
     'use strict';
     var vendors = ['webkit', 'moz'];
     for (var i = 0; i < vendors.length && !window.requestnFrame; ++i) {
       var vp = vendors[i];
       window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
       window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
        || window[vp+'CancelRequestAnimationFrame']);
     }
   if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
     || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
     var lastTime = 0;
     window.requestAnimationFrame = function(callback) {
       var now = Date.now();
       var nextTime = Math.max(lastTime + 16, now);
       return setTimeout(function() { callback(lastTime = nextTime); },
         nextTime - now);
     };
     window.cancelAnimationFrame = clearTimeout;
   }
  }());

  /**
   * 计算bezier曲线尾端角度
   * @param  cx   控制点x坐标       
   * @param  cy   控制点y坐标
   * @param  dx   线段终点x坐标
   * @param  dy   线段终点y坐标
   * @return      返回角度
   */
  function calcAngle(cx,cy,dx,dy){
    return Math.atan2((dy - cy) , (dx - cx));
  }

  /**
   * 画箭头
   * @param  ctx    canvas绘画上下文
   * @param  dx     线段终点x坐标
   * @param  dy     线段终点y坐标
   * @param  angle  箭头角度
   * @param  sizeL  箭头长度
   * @param  sizeW  箭头宽度
   */
  function drawArrow(ctx,dx,dy,angle,sizeL,sizeW,color){
    var al = sizeL / 2;
    var aw = sizeW / 2;
    ctx.save();
    ctx.translate(dx,dy);
    ctx.rotate(angle);
    ctx.translate(-al,-aw);

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(al,aw);
    ctx.lineTo(0,sizeW);
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.restore();
  }


  /**
   * 计算二阶贝塞尔曲线的控制点
   * @param  sx     起点x坐标
   * @param  sy     起点y坐标
   * @param  dx     终点x坐标
   * @param  dy     终点y坐标
   * @return point  控制点坐标 
   */
  function calControlPoint(sx,sy,dx,dy){
    var a,x,y,k,b,X,Y,len;
    X = (sx + dx) / 2;
    Y = (sy + dy) / 2;
    len = 0.2 * Math.sqrt(Math.pow((dy - sy),2) + Math.pow((dx - sx),2)); // 控制贝塞尔曲线曲率
    a = Math.atan2(dy - sy, dx - sx);
    return {x: X - len * Math.sin(a),y: Y + len * Math.cos(a)}
  }

  // 线-对象
  var Line = function(i,option,canvas){
    this.id = i;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.x1 = option.from.x;
    this.y1 = option.from.y;
    this.x2 = option.to.x;
    this.y2 = option.to.y;
    this.style = option.style || "#fff";
    this.info = option.info || "";
    this.init(); // 初始化
    
    lines[lineCount] = this;
    lineCount++;
    this.createBall();
  }

  Line.prototype = {
    init: function(){
      var cPoint = calControlPoint(this.x1,this.y1,this.x2,this.y2);
      this.cx = cPoint.x;
      this.cy = cPoint.y;
      this.angle = calcAngle(this.cx,this.cy,this.x2,this.y2);
      // 创建小球运动的svg路线
      this.path = document.createElementNS('http://www.w3.org/2000/svg','path');
      this.path.setAttribute('d','M' + this.x1 + ' ' + this.y1 + ' ' + 'Q' + this.cx + ' ' + this.cy + ' ' + this.x2 + ' ' + this.y2);
      this.len = this.path.getTotalLength();
    },
    paint: function(){
      var ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 15;
      ctx.shadowColor="rgba(255,255,255,0.3)";
      this.draw(1);
      ctx.strokeStyle = this.style;
      ctx.stroke();
      drawArrow(ctx,this.x2,this.y2,this.angle,20,10,this.style);
      ctx.closePath();
      ctx.restore();
    },
    onHover: function(e){
      info.innerHTML = "";
      for(var i = 0; i < this.info.length; i++){
        var new_div = document.createElement("div");
        var node = document.createTextNode(this.info[i]);
        new_div.appendChild(node);
        info.appendChild(new_div);
      }
      var infoX = e.clientX;
      var infoY = e.clientY;
      if(e.clientX + 200 > window.innerWidth){
        infoX = e.clientX - 150;
      }else if(e.clientY + 200 > window.innerHeight){
        infoY = e.clientY - 200;
      }
      info.style.top = infoY + "px";
      info.style.left = infoX + 20 + "px";
      info.style.display = "block";
    },
    draw: function(width){
      var ctx = this.ctx;
      ctx.moveTo(this.x1,this.y1);
      ctx.quadraticCurveTo(this.cx,this.cy,this.x2,this.y2);
      ctx.lineWidth = width;
      ctx.lineCap   = 'round';
    },
    isMouseInLine: function(mouse){
      this.ctx.beginPath();
      this.draw(10);
      return this.ctx.isPointInStroke(mouse.x, mouse.y);
    },
    pointAt: function(percent){
      this.px = this.path.getPointAtLength(this.len * percent).x;
      this.py = this.path.getPointAtLength(this.len * percent).y;
      return this.path.getPointAtLength(this.len * percent);
    },
    change: function(option){
      this.x1 = option.x1;
      this.y1 = option.y1;
      this.x2 = option.x2;
      this.y2 = option.y2;
      this.init();
      this.changeBall();
    },
    hoverPaint: function(){
      var ctx = this.ctx;
      ctx.beginPath();
      ctx.globalAlpha = 0.3;
      this.draw(6);
      ctx.strokeStyle = this.style;
      ctx.stroke();
      drawArrow(ctx,this.x2,this.y2,this.angle,20,10,this.style);
    },
    createBall: function(){
      var obj = {
        ctx: this.ctx,
        x1: this.x1,
        y1: this.y1,
        path: this.path,
        len: this.len,
        style: this.style
      }
      new Ball(this.id,obj);
    },
    changeBall: function(){
      balls[this.id].change(this.x1,this.y1,this.path,this.len);
    }
  }

  // 球-对象
  var Ball = function(id,obj){
    this.ctx = obj.ctx;
    this.x = obj.x1;
    this.y = obj.y1;
    this.path = obj.path;
    this.len = obj.len;
    this.style = obj.style || "#fff";
    balls[id] = this;
    ballCount++;
  }

  Ball.prototype = {
    paint: function(percent){
      // percent 可以理解为小球运动速度
      var percent = percent / 100;
      var ctx = this.ctx;
      var radius = 15;
      ctx.save();
      this.x = this.pointAt(percent).x,
      this.y = this.pointAt(percent).y;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(cvsBall, this.x - radius / 2, this.y - radius / 2, radius, radius);
      ctx.restore();
    },
    change: function(x1,y1,path,len){
      this.x = x1;
      this.y = y1;
      this.path = path;
      this.len = len;
    },
    pointAt: function(percent){
      return this.path.getPointAtLength(this.len * percent);
    }
  }

  var Point = function(option){
    this.x = option.x;
    this.y = option.y;
    this.info = option.info || "";
    this.style = option.style || '#fff';
    this.ctx = ctxGlobal;
    option.id == 0 ? this.id = 0 : this.id = option.id || pointCount;
    points[pointCount] = this;
    pointCount++;
  }

  Point.prototype = {
    paint: function(r){
      var ctx = this.ctx;
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.beginPath();
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 25;
      ctx.shadowColor="rgba(255,255,255,0.3)";
      this.draw(r);
      ctx.fillStyle = this.style;
      ctx.strokeStyle = this.style;
      ctx.lineWidth = 0.5;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    },
    onHover: function(e){
      info.innerHTML = "";
      var new_div = document.createElement("div");
      var node = document.createTextNode(this.info);
      new_div.appendChild(node);
      info.appendChild(new_div);
      var infoX = e.clientX;
      var infoY = e.clientY;
      if(e.clientX + 200 > window.innerWidth){
        infoX = e.clientX - 150;
      }else if(e.clientY + 200 > window.innerHeight){
        infoY = e.clientY - 200;
      }
      info.style.top = infoY + "px";
      info.style.left = infoX + 20 + "px";
      info.style.display = "block";
    },
    draw: function(r){
      var ctx = this.ctx;
      ctx.arc(this.x,this.y,r,0,Math.PI * 2);
    },
    isMouseInPoint: function(mouse){
      this.ctx.beginPath();
      this.draw(5);
      return this.ctx.isPointInPath(mouse.x, mouse.y);
    },
    change: function(option){
      this.x = option.x;
      this.y = option.y;
    },
    hoverPaint: function(){
      this.paint(5);
    },
  }

  var MarkLine = function(canvasId,bgId,w,h){
    var canvas = document.getElementById(canvasId);
    cvs = document.getElementById(canvasId);
    imgId = bgId || "";    
    if (canvas == null) console.error("The canvas id is undefined.Check it.")
    else{
      markLine.prototype.id = canvasId;
      ctxGlobal = canvas.getContext('2d');
      markLine.prototype.ctx = canvas.getContext('2d');
      canWidth = w || canvas.width;
      canHeight = h || canvas.height;
      return new markLine.prototype.init(canvasId);
    }
  }

  MarkLine.prototype = {
    init: function(canvasId){
      this.canvas = document.getElementById(canvasId);
      // 鼠标事件监听
      mouseEvents(this.canvas);
    },
    updateLine: function(option){
      lines.length = 0;
      balls.length = 0;
      lineCount = 0;
      ballCount = 0;
      if (option.length == 0) return; 
      else {
        for(var i = 0; i < option.length; i++){
          new Line(i,option[i],this.canvas);
        }
      }
    },
    paint: function(){
      animation();
    },
    paintPoint: function(option){
      points.length = 0;
      pointCount = 0;
      pointOption = 0; 
      if (option.length == 0) return;
      else {
        for(var i = 0; i < option.length; i++){
          new Point(option[i]);
        }
      }
      pointOption = option.length;
    },
    onContextmenu: function(fn){
      this.canvas.addEventListener("contextmenu",fn,false);
    },
    onClick: function(fn){
      var cvs = this.canvas;
      cvs.addEventListener("mousedown",function(e){
        var e = e || window.event;
        if(e.which == 1){
          cvs.addEventListener("mouseup",fn,false);
        }else{
          cvs.removeEventListener("mouseup",fn,false);
          return
        }
      },false);
    },
    setOption: function(option){
      this.updateLine(option);
    },
    getLines: function(){
      return lines;
    },
    getLine: function(id){
      return lines[id];
    },
    getBalls: function(){
      return balls;
    },
    getBall: function(id){
      return balls[id];
    },
    getPoint: function(id){
      return points[id];
    },
    getPoints: function(){
      return points; 
    },
    getTransInfo: function(){
      return {
        x: imgPosition.x,
        y: imgPosition.y,
        scale: scaleFlag
      }
    },
    getHover: function(){
      return hoverFlag;
    }
  }

  // 画背景  
  function paintBg(){
    ctxGlobal.save();
    ctxGlobal.ctxGlobalAlpha = 1;
    if(imgId != ""){
      var img = document.getElementById(imgId);
      ctxGlobal.drawImage(img,imgPosition.x,imgPosition.y,canWidth,canHeight);      
    }else{
      ctxGlobal.drawImage(cvsBg,imgPosition.x,imgPosition.y,canWidth,canHeight);      
    }
    ctxGlobal.restore();
  }

  // 绘制关键点
  function paintPoint(option){
    for(var i = 0; i < option; i++){
      points[i].paint(2.5);
    }
  }

  // 清除画布
  function cleanCvs(){
    // 重置渲染上下文并清空画布
    ctxGlobal.save();
    ctxGlobal.setTransform(1, 0, 0, 1, 0, 0);
    ctxGlobal.clearRect(0, 0, canvas.width, canvas.height);
    // 恢复先前渲染上下文所进行的变换
    ctxGlobal.restore();
  }

  // 画线、布图
  function animation(){
    ctxGlobal.globalCompositeOperation = 'source-over';
    clickFlag == true ?  ctxGlobal.globalAlpha = 1 : ctxGlobal.globalAlpha = 0.2; //小球轨迹
    percent >= 100 ? percent = 0 : percent = (percent + 0.3); // 小球速度控制 

    paintBg();
    // 绘制背景

    // 绘制线、球
    if(clickFlag != true){
      if(hoverFlag.hover != false && hoverFlag.type == "line"){
        lines[hoverFlag.id].hoverPaint();
      }
      for(var i = 0; i < lines.length; i++){
        lines[i].paint();
        balls[i].paint(percent);
      } 
    }else{
      for(var i = 0; i < lines.length; i++){
        lines[i].paint();
      }
    }

    if(hoverFlag.hover != false && hoverFlag.type == "point"){
      points[hoverFlag.id].hoverPaint();
      paintPoint(pointOption);
    }else{
      paintPoint(pointOption);
    }
      window.requestAnimationFrame(animation);
  }

  // 验证是否触摸
  function isHover(mouse,e){
    var tempId = null;
    for(var i = 0;i < lines.length; i++){
      if(lines[i].isMouseInLine(mouse)){
        hoverFlag.type = "line";
        tempId = lines[i].id;
        lines[i].onHover(e);
      }
    }

    for(var i = 0;i < points.length; i++){
      if(points[i].isMouseInPoint(mouse)){
        hoverFlag.type = "point";
        points[i].onHover(e);
        tempId = i;
      }
    }

    if(tempId != null){
      hoverFlag.hover = true;
      hoverFlag.id = tempId;
      cvs.style.cursor = "pointer";
    }else{
      info.style.display = "none";
      hoverFlag.hover = false;
      hoverFlag.id = null;
      hoverFlag.type = "";
      cvs.style.cursor = pointerStyle || "default";
    }
  }

  // 鼠标事件
  function mouseEvents(canvas){
    // 触摸事件
    canvas.addEventListener("mousemove", function(e){
      var mouse = {
        x : e.clientX - canvas.getBoundingClientRect().left,
        y : e.clientY - canvas.getBoundingClientRect().top
      };
      isHover(mouse,e);
    }, false);

    // 拖拽事件
    canvas.addEventListener("mousedown",function(e){
      var mouse = {
        x : e.clientX - canvas.getBoundingClientRect().left,
        y : e.clientY - canvas.getBoundingClientRect().top
      };

      function offset(mouse,x,y){
        return {
          x : mouse.x - x,
          y : mouse.y - y
        } 
      }

      var imgOffset = offset(mouse,imgPosition.x,imgPosition.y);

      var tempLines = [];
      var tempPoints = [];

      for(var i = 0; i < lines.length; i++){
        var tempPos1 = offset(mouse,lines[i].x1,lines[i].y1);
        var tempPos2 = offset(mouse,lines[i].x2,lines[i].y2);
        var tempPostion = {
          x1: tempPos1.x,
          y1: tempPos1.y,
          x2: tempPos2.x,
          y2: tempPos2.y
        }
        tempLines.push(tempPostion);
      }

      for(var i = 0; i < points.length; i++){
        var tempXY = offset(mouse,points[i].x,points[i].y);
        var tempPos = {
          x: tempXY.x,
          y: tempXY.y
        }
        tempPoints.push(tempPos);
      }

      // 改变鼠标指针样式
      pointerStyle = "move";
      cvs.style.cursor = pointerStyle;
      clickFlag = true;

      // 拖动事件
      canvas.addEventListener("mousemove",function(e){
        var mouse = {
          x : e.clientX - canvas.getBoundingClientRect().left,
          y : e.clientY - canvas.getBoundingClientRect().top
        };
        if(clickFlag == true){
          // 坐标计算
          imgPosition.x = mouse.x - imgOffset.x;
          imgPosition.y = mouse.y - imgOffset.y;
          for(var i = 0; i < lines.length; i++){
            var tempOption = {
              x1 : mouse.x - tempLines[i].x1,
              y1 : mouse.y - tempLines[i].y1,
              x2 : mouse.x - tempLines[i].x2,
              y2 : mouse.y - tempLines[i].y2
            }
            lines[i].change(tempOption);
          }
          for(var i = 0; i < points.length; i++){
            var tempOption = {
              x : mouse.x - tempPoints[i].x,
              y : mouse.y - tempPoints[i].y,
            }
            points[i].change(tempOption);
          }
          cleanCvs();
          paintBg();
          for(var i = 0; i < lines.length; i++){
              lines[i].paint();
          } 
          for(var i = 0; i < points.length; i++){
              points[i].paint(2.5);
          } 
        }

      }, false)
      canvas.addEventListener("mouseup",function(e){
        pointerStyle = "default";
        cvs.style.cursor = pointerStyle;
        clickFlag = false;
      }, false)
    e.preventDefault();
    }, false)

    // 鼠标缩放
    canvas.addEventListener("mousewheel",function(e){
      e = e || window.event;
      var delta = e.wheelDelta;
      if(delta > 0){
        if (scaleFlag <= 9){
          scaleCvs(1.25);
        }
      }else{
        if (scaleFlag >= -9){
          scaleCvs(0.8);
        }
      }
    },false);
  }

  function scaleCvs(scale,e){
    scale > 1 ? scaleFlag += 1 : scaleFlag -=1;
    e = e || window.event;
    // 获取鼠标的位置
    var mouse = {
      x : e.clientX - canvas.getBoundingClientRect().left, // 距离canvas左侧的距离
      y : e.clientY - canvas.getBoundingClientRect().top  // 距离canvas顶部的距离
    };

    // 获取鼠标中心点与背景的左上角坐标偏移量
    var offset = {
      x : mouse.x - imgPosition.x,
      y : mouse.y - imgPosition.y
    }

    // 缩放的值
    var translate = {
      x: (1 - scale) * offset.x,
      y: (1 - scale) * offset.y,
    }

    // 背景偏移最后坐标值
    var imgTransX = imgPosition.x + translate.x;
    var imgTransY = imgPosition.y + translate.y;

    // 计算曲线端点缩放后的位置
    for(var i = 0; i < lines.length; i++){
      var tempOption = {
        x1 : scale * (lines[i].x1 - imgPosition.x) + imgTransX,
        y1 : scale * (lines[i].y1 - imgPosition.y) + imgTransY,
        x2 : scale * (lines[i].x2 - imgPosition.x) + imgTransX,
        y2 : scale * (lines[i].y2 - imgPosition.y) + imgTransY
      }
      lines[i].change(tempOption);
    }

    for(var i = 0; i < points.length; i++){
      var tempPos = {
        x : scale * (points[i].x - imgPosition.x) + imgTransX,
        y : scale * (points[i].y - imgPosition.y) + imgTransY
      }
      points[i].change(tempPos);
    }

    // 背景位置、长宽
    imgPosition.x = imgTransX;
    imgPosition.y = imgTransY;
    canWidth = scale * canWidth;
    canHeight = scale * canHeight;

    cleanCvs();
    paintBg();

  }

  MarkLine.prototype.init.prototype = MarkLine.prototype;

  window.markLine = MarkLine;

})(window);
