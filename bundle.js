var extend=function(a,b){for(var c in b)b[c]instanceof Function&&(a.prototype[c]instanceof Function&&console.log("Warning: Overwriting "+a.name+".prototype."+c),a.prototype[c]=b[c])};function getSelection(){var a=this.sx,b=this.sy,c=this.sw,d=this.sh;0>c&&(a+=c);0>d&&(b+=d);return{x:a,y:b,w:0>c?-c:c,h:0>d?-d:d}}function selectFrom(a,b){var c=this.getRelativeTileOffset(a|0,b|0);this.sx=c.x;this.sy=c.y;this.sw=this.sh=0}
function selectTo(a,b){var c=this.getRelativeTileOffset(a|0,b|0),d=c.x-this.sx,c=c.y-this.sy;this.sw=d+(0<=d?1:0);this.sh=c+(0<=c?1:0)}function resetSelection(){this.sx=this.sy=0;this.sw=this.sh=-0}var _select=Object.freeze({getSelection:getSelection,selectFrom:selectFrom,selectTo:selectTo,resetSelection:resetSelection}),CommandKind={DRAW:0,ERASE:1,FILL:2,BACKGROUND:3,PASTE:4,CUT:5,DRAW_IMAGE:6,RECT_FILL:7,RECT_STROKE:8,ARC_FILL:9,ARC_STROKE:10};
function copy(a){var b=a.x,c=a.y,d=a.w;a=a.h;var f=[];this.clipboard.copy=null;for(var g=0;g<d*a;++g){var h=g%d,l=g/d|0,k=this.getPixelAt(b+h,c+l);null!==k&&f.push({x:h,y:l,color:k})}this.clipboard.copy=f}function paste(a,b,c){if(null!==c&&c.length){var d=this.createDynamicBatch(),f=this.getCurrentLayer();d.prepareBuffer(a,b);for(var g=0;g<c.length;++g){var h=c[g];d.drawTile(h.x+a,h.y+b,1,1,h.color)}d.refreshTexture();f.addBatch(d);this.enqueue(CommandKind.PASTE,d)}}
function cut(a){this.copy(a);var b=this.clipboard.copy;null!==b&&b.length&&this.clearRect(a)}function clearRect(a){var b=a.x,c=a.y,d=a.w;a=a.h;var f=this.createDynamicBatch(),g=this.getCurrentLayer();f.isEraser=!0;f.prepareBuffer(b,c);f.clearRect(b,c,d,a);f.refreshTexture();f.erased.length&&(g.addBatch(f),this.enqueue(CommandKind.CLEAR,f))}
var _area_functions=Object.freeze({copy:copy,paste:paste,cut:cut,clearRect:clearRect}),TILE_SIZE=8,MIN_SCALE=.75,MAX_SCALE=32,MAGIC_SCALE=.125,BASE_TILE_COLOR=[0,0,0,0],SELECTION_COLOR=[1,1,1,.1],SELECTION_COLOR_ACTIVE=[1,1,1,.2],TILE_HOVER_COLOR=[1,1,1,.2],MAX_SAFE_INTEGER=Math.pow(2,31)-1,MAGIC_RGB_A_BYTE=.00392,GRID_LINE_WIDTH=.25,ZOOM_SPEED=15,STACK_LIMIT=128,WGL_TEXTURE_LIMIT=2*STACK_LIMIT,WGL_SUPPORTED="undefined"!==typeof WebGLRenderingContext,MODES={DEV:!1},SETTINGS={PENCIL_SIZE:2,ERASER_SIZE:2};
function zoomScale(a){return a+1}function roundTo(a,b){var c=1/b;return Math.round(a*c)/c}function alignToGrid(a){return roundTo(a,TILE_SIZE)}function pointDistance(a,b,c,d){return Math.sqrt(Math.pow(c-a,2)+Math.pow(d-b,2))}function intersectRectangles(a,b,c,d,f,g,h,l){a|=0;b|=0;f|=0;g|=0;var k=Math.max(b,g);b=Math.min(b+(d|0),g+(l|0));return Math.min(a+(c|0),f+(h|0))>=Math.max(a,f)&&b>=k}
function scale(a){a=ZOOM_SPEED/100*a*zoomScale(this.cs);var b=this.cs;this.cs=this.cs+a<=MIN_SCALE?MIN_SCALE:this.cs+a>=MAX_SCALE?MAX_SCALE:this.cs+a;this.cs=roundTo(this.cs,MAGIC_SCALE);this.cs>=MAX_SCALE-1+.25&&(this.cs=MAX_SCALE-1+.25);this.cx-=this.lx*(zoomScale(this.cs)-zoomScale(b));this.cy-=this.ly*(zoomScale(this.cs)-zoomScale(b));this.cr=roundTo(this.cs,MAGIC_SCALE);this.redraw()}function click(a,b){a|=0;b|=0;var c=this.getRelativeOffset(a,b);this.dx=a;this.dy=b;this.lx=c.x;this.ly=c.y}
function hover(a,b){this.mx=a|0;this.my=b|0}function drag(a,b){a|=0;b|=0;this.cx+=a-this.dx;this.cy+=b-this.dy;this.dx=a;this.dy=b;this.redraw()}function getRelativeOffset(a,b){return{x:((a|0)-this.cx)/this.cs,y:((b|0)-this.cy)/this.cs}}function getRelativeTileOffset(a,b){var c=this.getRelativeOffset(a|0,b|0);return this.getTileOffsetAt(c.x,c.y)}function getTileOffsetAt(a,b){b|=0;var c=TILE_SIZE/2,d=alignToGrid((a|0)-c),c=alignToGrid(b-c);return{x:d/TILE_SIZE|0,y:c/TILE_SIZE|0}}
function boundsInsideView(a){var b=this.cs,c=a.h*TILE_SIZE*b,d=a.x*TILE_SIZE*b+this.cx,f=a.y*TILE_SIZE*b+this.cy;return 0<=d+a.w*TILE_SIZE*b&&d<=this.cw&&0<=f+c&&f<=this.ch}var _camera=Object.freeze({scale:scale,click:click,hover:hover,drag:drag,getRelativeOffset:getRelativeOffset,getRelativeTileOffset:getRelativeTileOffset,getTileOffsetAt:getTileOffsetAt,boundsInsideView:boundsInsideView}),_emitter=Object.freeze({}),uidx=0;function uid(){return++uidx}
function createCanvasBuffer(a,b){var c=document.createElement("canvas");c.width=a;c.height=b;c=c.getContext("2d");applyImageSmoothing(c,!1);return c}function applyImageSmoothing(a,b){a.imageSmoothingEnabled=b;a.oImageSmoothingEnabled=b;a.msImageSmoothingEnabled=b;a.webkitImageSmoothingEnabled=b}function alphaByteToRgbAlpha(a){return Math.round(a*MAGIC_RGB_A_BYTE*10)/10}function colorToRgbaString(a){return"rgba("+a[0]+","+a[1]+","+a[2]+","+a[3]+")"}
function hexToRgba(a){var b=parseInt(a.substring(1,3),16),c=parseInt(a.substring(3,5),16);a=parseInt(a.substring(5,7),16);return[b,c,a,1]}function rgbaToHex(a){var b=a[1],c=a[2];return"#"+("0"+parseInt(a[0],10).toString(16)).slice(-2)+("0"+parseInt(b,10).toString(16)).slice(-2)+("0"+parseInt(c,10).toString(16)).slice(-2)}function colorsMatch(a,b){return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3]}
function getWGLContext(a){if(!WGL_SUPPORTED)throw Error("Your browser doesn't support WebGL.");var b={alpha:!1,antialias:!1,premultipliedAlpha:!1,stencil:!1,preserveDrawingBuffer:!1};return a.getContext("webgl",b)||a.getContext("experimental-webgl",b)}
function initListeners(){var a=this;window.addEventListener("resize",function(b){return a.onResize(b)});window.addEventListener("mousedown",function(b){return a.onMouseDown(b)});window.addEventListener("mouseup",function(b){return a.onMouseUp(b)});window.addEventListener("mousemove",function(b){return a.onMouseMove(b)});window.addEventListener("keydown",function(b){return a.onKeyDown(b)});window.addEventListener("keyup",function(b){return a.onKeyUp(b)});window.addEventListener("contextmenu",function(b){return a.onContextmenu(b)});
window.addEventListener("wheel",function(b){return a.onMouseWheel(b)});window.addEventListener("mousewheel",function(b){return a.onMouseWheel(b)});this.view.addEventListener("mouseout",function(b){return a.onMouseOut(b)});this.view.addEventListener("mouseleave",function(b){return a.onMouseLeave(b)})}function onResize(a){this.resize(window.innerWidth,window.innerHeight)}function onMouseOut(a){a.preventDefault();this.onMouseUp(a)}function onMouseLeave(a){a.preventDefault();this.onMouseUp(a)}
function onMouseDown(a){a.preventDefault();if(a.target instanceof HTMLCanvasElement){var b=a.clientX,c=a.clientY,d=this.getRelativeTileOffset(b,c);if(1===a.which)if(this.resetSelection(),this.modes.select)this.states.selecting=!0,this.selectFrom(b,c),this.selectTo(b,c);else if(this.modes.arc){this.states.arc=!0;this.buffers.arc=this.createDynamicBatch();a=this.buffers.arc;var f=this.getCurrentLayer();a.forceRendering=!0;a.prepareBuffer(d.x,d.y);a.refreshTexture();f.addBatch(a)}else this.modes.rect?
(this.states.rect=!0,this.buffers.rect=this.createDynamicBatch(),a=this.buffers.rect,f=this.getCurrentLayer(),a.forceRendering=!0,a.prepareBuffer(d.x,d.y),a.refreshTexture(),f.addBatch(a)):this.modes.draw?(this.states.drawing=!0,this.buffers.drawing=this.createDynamicBatch(),a=this.buffers.drawing,f=this.getCurrentLayer(),a.forceRendering=!0,a.prepareBuffer(d.x,d.y),a.drawAt(d.x,d.y,SETTINGS.PENCIL_SIZE,this.fillStyle),a.refreshTexture(),f.addBatch(a)):this.modes.erase?(this.states.erasing=!0,this.buffers.erasing=
this.createDynamicBatch(),a=this.buffers.erasing,f=this.getCurrentLayer(),a.forceRendering=!0,a.prepareBuffer(d.x,d.y),a.clearAt(d.x,d.y,SETTINGS.ERASER_SIZE),a.refreshTexture(),a.isEraser=!0,f.addBatch(a)):this.modes.fill?this.fillBucket(d.x,d.y,this.fillStyle):this.modes.pipette&&(d=this.getPixelAt(d.x,d.y),null!==d&&(this.fillStyle=d,color_view.style.background=d.value=rgbaToHex(d)));else 3===a.which&&(this.states.dragging=!0,this.click(b,c));this.last.mdx=b;this.last.mdy=c}}
function onMouseUp(a){a.preventDefault();if(a.target instanceof HTMLCanvasElement){if(1===a.which)if(this.modes.arc){var b=this.buffers.arc;b.forceRendering=!1;this.states.arc=!1;this.enqueue(CommandKind.ARC_FILL,b);this.buffers.arc=null}else this.modes.rect?(b=this.buffers.rect,b.forceRendering=!1,this.states.rect=!1,this.enqueue(CommandKind.RECT_FILL,b),this.buffers.rect=null):this.modes.select?this.states.selecting=!1:this.states.drawing?(b=this.buffers.drawing,b.forceRendering=!1,this.states.drawing=
!1,this.enqueue(CommandKind.DRAW,b),this.buffers.drawing=null):this.states.erasing&&(b=this.buffers.erasing,b.forceRendering=!1,this.states.erasing=!1,b.isEmpty()?b.kill():this.enqueue(CommandKind.ERASE,b),this.buffers.erasing=null);3===a.which&&(this.states.dragging=!1)}}var lastx=0,lasty=0;
function onMouseMove(a){a.preventDefault();if(a.target instanceof HTMLCanvasElement){var b=a.clientX;a=a.clientY;var c=this.last,d=this.getCurrentLayer(),f=this.getRelativeTileOffset(b,a);if(c.mx!==f.x||c.my!==f.y){this.hover(b,a);this.states.dragging&&this.drag(b,a);if(this.states.arc){var g=this.buffers.arc;g.clear();var h=this.getRelativeTileOffset(this.last.mdx,this.last.mdy),l=pointDistance(h.x,h.y,f.x,f.y);this.strokeArc(g,h.x,h.y,l,this.fillStyle);d.updateBoundings();g.refreshTexture()}else this.states.rect?
(g=this.buffers.rect,g.clear(),h=this.getRelativeTileOffset(this.last.mdx,this.last.mdy),this.strokeRect(g,h.x,h.y,f.x-h.x,f.y-h.y,this.fillStyle),d.updateBoundings(),g.refreshTexture()):this.states.drawing?(g=this.buffers.drawing,this.insertLine(b,a,lastx,lasty),d.updateBoundings(),g.refreshTexture()):this.states.erasing?(d=this.buffers.erasing,g=this.getCurrentLayer(),this.insertLine(b,a,lastx,lasty),d.clearAt(f.x,f.y,SETTINGS.ERASER_SIZE),d.isEmpty()||g.updateBoundings()):this.states.dragging?
this.drag(b,a):this.states.selecting&&this.selectTo(b,a);lastx=b;lasty=a;c.mx=f.x;c.my=f.y}}}
function onKeyDown(a){a.preventDefault();a=a.keyCode;this.keys[a]=1;switch(a){case 46:this.clearRect(this.getSelection());this.resetSelection();break;case 67:this.keys[17]&&this.copy(this.getSelection());break;case 88:this.keys[17]&&(this.cut(this.getSelection()),this.resetSelection());break;case 86:this.keys[17]&&(this.paste(this.last.mx,this.last.my,this.clipboard.copy),this.resetSelection());break;case 90:this.keys[17]&&this.undo();break;case 89:this.keys[17]&&this.redo();break;case 113:MODES.DEV=
!MODES.DEV;break;case 116:location.reload()}}function onKeyUp(a){a.preventDefault();a=a.keyCode;this.keys[a]=0;16===a&&(this.states.select=!1,this.states.selecting=!1)}function onContextmenu(a){a.preventDefault()}function onMouseWheel(a){a.preventDefault();var b=0<a.deltaY?-1:1;this.click(a.clientX,a.clientY);this.scale(b)}
var _listener=Object.freeze({initListeners:initListeners,onResize:onResize,onMouseOut:onMouseOut,onMouseLeave:onMouseLeave,onMouseDown:onMouseDown,onMouseUp:onMouseUp,onMouseMove:onMouseMove,onKeyDown:onKeyDown,onKeyUp:onKeyUp,onContextmenu:onContextmenu,onMouseWheel:onMouseWheel}),Boundings=function(a,b,c,d){void 0===a&&(a=0);void 0===b&&(b=0);void 0===c&&(c=0);void 0===d&&(d=0);this.h=this.w=this.y=this.x=0;this.update(a,b,c,d)};
Boundings.prototype.update=function(a,b,c,d){this.x=a|0;this.y=b|0;this.w=c|0;this.h=d|0};Boundings.prototype.isPointInside=function(a,b){return intersectRectangles(this.x,this.y,this.w-1,this.h-1,a|0,b|0,0,0)};function getRawPixelAt(a,b){var c=this.data,d=4*((b-this.bounds.y)*this.bounds.w+(a-this.bounds.x)),f=c[d+3],c=[c[d+0],c[d+1],c[d+2],alphaByteToRgbAlpha(f)];return 0>=f?null:c}
function drawImage(a,b,c){var d=a.canvas,f=d.width,d=d.height;b=alignToGrid(b-f/2|0);c=alignToGrid(c-d/2|0);this.prepareBuffer(b,c);this.buffer=a;this.bounds.x=b;this.bounds.y=c;this.bounds.w=f;this.bounds.h=d;this.refreshTexture()}var _raw=Object.freeze({getRawPixelAt:getRawPixelAt,drawImage:drawImage});function drawAt(a,b,c,d){var f=Math.ceil(c/2),g=Math.ceil(c/2);this.drawTile(a-f,b-g,c+f,c+g,d)}
function drawTile(a,b,c,d,f){var g=this.bounds;this.resizeByOffset(a,b);(1<c||1<d)&&this.resizeByOffset(a+c-1,b+d-1);this.buffer.fillStyle=colorToRgbaString(f);this.buffer.fillRect(a-g.x,b-g.y,c,d)}function clearAt(a,b,c){var d=Math.floor(c/2),f=Math.floor(c/2);this.clearRect(a-d,b-f,c+d,c+f,color)}
function clearRect$1(a,b,c,d){for(var f=[],g=0;g<c*d;++g)for(var h=this.eraseTileAt(g%c+a,(g/c|0)+b),l=0;l<h.length;++l){var k=h[l];-1>=f.indexOf(k)&&f.push(k)}for(a=0;a<f.length;++a)f[a].refreshTexture()}function eraseTileAt(a,b){var c=[],d=this.instance.getPixelsAt(a,b).pixels;d.length&&this.resizeByOffset(a,b);for(var f=0;f<d.length;++f){this.erased.push(d[f]);var g=d[f].batch;g.buffer.clearRect(a-g.bounds.x,b-g.bounds.y,1,1);-1>=c.indexOf(g)&&c.push(g)}return c}
var _tile=Object.freeze({drawAt:drawAt,drawTile:drawTile,clearAt:clearAt,clearRect:clearRect$1,eraseTileAt:eraseTileAt});function dejectErasedTiles(){for(var a=this.erased,b=[],c=0;c<a.length;++c){var d=a[c],f=d.batch;f.buffer.clearRect(d.x-f.bounds.x,d.y-f.bounds.y,1,1);-1>=b.indexOf(f)&&b.push(f)}b.map(function(a){return a.refreshTexture()})}
function injectErasedTiles(){for(var a=this.erased,b=[],c=0;c<a.length;++c){var d=a[c],f=d.batch,g=colorToRgbaString(d.pixel),h=d.x-f.bounds.x,d=d.y-f.bounds.y;f.buffer.fillStyle=g;f.buffer.fillRect(h,d,1,1);-1>=b.indexOf(f)&&b.push(f)}b.map(function(a){return a.refreshTexture()})}var _erase=Object.freeze({dejectErasedTiles:dejectErasedTiles,injectErasedTiles:injectErasedTiles});
function resizeByOffset(a,b){var c=this.bounds,d=(Math.abs(c.x-a)|0)+1,f=(Math.abs(c.y-b)|0)+1,g=c.x,h=c.y,l=c.w,k=c.h,m=-(c.x-a)|0,p=-(c.y-b)|0;0>m&&(c.x+=m,c.w+=Math.abs(m));0>p&&(c.y+=p,c.h+=Math.abs(p));d>c.w&&(c.w=d);f>c.h&&(c.h=f);if(l!==c.w||k!==c.h)d=createCanvasBuffer(c.w,c.h),d.drawImage(this.buffer.canvas,g-c.x,h-c.y,l,k),this.buffer=d,this.isResized=!0}
function resizeByBufferData(){for(var a=this.data,b=this.bounds,c=b.w,d=b.x,f=b.y,g=b.w,h=b.h,l=MAX_SAFE_INTEGER,k=MAX_SAFE_INTEGER,m=-MAX_SAFE_INTEGER,p=-MAX_SAFE_INTEGER,n=0;n<a.length;n+=4){var q=n/4,r=q%c,q=q/c|0,t=4*(q*c+r),u=a[t+3];0>=a[t+0]+a[t+1]+a[t+2]||0>=u||(0<=r&&r<=l&&(l=r),0<=q&&q<=k&&(k=q),0<=r&&r>=m&&(m=r),0<=q&&q>=p&&(p=q))}a=m-(-l+m);c=p-(-k+p);n=b.x+a;r=b.y+c;l=-l+m+1;k=-k+p+1;if(d!==n||f!==r||g!==l||h!==k)b.x=n,b.y=r,b.w=l,b.h=k,b=createCanvasBuffer(b.w,b.h),b.drawImage(this.buffer.canvas,
-a,-c),this.buffer=b,this.isResized=!0}var _resize=Object.freeze({resizeByOffset:resizeByOffset,resizeByBufferData:resizeByBufferData}),_boundings=Object.freeze({}),Batch=function(a){this.id=uid();this.instance=a;this.erased=[];this.texture=this.buffer=this.data=null;this.bounds=new Boundings;this.forceRendering=this.isEraser=this.isResized=!1};Batch.prototype.getStackIndex=function(){for(var a=this.id,b=this.instance.stack,c=0;c<b.length;++c)if(b[c].batch.id===a)return c;return-1};
Batch.prototype.clear=function(){this.buffer.clearRect(0,0,this.bounds.w,this.bounds.h)};Batch.prototype.kill=function(){for(var a=this.id,b=this.instance.layers,c=0;c<b.length;++c)for(var d=b[c].batches,f=0;f<d.length;++f){var g=d[f];if(g.isEraser)for(var h=0;h<g.erased.length;++h)g.erased[h].batch.id!==a&&g.erased.splice(h,1);if(g.id===a){g.bounds=null;g.erased=null;g.instance.destroyTexture(g.texture);d.splice(f,1);b[c].updateBoundings();break}}};
Batch.prototype.getColorAt=function(a,b){return this.isEmpty()?null:this.getRawColorAt(a,b)};Batch.prototype.prepareBuffer=function(a,b){if(null===this.buffer){var c=this.bounds;c.x=a;c.y=b;c.w=1;c.h=1;this.buffer=createCanvasBuffer(1,1);this.texture=this.instance.bufferTexture(this.id,this.buffer.canvas,!1);this.isResized=!0}};
Batch.prototype.refreshTexture=function(){var a=this.bounds,b=this.instance;this.data=this.buffer.getImageData(0,0,a.w,a.h).data;this.isResized?(b.destroyTexture(this.texture),this.texture=b.bufferTexture(this.id,this.buffer.canvas,!1)):b.updateTexture(this.texture,this.buffer.canvas);this.isResized=!1};
Batch.prototype.isEmpty=function(){if(this.isEraser)return 0>=this.erased.length;for(var a=this.data,b=this.bounds.w,c=0,d=0;d<a.length;d+=4){var f=d/4,f=4*((f/b|0)*b+f%b),g=a[f+3];0>=a[f+0]+a[f+1]+a[f+2]||0>=g||c++}return 0>=c};extend(Batch,_raw);extend(Batch,_tile);extend(Batch,_erase);extend(Batch,_resize);extend(Batch,_boundings);function resetModes(){for(var a in this.modes)this.resetSelection(),this.modes[a]=!1;this.resetActiveUiButtons()}
function insertImage(a,b,c){var d=this.getCurrentLayer(),f=this.createDynamicBatch();f.drawImage(a,b,c);d.addBatch(f);this.enqueue(CommandKind.DRAW_IMAGE,f)}function exportAsDataUrl(){return this.cache.main instanceof CanvasRenderingContext2D?this.cache.main.canvas.toDataURL("image/png"):""}
function insertLine(a,b,c,d){for(var f=Math.abs(c-a),g=Math.abs(d-b),h=a<c?2:-2,l=b<d?2:-2,k=f-g,m=this.last,p=this.states.drawing?this.buffers.drawing:this.buffers.erasing;;){var n=this.getRelativeTileOffset(a,b);if(m.mx!==n.x||m.my!==n.y)this.states.drawing?p.drawTile(n.x,n.y,SETTINGS.PENCIL_SIZE,SETTINGS.PENCIL_SIZE,this.fillStyle):this.states.erasing&&p.clearAt(n.x,n.y,SETTINGS.ERASER_SIZE);m.mx=n.x;m.my=n.y;if(a===c&&b===d)break;n=2*k;n>-g&&(k-=g,a+=h);n<f&&(k+=f,b+=l)}}
function getPixelAt(a,b){for(var c=this.sindex,d=this.layers,f=0;f<d.length;++f)for(var g=d[d.length-1-f].batches,h=0;h<g.length;++h){var l=g[g.length-1-h];if(!l.isEraser&&l.bounds.isPointInside(a,b)&&!(l.getStackIndex()>c)&&(l=l.getRawPixelAt(a,b),null!==l))return l}return null}
function getPixelsAt(a,b){for(var c=[],d=this.sindex,f=this.layers,g=0;g<f.length;++g)for(var h=f[f.length-1-g].batches,l=0;l<h.length;++l){var k=h[h.length-1-l];if(!k.isEraser&&k.bounds.isPointInside(a,b)&&!(k.getStackIndex()>d)){var m=k.getRawPixelAt(a,b);null!==m&&c.push({x:a,y:b,batch:k,pixel:m})}}return{x:a,y:b,pixels:c}}function getLayerByPoint(a,b){for(var c=this.layers,d=0;d<c.length;++d){var f=c[c.length-1-d];if(f.bounds.isPointInside(a,b))return f}return null}
function getBatchById(a){for(var b=null,c=this.layers,d=0;d<c.length;++d){var f=c[c.length-1-d].getBatchById(a);if(null!==f){b=f;break}}return b}function getCurrentLayer(){return this.layers.length?this.layers[this.layers.length-1]:null}function createDynamicBatch(){return new Batch(this)}function refreshMainTexture(){this.createMainBuffer()}
function updateGlobalBoundings(){for(var a=0;a<this.layers.length;++a)this.layers[a].updateBoundings();for(var b=a=MAX_SAFE_INTEGER,c=-MAX_SAFE_INTEGER,d=-MAX_SAFE_INTEGER,f=this.layers,g=0;g<f.length;++g){var h=f[g].bounds,l=h.x,k=h.y,m=l+h.w,p=k+h.h;if(0!==h.w||0!==h.h)0>a&&l<a?a=l:0<=a&&(0>l||l<a)&&(a=l),0>b&&k<b?b=k:0<=b&&(0>k||k<b)&&(b=k),m>c&&(c=m),p>d&&(d=p)}this.bounds.update(a,b,-a+c,-b+d)}
var _env=Object.freeze({resetModes:resetModes,insertImage:insertImage,exportAsDataUrl:exportAsDataUrl,insertLine:insertLine,getPixelAt:getPixelAt,getPixelsAt:getPixelsAt,getLayerByPoint:getLayerByPoint,getBatchById:getBatchById,getCurrentLayer:getCurrentLayer,createDynamicBatch:createDynamicBatch,refreshMainTexture:refreshMainTexture,updateGlobalBoundings:updateGlobalBoundings}),_blend=Object.freeze({}),_invert=Object.freeze({}),_onion=Object.freeze({}),_replace=Object.freeze({}),_shading=Object.freeze({});
function applyPixelSmoothing(a){a=a.data;for(var b=0;b<a.length;b+=4)0<b&&b+1<a.length&&!(w.x!==o.x&&w.y!==o.y||e.x!==o.x&&e.y!==o.y)&&w.x!==e.x&&w.y!==e.y&&(a[b+0]=0,a[b+1]=0,a[b+2]=0,a[b+3]=0)}var _smoothing=Object.freeze({applyPixelSmoothing:applyPixelSmoothing});
function bufferTexture(a,b,c){var d=this.gl,f=d.createTexture();d.bindTexture(d.TEXTURE_2D,f);d.texImage2D(d.TEXTURE_2D,0,d.RGBA,d.RGBA,d.UNSIGNED_BYTE,b);!0===c?(d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,d.LINEAR),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR)):(d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,d.NEAREST),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.NEAREST));d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE);d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,
d.CLAMP_TO_EDGE);void 0===this.cache.gl.textures[a]&&(this.cache.gl.textures[a]=f);d.bindTexture(d.TEXTURE_2D,null);return this.cache.gl.textures[a]}function destroyTexture(a){var b=this.gl,c=this.cache.gl.textures,d;for(d in c){var f=c[d];if(f===a){b.deleteTexture(f);delete c[d];break}}}function updateTexture(a,b){var c=this.gl;c.bindTexture(c.TEXTURE_2D,a);c.texSubImage2D(c.TEXTURE_2D,0,0,0,c.RGBA,c.UNSIGNED_BYTE,b);c.bindTexture(c.TEXTURE_2D,null)}
var _buffer=Object.freeze({bufferTexture:bufferTexture,destroyTexture:destroyTexture,updateTexture:updateTexture}),SPRITE_VERTEX="\n  precision lowp float;\n  uniform vec2 uScale;\n  uniform vec2 uObjScale;\n  attribute vec2 aObjCen;\n  attribute float aIdx;\n  varying vec2 uv;\n  void main(void) {\n    if (aIdx == 0.0) {\n      uv = vec2(0.0,0.0);\n    } else if (aIdx == 1.0) {\n      uv = vec2(1.0,0.0);\n    } else if (aIdx == 2.0) {\n      uv = vec2(0.0,1.0);\n    } else {\n      uv = vec2(1.0,1.0);\n    }\n    gl_Position = vec4(\n      -1.0 + 2.0 * (aObjCen.x + uObjScale.x * (-0.5 + uv.x)) / uScale.x,\n      1.0 - 2.0 * (aObjCen.y + uObjScale.y * (-0.5 + uv.y)) / uScale.y,\n      0.0, 1.0\n    );\n  }\n",
SPRITE_FRAGMENT="\n  precision lowp float;\n  uniform sampler2D uSampler;\n  varying vec2 uv;\n  uniform int isRect;\n  uniform vec4 vColor;\n  void main(void) {\n    if (isRect == 0) {\n      gl_FragColor = texture2D(uSampler, uv);\n    } else {\n      gl_FragColor = vColor + texture2D(uSampler, uv);\n    }\n    if (gl_FragColor.a < 0.1) discard;\n  }\n",_shaders=Object.freeze({SPRITE_VERTEX:SPRITE_VERTEX,SPRITE_FRAGMENT:SPRITE_FRAGMENT});
function setupRenderer(a){this.view=a;this.gl=getWGLContext(a);this.program=this.createSpriteProgram();this.gl.useProgram(this.program);this.cache.gl.empty=this.createEmptyTexture()}function createEmptyTexture(){var a=this.gl,b=a.createTexture();a.bindTexture(a.TEXTURE_2D,b);a.texImage2D(a.TEXTURE_2D,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));return b}
function createSpriteProgram(){var a=this.gl,b=WGL_TEXTURE_LIMIT,c=a.createProgram(),d=a.createShader(a.VERTEX_SHADER),f=a.createShader(a.FRAGMENT_SHADER);this.compileShader(d,SPRITE_VERTEX);this.compileShader(f,SPRITE_FRAGMENT);a.attachShader(c,d);a.attachShader(c,f);a.linkProgram(c);var f=this.cache.gl,d=f.buffers,g=f.vertices,f=g.idx=new Float32Array(6*b);g.position=new Float32Array(12*b);d.idx=a.createBuffer();d.position=a.createBuffer();for(a=0;a<b;a++)f[6*a+0]=0,f[6*a+1]=1,f[6*a+2]=2,f[6*a+
3]=1,f[6*a+4]=2,f[6*a+5]=3;this.setGlAttribute(c,d.idx,"aIdx",1,f);return c}function compileShader(a,b){var c=this.gl;c.shaderSource(a,b);c.compileShader(a)}function setGlAttribute(a,b,c,d,f){var g=this.gl;a=g.getAttribLocation(a,c);g.enableVertexAttribArray(a);g.bindBuffer(g.ARRAY_BUFFER,b);0<f.length&&g.bufferData(g.ARRAY_BUFFER,f,g.DYNAMIC_DRAW);g.vertexAttribPointer(a,d,g.FLOAT,!1,0,0)}
var _build=Object.freeze({setupRenderer:setupRenderer,createEmptyTexture:createEmptyTexture,createSpriteProgram:createSpriteProgram,compileShader:compileShader,setGlAttribute:setGlAttribute});function clear(){var a=this.gl;a.clearColor(0,0,0,1);a.clear(a.COLOR_BUFFER_BIT)}
function drawImage$1(a,b,c,d,f){b|=0;c|=0;d|=0;f|=0;var g=this.gl,h=this.program;g.uniform2f(g.getUniformLocation(h,"uObjScale"),d,f);for(var l=this.cache.gl.vertices.position,k=0;6>k;++k)l[2*k+0]=b+d/2,l[2*k+1]=c+f/2;g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,a);this.setGlAttribute(h,this.cache.gl.buffers.position,"aObjCen",2,l);g.drawArrays(g.TRIANGLES,0,6)}
function drawRectangle(a,b,c,d,f){a|=0;b|=0;c|=0;d|=0;var g=this.gl,h=this.program;g.uniform2f(g.getUniformLocation(h,"uObjScale"),c,d);g.uniform1i(g.getUniformLocation(h,"isRect"),1);for(var l=this.cache.gl.vertices.position,k=0;6>k;++k)l[2*k+0]=a+c/2,l[2*k+1]=b+d/2;g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,this.cache.gl.empty);g.uniform4f(g.getUniformLocation(h,"vColor"),f[0],f[1],f[2],f[3]);this.setGlAttribute(h,this.cache.gl.buffers.position,"aObjCen",2,l);g.drawArrays(g.TRIANGLES,
0,6);g.uniform1i(g.getUniformLocation(h,"isRect"),0)}var _draw=Object.freeze({clear:clear,drawImage:drawImage$1,drawRectangle:drawRectangle});function createGridBuffer(){var a=createCanvasBuffer(this.cw,this.ch);null!==this.cache.grid&&(this.cache.grid=null,this.destroyTexture(this.cache.gridTexture));this.cache.grid=a;this.cache.gridTexture=this.bufferTexture("grid",a.canvas,!0);this.redrawGridBuffer();return a}
function redrawGridBuffer(){var a=this.cache.grid,b=this.cache.gridTexture,c=TILE_SIZE*this.cr|0,d=this.cx,f=this.cy,g=this.cw,h=this.ch;a.clearRect(0,0,g,h);a.lineWidth=GRID_LINE_WIDTH;a.strokeStyle="rgba(51,51,51,0.5)";a.beginPath();for(d=d%c|0;d<g;d+=c)a.moveTo(d,0),a.lineTo(d,h);for(f=f%c|0;f<h;f+=c)a.moveTo(0,f),a.lineTo(g,f);a.stroke();a.stroke();a.closePath();this.updateTexture(b,a.canvas);this.last.cx=this.cx;this.last.cy=this.cy}
function createBackgroundBuffer(){this.cache.bg instanceof WebGLTexture&&this.destroyTexture(this.cache.bg);var a=TILE_SIZE,b=this.cw,c=this.ch,d=document.createElement("canvas"),f=d.getContext("2d");d.width=b;d.height=c;f.fillStyle="#1f1f1f";f.fillRect(0,0,b,c);f.fillStyle="#212121";for(var g=0;g<c;g+=2*a)for(var h=0;h<b;h+=2*a)f.fillRect(h,g,a,a),f.fillRect(h,g,a,a);for(g=a;g<c;g+=2*a)for(h=a;h<b;h+=2*a)f.fillRect(h,g,a,a);return this.bufferTexture("background",d,!1)}
function createForegroundBuffer(){var a=createCanvasBuffer(this.cw,this.ch);applyImageSmoothing(a,!0);null!==this.cache.fg&&(this.cache.fg=null,this.destroyTexture(this.cache.fgTexture));this.cache.fg=a;this.cache.fgTexture=this.bufferTexture("foreground",a.canvas,!0);return a}
function createMainBuffer(){var a=createCanvasBuffer(this.bounds.w||1,this.bounds.h||1);null!==this.cache.main&&(this.cache.main=null,this.destroyTexture(this.cache.mainTexture));this.cache.main=a;this.cache.mainTexture=this.bufferTexture("main",a.canvas,!1);this.updateMainBuffer();return a}
function updateMainBuffer(){for(var a=this.layers,b=this.sindex,c=this.cache.main,d=0;d<a.length;++d)for(var f=a[d],g=f.x,h=f.y,f=f.batches,l=0;l<f.length;++l){var k=f[l];0>b-l||c.drawImage(k.buffer.canvas,g+(k.bounds.x-this.bounds.x),h+(k.bounds.y-this.bounds.y))}this.updateTexture(this.cache.mainTexture,c.canvas)}
var _generate=Object.freeze({createGridBuffer:createGridBuffer,redrawGridBuffer:redrawGridBuffer,createBackgroundBuffer:createBackgroundBuffer,createForegroundBuffer:createForegroundBuffer,createMainBuffer:createMainBuffer,updateMainBuffer:updateMainBuffer});function redraw(){this.last.cx===this.cx&&this.last.cy===this.cy||this.redrawGridBuffer()}function canRenderCachedBuffer(){return null!==this.cache.main&&!this.states.drawing&&!this.states.erasing&&!this.states.arc&&!this.states.rect}
function render(){var a=-0!==this.sw&&-0!==this.sh;this.renderBackground();this.renderGrid();if(this.canRenderCachedBuffer()){var b=this.bounds,c=this.cr;this.drawImage(this.cache.mainTexture,(this.cx|0)+b.x*TILE_SIZE*c,(this.cy|0)+b.y*TILE_SIZE*c,this.cache.main.canvas.width*TILE_SIZE*c,this.cache.main.canvas.height*TILE_SIZE*c)}else this.renderLayers();this.states.select&&a||this.renderHoveredTile();a&&this.renderSelection();MODES.DEV&&this.renderStats()}
function renderBackground(){this.drawImage(this.cache.bg,0,0,this.cw,this.ch)}function renderGrid(){this.drawImage(this.cache.gridTexture,0,0,this.cw,this.ch)}function renderLayers(){for(var a=this.cx|0,b=this.cy|0,c=this.cr,d=this.layers,f=0;f<this.layers.length;++f){var g=d[f],h=g.bounds;g.states.hidden||(MODES.DEV&&this.drawRectangle(a+h.x*TILE_SIZE*c|0,b+h.y*TILE_SIZE*c|0,h.w*TILE_SIZE*c,h.h*TILE_SIZE*c,this.buffers.boundingColor),this.renderLayer(g))}}
function renderLayer(a){var b=this.cx|0,c=this.cy|0,d=this.cr,f=a.x*TILE_SIZE,g=a.y*TILE_SIZE,h=a.batches;a=a.opacity;var l=this.sindex;255!==a&&this.setOpacity(a);for(var k=0;k<h.length;++k){var m=h[k],p=m.bounds;if((!(0>l-k)||m.isEraser||m.forceRendering)&&this.boundsInsideView(p)){var n=b+(f+p.x*TILE_SIZE*d)|0,q=c+(g+p.y*TILE_SIZE*d)|0,r=p.w*TILE_SIZE*d,p=p.h*TILE_SIZE*d;if(MODES.DEV){if(m.isEraser&&m.isEmpty())continue;this.drawRectangle(n,q,r,p,this.buffers.boundingColor)}this.drawImage(m.texture,
n,q,r,p)}}255!==a&&this.setOpacity(a)}function renderHoveredTile(){var a=this.cx|0,b=this.cy|0,c=this.cr,d=this.getRelativeTileOffset(this.mx,this.my);this.drawRectangle(a+GRID_LINE_WIDTH/2+d.x*TILE_SIZE*c|0,b+GRID_LINE_WIDTH/2+d.y*TILE_SIZE*c|0,TILE_SIZE*c|0,TILE_SIZE*c|0,TILE_HOVER_COLOR)}
function renderSelection(){var a=this.cr;this.drawRectangle((this.cx|0)+this.sx*TILE_SIZE*a|0,(this.cy|0)+this.sy*TILE_SIZE*a|0,this.sw*TILE_SIZE*a|0,this.sh*TILE_SIZE*a|0,this.states.selecting?SELECTION_COLOR_ACTIVE:SELECTION_COLOR)}
function renderStats(){var a=this.cache.fg,b=this.bounds,c=a.canvas,d=this.cache.fgTexture,f=this.last.mx,g=this.last.my;a.clearRect(0,0,this.cw,this.ch);a.font="10px Verdana";a.fillStyle="#fff";a.fillText("Mouse: x: "+f+", y: "+g,8,16);a.fillText("GPU textures: "+Object.keys(this.cache.gl.textures).length,8,28);a.fillText("Boundings: x: "+b.x+", y: "+b.y+", w: "+b.w+", h: "+b.h,8,40);a.fillText("Camera scale: "+this.cr,8,52);a.fillText("Stack: "+(this.sindex+1)+":"+this.stack.length,8,64);b=this.getPixelAt(f,
g);null!==b&&(a.fillStyle=colorToRgbaString(b),a.fillRect(8,70,8,8),a.fillStyle="#fff",a.fillText(b[0]+", "+b[1]+", "+b[2]+", "+b[3],22,77));0!==this.sw&&0!==this.sh&&this.drawSelectionShape();this.updateTexture(d,c);this.drawImage(d,0,0,c.width,c.height)}
function drawSelectionShape(){var a=this.cr,b=this.getSelection(),c=(this.cx|0)+b.x*TILE_SIZE*a|0,d=(this.cy|0)+b.y*TILE_SIZE*a|0,f=b.w*TILE_SIZE*a,b=b.h*TILE_SIZE*a,g=TILE_SIZE*a,h=this.cache.fg;h.strokeStyle="rgba(255,255,255,0.7)";h.lineWidth=.45*a;h.setLineDash([g,g]);h.strokeRect(c,d,f,b)}function drawResizeRectangle(a,b,c,d,f){var g=this.cr,h=this.cache.fg;h.strokeStyle=f;h.lineWidth=Math.max(.4,.45*g);h.strokeRect(a,b,c,d)}
var _render=Object.freeze({redraw:redraw,canRenderCachedBuffer:canRenderCachedBuffer,render:render,renderBackground:renderBackground,renderGrid:renderGrid,renderLayers:renderLayers,renderLayer:renderLayer,renderHoveredTile:renderHoveredTile,renderSelection:renderSelection,renderStats:renderStats,drawSelectionShape:drawSelectionShape,drawResizeRectangle:drawResizeRectangle});
function resize(a,b){a|=0;b|=0;var c=this.gl,d=this.view;this.cw=a;this.ch=b;d.width=a;d.height=b;c.viewport(0,0,a,b);c.uniform2f(c.getUniformLocation(this.program,"uScale"),a,b);c.enable(c.BLEND);c.disable(c.CULL_FACE);c.disable(c.DEPTH_TEST);c.disable(c.STENCIL_TEST);c.blendFunc(c.SRC_ALPHA,c.ONE_MINUS_SRC_ALPHA);this.cache.bg=this.createBackgroundBuffer();this.cache.fg=this.createForegroundBuffer();this.cache.grid=this.createGridBuffer();this.redrawGridBuffer()}
var _resize$1=Object.freeze({resize:resize}),Command=function(a,b){this.kind=0;this.batch=b};function redo(){if(this.sindex<this.stack.length-1){this.sindex++;var a=this.currentStackOperation();this.fire(a,!0)}this.refreshMainTexture()}function enqueue(a,b){this.refreshStack();var c=new Command(a,b);this.stack.push(c);this.redo();this.undo();this.redo()}var _redo=Object.freeze({redo:redo,enqueue:enqueue});
function refreshStack(){this.sindex<this.stack.length-1?this.dequeue(this.sindex,this.stack.length-1):this.stack.splice(this.sindex+1,this.stack.length);this.updateGlobalBoundings()}function currentStackOperation(){return this.stack[this.sindex]}function fire(a,b){a.batch.isEraser&&(b?a.batch.dejectErasedTiles():a.batch.injectErasedTiles())}var _state=Object.freeze({refreshStack:refreshStack,currentStackOperation:currentStackOperation,fire:fire});
function undo(){if(0<=this.sindex){var a=this.currentStackOperation();this.fire(a,!1);this.sindex--}this.refreshMainTexture()}function dequeue(a,b){a+=1;for(var c=b-(a-1);0<c;--c){var d=a+c-1;this.stack[d].batch.kill();this.stack.splice(d,1)}}var _undo=Object.freeze({undo:undo,dequeue:dequeue}),_read=Object.freeze({}),_write=Object.freeze({});
function fillBucket(a,b,c){c=c||[255,255,255,1];if(1<c[3])throw Error("Invalid alpha color!");var d=this.getPixelAt(a,b)||BASE_TILE_COLOR;if(!colorsMatch(d,c)){this.refreshStack();var f=this.createDynamicBatch(),g=this.getCurrentLayer();a=this.binaryFloodFill(f,a,b,d,c);a||(g.addBatch(f),this.enqueue(a?CommandKind.BACKGROUND:CommandKind.FILL,f),this.updateGlobalBoundings())}}
function binaryFloodFill(a,b,c,d,f){for(var g=this.bounds,h=g.x,l=g.y,k=g.w,g=g.h,m=0===d[3],p=k*g,n=new Uint8ClampedArray(k*g),q=0;q<p;++q){var r=q%k,t=q/k|0,u=this.getPixelAt(h+r,l+t);if(m){if(null!==u)continue}else{if(null===u)continue;if(d[0]!==u[0]||d[1]!==u[1]||d[2]!==u[2])continue}n[t*k+r]=1}for(b=[{x:b-h,y:c-l}];0<b.length;){d=b.pop();c=d.x;d=d.y;m=d*k+c;1===n[m]&&(n[m]=2);m=d*k+(c+1);p=(d+1)*k+c;q=d*k+(c-1);if(-1>d-1||d-1>g||-1>c+1||c+1>k||-1>d+1||d+1>g||-1>c-1||c-1>k)return!0;1===n[(d-1)*
k+c]&&b.push({x:c,y:d-1});1===n[m]&&b.push({x:c+1,y:d});1===n[p]&&b.push({x:c,y:d+1});1===n[q]&&b.push({x:c-1,y:d})}b=createCanvasBuffer(k,g);b.fillStyle=colorToRgbaString(f);for(f=0;f<k*g;++f)c=f%k,d=f/k|0,2===n[d*k+c]&&b.fillRect(c,d,1,1);a.buffer=b;a.data=b.getImageData(0,0,k,g).data;a.bounds.update(h,l,k,g);a.isResized=!0;a.resizeByBufferData();a.refreshTexture();return!1}var _fill=Object.freeze({fillBucket:fillBucket,binaryFloodFill:binaryFloodFill}),_rotate=Object.freeze({});
function strokeArc(a,b,c,d,f){f||(f=[255,255,255,1]);this.insertArc(a,b,c,(d||1)|0,f)}function insertArc(a,b,c,d,f){for(var g=0,h=1-d,l=SETTINGS.PENCIL_SIZE,k=SETTINGS.PENCIL_SIZE;d>=g;)a.drawTile(d+b,g+c,l,k,f),a.drawTile(g+b,d+c,l,k,f),a.drawTile(-d+b,g+c,l,k,f),a.drawTile(-g+b,d+c,l,k,f),a.drawTile(-d+b,-g+c,l,k,f),a.drawTile(-g+b,-d+c,l,k,f),a.drawTile(d+b,-g+c,l,k,f),a.drawTile(g+b,-d+c,l,k,f),g++,0>=h&&(h+=2*g+1),0<h&&(d--,h+=2*(g-d)+1)}
function fillRect(a,b,c,d,f,g){g||(g=[255,255,255,1]);this.insertRectangleAt(a,b|0,c|0,d|0,f|0,g,!0)}function strokeRect(a,b,c,d,f,g){g||(g=[255,255,255,1]);this.insertRectangleAt(a,b|0,c|0,d|0,f|0,g,!1)}function insertRectangleAt(a,b,c,d,f,g,h){var l=Math.abs(d),k=Math.abs(f);d=0>d?-1:1;f=0>f?-1:1;for(var m=SETTINGS.PENCIL_SIZE,p=SETTINGS.PENCIL_SIZE,n=0;n<k;++n)for(var q=0;q<l;++q)(h||0===q||q>=l-1||0===n||n>=k-1)&&a.drawTile(b+q*d,c+n*f,m,p,g)}
var _insert=Object.freeze({strokeArc:strokeArc,insertArc:insertArc,fillRect:fillRect,strokeRect:strokeRect,insertRectangleAt:insertRectangleAt});function resetActiveUiButtons(){arc.style.removeProperty("opacity");move.style.removeProperty("opacity");tiled.style.removeProperty("opacity");erase.style.removeProperty("opacity");bucket.style.removeProperty("opacity");select.style.removeProperty("opacity");pipette.style.removeProperty("opacity");rectangle.style.removeProperty("opacity")}
function setupUi(){var a=this;tiled.onclick=function(b){a.resetModes();a.modes.draw=!0;tiled.style.opacity=1};erase.onclick=function(b){a.resetModes();a.modes.erase=!0;erase.style.opacity=1};bucket.onclick=function(b){a.resetModes();a.modes.fill=!0;bucket.style.opacity=1};pipette.onclick=function(b){a.resetModes();a.modes.pipette=!0;pipette.style.opacity=1};select.onclick=function(b){a.resetModes();a.modes.select=!0;a.states.drawing=!1;select.style.opacity=1};arc.onclick=function(b){a.resetModes();
a.modes.arc=!0;arc.style.opacity=1};rectangle.onclick=function(b){a.resetModes();a.modes.rect=!0;rectangle.style.opacity=1};color.onchange=function(b){color_view.style.background=color.value;a.fillStyle=hexToRgba(color.value)};color_view.style.background=rgbaToHex(this.fillStyle);download.onclick=function(b){b=document.createElement("a");var c=a.exportAsDataUrl();b.href=c;b.download="655321.png";b.click()};file.onclick=function(a){a.preventDefault()};file.onchange=function(b){file.style.display="none";
var c=new FileReader;c.onload=function(b){if("png"!==b.target.result.slice(11,14))throw Error("Invalid image type!");var c=new Image,d=document.createElement("canvas"),h=d.getContext("2d");c.onload=function(){d.width=c.width;d.height=c.height;h.drawImage(c,0,0,c.width,c.height);a.insertImage(h,a.last.mx,a.last.my);file.value=""};c.src=b.target.result};c.readAsDataURL(b.target.files[0])};this.view.addEventListener("dragenter",function(a){file.style.display="block"});file.addEventListener("dragleave",
function(a){file.style.display="none"})}var _ui=Object.freeze({resetActiveUiButtons:resetActiveUiButtons,setupUi:setupUi}),Layer=function(a){this.id=uid();this.y=this.x=0;this.name=null;this.opacity=255;this.buffer=null;this.batches=[];this.bounds=new Boundings;this.states={hidden:!1,locked:!1}};Layer.prototype.addBatch=function(a){this.batches.push(a);a.isEmpty()||this.updateBoundings()};
Layer.prototype.getBatchById=function(a){for(var b=null,c=this.batches,d=0;d<c.length;++d){var f=c[d];if(f.id===a){b=f;break}}return b};Layer.prototype.updateBoundings=function(){for(var a=MAX_SAFE_INTEGER,b=MAX_SAFE_INTEGER,c=-MAX_SAFE_INTEGER,d=-MAX_SAFE_INTEGER,f=this.batches,g=0;g<f.length;++g){var h=f[g].bounds,l=h.x,k=h.y,m=l+h.w,p=k+h.h;if(0!==h.w||0!==h.h)0>a&&l<a?a=l:0<=a&&(0>l||l<a)&&(a=l),0>b&&k<b?b=k:0<=b&&(0>k||k<b)&&(b=k),m>c&&(c=m),p>d&&(d=p)}this.bounds.update(a,b,-a+c,-b+d)};
function setup(){var a=this,b=document.createElement("canvas"),c=window.innerWidth,d=window.innerHeight;b.width=c;b.height=d;this.setupRenderer(b);this.initListeners();this.resize(c,d);this.scale(0);this.modes.draw=!0;tiled.style.opacity=1;var f=function(){requestAnimationFrame(function(){return f()});a.clear();a.render()};f();a.layers.push(new Layer);this.setupUi();document.body.appendChild(b)}
var _setup=Object.freeze({setup:setup}),Poxi=function(){this.program=this.empty=this.view=this.gl=null;this.bounds=new Boundings;this.ch=this.cw=this.cy=this.cx=0;this.cs=this.cr=MIN_SCALE;this.sy=this.sx=this.ly=this.lx=this.dy=this.dx=0;this.sh=this.sw=-0;this.my=this.mx=0;this.stack=[];this.sindex=0;this.layers=[];this.cache={main:null,mainTexture:null,bg:null,fg:null,fgTexture:null,grid:null,gridTexture:null,gl:{empty:null,buffers:{},vertices:{},textures:{}}};this.last={cx:1,cy:1,mx:0,my:0,mdx:0,
mdy:0};this.buffers={arc:null,rect:null,erasing:null,drawing:null,boundingColor:[1,0,0,.1]};this.keys={};this.clipboard={copy:null};this.states={arc:!1,rect:!1,drawing:!1,dragging:!1,select:!1,selecting:!1};this.modes={arc:!1,fill:!1,rect:!1,draw:!1,erase:!1,select:!1,pipette:!1};this.fillStyle=[255,0,0,1];this.setup()};extend(Poxi,_select);extend(Poxi,_area_functions);extend(Poxi,_camera);extend(Poxi,_emitter);extend(Poxi,_listener);extend(Poxi,_env);extend(Poxi,_blend);extend(Poxi,_invert);
extend(Poxi,_onion);extend(Poxi,_replace);extend(Poxi,_shading);extend(Poxi,_smoothing);extend(Poxi,_buffer);extend(Poxi,_build);extend(Poxi,_draw);extend(Poxi,_generate);extend(Poxi,_render);extend(Poxi,_resize$1);extend(Poxi,_shaders);extend(Poxi,_redo);extend(Poxi,_state);extend(Poxi,_undo);extend(Poxi,_read);extend(Poxi,_write);extend(Poxi,_fill);extend(Poxi,_rotate);extend(Poxi,_insert);extend(Poxi,_ui);extend(Poxi,_setup);
if("undefined"!==typeof window)window.Poxi=Poxi,window.stage=new Poxi;else throw Error("Poxi only runs inside the browser");module.exports=Poxi;