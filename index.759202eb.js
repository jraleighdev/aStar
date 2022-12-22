let t;var e;let s;var i;function r(t,e,s){return(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var s=t[Symbol.toPrimitive];if(void 0!==s){var i=s.call(t,e||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:s,enumerable:!0,configurable:!0,writable:!0}):t[e]=s,t}(e=t||(t={}))[e.aStar=0]="aStar",e[e.dijkstra=1]="dijkstra",(i=s||(s={}))[i.start=0]="start",i[i.end=1]="end",i[i.wall=2]="wall",i[i.path=3]="path",i[i.empty=5]="empty",i[i.hover=6]="hover",i[i.possiblities=7]="possiblities";class n{get fCost(){return this.gCost+this.hCost}get point(){return{x:this.x,y:this.y}}constructor(t,e,s,i){this.x=t,this.y=e,this.dim=s,this.type=i,r(this,"path",void 0),r(this,"hasValue",!1),r(this,"traversable",!1),r(this,"hCost",0),r(this,"gCost",0),r(this,"parent",void 0),this.path=new Path2D,this.path.rect(t*s,e*s,s,s)}setType(t){switch(this.type=t,t){case s.empty:this.hasValue=!1,this.traversable=!0,this.hCost=0,this.gCost=0,this.parent=void 0;break;case s.hover:this.hasValue=!1,this.traversable=!0;break;case s.wall:this.hasValue=!0,this.traversable=!1,this.parent=void 0;break;case s.start:case s.end:case s.path:case s.possiblities:this.hasValue=!0,this.traversable=!0}}setIsPossible(){this.setType(s.possiblities)}get isStart(){return this.type===s.start}get isEnd(){return this.type===s.end}get isWall(){return this.type===s.wall}get isPossiblity(){return this.type===s.possiblities}get color(){return this.colorsMap()[this.type]}isMatch(t){return Math.abs(this.point.x-t.x)<.1&&Math.abs(this.point.y-t.y)<.1}colorsMap(){return{[s.empty]:"white",[s.end]:"red",[s.start]:"green",[s.path]:"blue",[s.hover]:"orange",[s.wall]:"grey",[s.possiblities]:"yellow"}}}const o=document.getElementById("canvas"),a=o.getContext("2d"),l=document.getElementById("algorithm-select"),h=document.getElementById("drawing-tool-select"),p=document.getElementById("startButton"),y=document.getElementById("clearButton"),c=80,f=(()=>{const t=[];for(let e=0;e<=9;e++){const i=[];for(let t=0;t<=19;t++)i.push(new n(t,e,c,s.empty));t.push(i)}return t})(),d=()=>{for(let e=0;e<=f.length-1;e++){const s=f[e];for(let e=0;e<=s.length-1;e++){const i=s[e];a.fillStyle=i.color,a.fillRect(i.x*c+4,i.y*c+4,i.dim-8,i.dim-8),a.strokeStyle="black",a.strokeRect(i.x*c,i.y*c,i.dim,i.dim);switch(parseInt(l.value)){case t.aStar:a.font="16px Arial",a.strokeText(i.fCost.toString(),i.x*c+32,i.y*c+66.66666666666667),a.font="16px Arial",a.strokeText(i.gCost.toString(),i.x*c+11.428571428571429,i.y*c+20),a.font="16px Arial",a.strokeText(i.hCost.toString(),i.x*c+50,i.y*c+20);break;case t.dijkstra:default:a.font="16px Arial",a.strokeText(Number.isFinite(i.hCost)?i.hCost.toString():"0",i.x*c+32,i.y*c+40)}}}};d();const u=()=>{d(),requestAnimationFrame(u)};u();const g=(t,e)=>{const s=Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2));return Math.round(10*(s+Number.EPSILON))/10*10},x=t=>{const e=t.x,s=t.y;return[{x:e-1,y:s},{x:e-1,y:s-1},{x:e,y:s-1},{x:e+1,y:s-1},{x:e+1,y:s},{x:e+1,y:s+1},{x:e,y:s+1},{x:e-1,y:s+1}].filter((t=>(t=>t.x>=0&&t.x<=19&&t.y>=0&&t.y<=9)(t))).map((t=>f[t.y][t.x]))},m=t=>{const e=Math.min(...t.map((t=>t.fCost)));return t.find((t=>Math.abs(e-t.fCost)<.1))},b=t=>{const e=[];let s=0,i=t.parent;for(;i&&!i.isStart;){if(e.push(i),i=i.parent,s>1e4){console.log("get parents hit 10000");break}s++}return e},v=()=>{let t,e;for(let i=0;i<=f.length-1;i++)for(let r=0;r<=f[i].length-1;r++){const n=f[i][r];n.isStart&&(t=n),n.isEnd&&(e=n),n.isStart||n.isEnd||n.isWall||n.setType(s.empty)}if(!t||!e)return void alert("Select a start and end to begin");const i=[],r=[];i.push(t);let n=0;for(;n<1e4;){const o=m(i);if(!o)break;const a=i.indexOf(o);if(i.splice(a,1),r.push(o),r.indexOf(e)>0){o.setType(s.end);const t=b(o);for(let e=0;e<=t.length-1;e++){const i=t[e];i.isPossiblity&&i.setType(s.path)}break}const l=x(o);for(let n=0;n<=l.length-1;n++){const a=l[n];if(a.traversable&&r.indexOf(a)<0)if(i.indexOf(a)>0){const e=g(t.point,a.point);e<a.gCost&&(a.gCost=e,a.parent=o)}else a.parent=o,a.hCost=g(e.point,a.point),a.gCost=g(t.point,a.point),a.isEnd||a.setType(s.possiblities),i.push(a)}n++}},C=()=>{switch(parseInt(l.value)){case t.aStar:v();break;case t.dijkstra:(()=>{let t,e;const i=[];for(let r=0;r<=f.length-1;r++)for(let n=0;n<=f[r].length-1;n++){const o=f[r][n];o.isStart&&(t=o),o.isEnd&&(e=o),o.isStart||o.isEnd||o.isWall||o.setType(s.empty),o.hCost=Number.POSITIVE_INFINITY,i.push(o)}var r;if(t&&e)for(t.hCost=0;i.length>0;){const t=Math.min(...i.map((t=>t.hCost))),e=i.find((e=>Math.abs(e.hCost-t)<.1));if(e){const t=i.indexOf(e);if(i.splice(t,1),e.isEnd){const t=b(e);for(let e=0;e<=t.length-1;e++){const i=t[e];i.isPossiblity&&i.setType(s.path)}break}const n=[{x:(r=e.point).x-1,y:r.y},{x:r.x-1,y:r.y-1},{x:r.x,y:r.y-1},{x:r.x+1,y:r.y-1},{x:r.x+1,y:r.y},{x:r.x+1,y:r.y+1},{x:r.x,y:r.y+1},{x:r.x-1,y:r.y+1}];for(let t=0;t<=n.length-1;t++){const r=n[t],o=i.find((t=>t.isMatch(r)));if(o&&o.traversable){const t=e.hCost+g(e.point,o.point);t<o.hCost&&(o.hCost=t,o.parent=e),o.isEnd||o.isStart||o.setType(s.possiblities)}}}}else alert("Select a start and end to begin")})();break;default:v()}};let k=!1,S=!1,E=s.empty;o.addEventListener("mousemove",(t=>{for(let e=0;e<=f.length-1;e++){const i=f[e];for(let e=0;e<=i.length-1;e++){const r=i[e];a.isPointInPath(r.path,t.offsetX,t.offsetY)?!S||E!==s.empty&&E!==s.wall?S||r.type!=s.empty||r.setType(s.hover):r.setType(E):r.hasValue||r.setType(s.empty)}}})),o.addEventListener("mousedown",(t=>{t.stopPropagation(),t.preventDefault(),S=!0,E=parseInt(h.value)})),o.addEventListener("mouseup",(t=>{t.stopPropagation(),t.preventDefault(),S=!1})),o.addEventListener("click",(t=>{t.stopPropagation(),t.preventDefault();for(let e=0;e<=f.length-1;e++){const i=f[e];for(let e=0;e<=i.length-1;e++){const r=i[e];(E===s.start&&r.type===s.start||E===s.end&&r.type===s.end)&&r.setType(s.empty),a.isPointInPath(r.path,t.offsetX,t.offsetY)&&r.setType(E)}}k&&C()})),y.addEventListener("click",(()=>{k=!1;for(let t=0;t<=f.length-1;t++){const e=f[t];for(let t=0;t<=e.length-1;t++){e[t].setType(s.empty)}}})),p.addEventListener("click",(()=>{k=!0,C()}));