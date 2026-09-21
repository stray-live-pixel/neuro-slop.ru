(function(root){
 'use strict';
 root.createOrbitExpeditionRenderer=function(ctx){
  const arts={rootFlow:OrbitRootFlowArt,progress:OrbitProgressionArt,findings:OrbitFindingsArt,story:OrbitStoryArt,enemies:OrbitExpeditionEnemies},images={},foundAt={},badgeSides={},gardenStates=new WeakMap();
  for(const [key,art]of Object.entries(arts)){const im=new Image();im.src=art.image;images[key]=im;}
  const ready=key=>images[key].complete&&images[key].naturalWidth;
  function sprite(key,name,x,y){const f=arts[key].frames[name];if(!f||!ready(key))return false;const [w,h]=f.drawSize;ctx.drawImage(images[key],...f.sourceRect,x-w/2,y-h,w,h);return true;}
  function label(text,x,y){ctx.font='bold 12px Arial';ctx.fillStyle='#0c2036eb';ctx.fillRect(x-4,y-14,ctx.measureText(text).width+8,19);ctx.fillStyle='#fff0ca';ctx.fillText(text,x,y);}
  function world(g,clock,reduced,cssScale=1){
   // Мировые надписи сохраняют размер CSS; при пересечении с героем остаётся HUD.
   function panel(text,cx,bottom){ctx.save();ctx.font=`bold ${13/cssScale}px Arial`;const w=ctx.measureText(text).width+16,h=22/cssScale,box={x:cx-w/2,y:bottom-h,w,h};if(!OrbitEngine.overlap(g.player,box)){ctx.fillStyle='#102839ee';ctx.fillRect(box.x,box.y,w,h);ctx.fillStyle='#f6e7c8';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,cx,bottom-h/2);}ctx.restore();}
   const nearPickup=(g.level.pickups||[]).filter(p=>Math.abs(g.player.x-p.x)<100).sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x))[0];
   const render=OrbitProgressionRender,owned=g.meta.abilities.resonator;
   if(g.level.id===1){const on=!!g.groups[g.level.revision>=6?'ROOT':'GARDEN'],prior=gardenStates.get(g),at=on&&!prior?.on?(prior?clock:clock-.45):prior?.at??clock;gardenStates.set(g,{on,at});const alpha=on&&!reduced&&prior?Math.min(1,(clock-at)/.45):1;if(on&&alpha<1)sprite('story','dark',5770,475);ctx.save();ctx.globalAlpha=alpha;sprite('story',on?'restored':'dark',5770,475);ctx.restore();ctx.fillStyle=g.groups.GARDEN?'#ffe5a0':'#415667';ctx.fillRect(5645,435,13,22);const trace=g.level.optionalTrace;if(trace)sprite('findings',g.facts[trace.id]?'cache-empty':'cache-closed',trace.x,trace.y);}
   if(g.circuits?.['ROOT-FLOW']){
    const c=g.circuits['ROOT-FLOW'],stored=!!g.groups.ROOT,water=stored?2:c.outputs.water,air=stored?1:c.outputs.air,R=OrbitRootFlowRender;
    sprite('rootFlow',water===2?'roots-watered':'roots-dry',7490,475);R.drop(ctx,7474,388,water>=1);R.drop(ctx,7504,388,water>=2);
    sprite('rootFlow','fan',8123,375);
    // Корпус неподвижен; вращается только вырезка центрального ротора.
    if(air>0&&ready('rootFlow')){ctx.save();ctx.translate(8123,345);ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.clip();ctx.rotate(reduced?0:clock*6);ctx.drawImage(images.rootFlow,1150,185,215,215,-17,-17,34,34);ctx.restore();}
    ctx.strokeStyle='#c2eee4';ctx.fillStyle=air?'#a5e6d5':'#182c3b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(8100,295,12,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.font='bold 23px Arial';ctx.fillStyle='#fff0c5';ctx.fillText(air>1?'+':'↻',8088,303);
    sprite('rootFlow','tank',8290,415);for(let i=0;i<3;i++){ctx.fillStyle=stored||!c.overload&&i<c.requested?'#a5e6d5':'#243a48';ctx.fillRect(8282,389-i*14,16,10);ctx.strokeStyle='#c2eee4';ctx.strokeRect(8282,389-i*14,16,10);}
    sprite('rootFlow','root-contact',8315,475);ctx.strokeStyle=c.ready||stored?'#fff4d2':'#67818b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(8315,413,c.ready?16:10,0,Math.PI*2);ctx.stroke();if(stored){ctx.font='bold 22px Arial';ctx.fillStyle='#c3eed8';ctx.fillText('✓',8305,420);}
    for(const r of g.level.routers.filter(r=>r.stateCount===3)){if(ready('rootFlow'))R.valve(ctx,images.rootFlow,arts.rootFlow,r.x+r.w/2,r.y,g.routerBits[r.id]);else{ctx.strokeStyle='#c2eee4';ctx.lineWidth=3;ctx.strokeRect(r.x,r.y-40,r.w,40);ctx.font='bold 26px Arial';ctx.fillStyle='#fff0c5';ctx.fillText(String(g.routerBits[r.id]),r.x+15,r.y-12);}}if(!ready('rootFlow')){ctx.strokeStyle='#c2eee4';ctx.strokeRect(8270,315,40,100);ctx.strokeRect(8290,425,50,50);}
    ctx.strokeStyle='#84bac6';ctx.lineWidth=3;for(const pts of [[[7495,365],[7490,400]],[[8085,350],[8085,326],[8100,326]]]){ctx.beginPath();ctx.moveTo(...pts[0]);for(const pt of pts.slice(1))ctx.lineTo(...pt);ctx.stroke();}
    if(c.overload){ctx.fillStyle='#ffc568';ctx.font='bold 26px Arial';for(const x of [7490,8100,8290])ctx.fillText('!',x+27,365);}
   }
   for(const s of g.resonantPlatforms){const key=g.level.id+':'+s.id;let side=badgeSides[key]||'left';if(side==='left'&&Math.abs(g.player.x+15-(s.x+12))<35)side='right';else if(side==='right'&&Math.abs(g.player.x+15-(s.x+s.w-12))<35)side='left';badgeSides[key]=side;if(ready('progress'))render.platform(ctx,images.progress,arts.progress,{...s,badgeSide:side});else{ctx.strokeStyle='#91dae0';ctx.setLineDash(s.state==='active'||s.state==='held'?[]:[6,6]);ctx.strokeRect(s.x,s.y,s.w,20);ctx.setLineDash([]);}}
   for(const s of g.routePlatforms){ctx.strokeStyle=s.state==='active'||s.state==='held'?'#c4f5df':'#668995';ctx.lineWidth=2;ctx.setLineDash(['inactive','pending'].includes(s.state)?[7,7]:[]);ctx.strokeRect(s.x,s.y,s.w,s.h);ctx.setLineDash([]);if(s.state==='active'||s.state==='held'){const f=arts.progress.frames['platform-active'];if(ready('progress'))render.tile(ctx,images.progress,f,s.x,s.y,s.w,20/f.sourceRect[3]);}if(s.state==='held')label('ДЕРЖИТ ПОД НОГАМИ',s.x,s.y-12);}
   for(const r of g.level.resonators||[]){if(ready('progress'))render.contact(ctx,images.progress,arts.progress,{...r,owned,ready:OrbitEngine.readyResonator(g)?.id===r.id});else{ctx.strokeStyle='#a2d9e4';ctx.strokeRect(r.x,r.y,r.w,16);}if(g.events.includes('resonance-pulse'))for(const id of r.targets){const target=g.resonantPlatforms.find(s=>s.id===id);if(target?.remaining>2.95){ctx.strokeStyle='#b3e8eb';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(r.x+r.w/2,r.y-8);ctx.lineTo(target.x+target.w/2,target.y);ctx.stroke();ctx.setLineDash([]);}}}
   for(const r of g.level.rails||[]){
    const wall=g.level.platforms.find(s=>s.id===r.wallId),x=r.face==='left'?wall.x:wall.x+wall.w,on=OrbitProgression.allowed(g,r),grip=on&&g.grip?.id===r.id?g.player.y+g.player.h/2:null,rx=r.face==='left'?x:x-12;
    ctx.save();if(!on)ctx.globalAlpha=.4;
    if(ready('progress'))render.rail(ctx,images.progress,arts.progress,{...r,wallX:x,gripY:grip});else{ctx.fillStyle=grip===null?'#607d85':'#c8fff1';ctx.fillRect(rx,r.y0,12,r.y1-r.y0);}ctx.restore();
    ctx.strokeStyle=on?'#c8eee6':'#758592';ctx.lineWidth=2/cssScale;ctx.setLineDash(on?[]:[5,8]);ctx.beginPath();ctx.moveTo(x,r.y0);ctx.lineTo(x,r.y1);ctx.stroke();ctx.setLineDash([]);
    if(!on){ctx.strokeStyle='#71838e';ctx.lineWidth=2;for(let y=r.y0+8;y<r.y1;y+=22){ctx.beginPath();ctx.moveTo(rx,y);ctx.lineTo(rx+12,y+7);ctx.stroke();}}
   }
   for(const p of g.level.pickups||[]){const found=g.meta.foundPickupIds.includes(p.id),family=p.kind==='ability'?'module':p.kind==='trace'?'cache':'archive',just=clock-(foundAt[p.id]??-Infinity)<.5;if(!sprite('findings',family+'-'+(found?just?'full':'empty':'closed'),p.x+p.w/2,p.y+p.h)){ctx.strokeStyle='#e5c890';ctx.strokeRect(p.x,p.y,p.w,p.h);}if(!found){if(p.kind==='ability')sprite('progress',p.ability==='resonator'?'coil':'magboots',p.x+16,p.y+5);else sprite('findings',p.kind==='key'?'story-key':'data-item',p.x+16,p.y);}if(p===nearPickup&&!(g.level.id===4&&[6500,6560].includes(p.x)))panel(found?p.kind==='ability'?'Модуль установлен':'Уже найдено':OrbitProgression.names[p.ability||p.dataId||p.keyId||p.traceId],p.x+16,p.y-35);if(g.level.id===4&&[6500,6560].includes(p.x)){ctx.save();ctx.translate(p.x+16,p.y-18);ctx.scale(1/cssScale,1/cssScale);ctx.strokeStyle='#fff0ca';ctx.lineWidth=2;if(p.kind==='key'){ctx.beginPath();ctx.arc(-4,-4,5,0,Math.PI*2);ctx.moveTo(0,0);ctx.lineTo(9,9);ctx.lineTo(12,6);ctx.stroke();}else{ctx.strokeRect(-7,-11,14,20);ctx.beginPath();ctx.moveTo(-3,-5);ctx.lineTo(4,-5);ctx.moveTo(-3,0);ctx.lineTo(4,0);ctx.stroke();}ctx.restore();}}
   if(g.wallKick>0){ctx.strokeStyle='#c8fff1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(g.player.x+15-g.kickDirection*20,g.player.y+30);ctx.lineTo(g.player.x+15,g.player.y+22);ctx.stroke();}
   if(g.level.id===4){
    for(const mid of [3830,5530]){ctx.save();ctx.beginPath();ctx.rect(mid-10,478,20,9);ctx.clip();ctx.lineWidth=Math.max(3,2/cssScale)+2/cssScale;for(const color of ['#132b39','#f5e2b0']){ctx.strokeStyle=color;for(const x of [mid-7,mid,mid+7]){ctx.beginPath();ctx.moveTo(x,478);ctx.lineTo(x,487);ctx.stroke();}ctx.lineWidth=Math.max(3,2/cssScale);}ctx.restore();}
    for(const wall of g.level.platforms.filter(w=>['access-l','access-r','source-l','source-r'].includes(w.id))){ctx.strokeStyle='#152735';ctx.lineWidth=4/cssScale;ctx.beginPath();ctx.moveTo(wall.x,wall.y+wall.h);ctx.lineTo(wall.x+wall.w,wall.y+wall.h);ctx.stroke();ctx.strokeStyle='#e8dfbe';ctx.lineWidth=2/cssScale;ctx.stroke();}
    const rails=OrbitProgression.allowed(g,g.level.rails.find(r=>r.id==='rail-source-l'));
    for(const [points,on]of [[[[4585,305],[4585,365],[4995,365]],g.groups.SOURCE],[[[4995,365],[5200,420],[5768,420]],g.groups.P],[[[4995,365],[5340,360],[5492,350]],rails],[[[5340,360],[5640,350]],rails],[[[5715,160],[5768,350]],g.groups.Q]]){ctx.strokeStyle=on?'#b6edcc':'#789da7';ctx.lineWidth=2;ctx.setLineDash(on?[]:[5,5]);ctx.beginPath();ctx.moveTo(...points[0]);for(const pt of points.slice(1))ctx.lineTo(...pt);ctx.stroke();ctx.setLineDash([]);}
    if(g.player.x>4740&&g.player.x<5350)panel(`Источник ${g.groups.SOURCE?'✓':'○'} · ${g.routerBits.bus?'Рейки':'Дверь'} · Q ${g.groups.Q?'✓':'○'}`,5000,290);
    if(g.player.x>5280&&g.player.x<5800)panel(`${rails?'Есть хват':'Нет питания'} · Q ${g.groups.Q?'заряжен':'пуст'}`,5580,385);
    ctx.strokeStyle='#aec9be';ctx.lineWidth=2;ctx.strokeRect(5748,113,18,40);for(let i=0;i<3;i++){ctx.fillStyle=g.groups.Q?'#c5f1d5':'#203845';ctx.fillRect(5751,117+i*11,12,8);}
    if(g.player.x>6400&&g.player.x<6680)panel(g.meta.dataIds.includes('isolation-protocol')&&g.meta.keyIds.includes('ada-service')?'Оба предмета получены':'Протокол и допуск',6546,400);
   }
   if(g.level.id===8){
    if(g.player.x>5300&&g.player.x<6200)panel(OrbitPuzzleUI.uState(g).title,5775,315);
    ctx.strokeStyle='#e8dfbe';ctx.lineWidth=2/cssScale;ctx.beginPath();ctx.moveTo(5860,387);ctx.lineTo(5877,402);ctx.lineTo(5868,400);ctx.moveTo(5877,402);ctx.lineTo(5876,393);ctx.stroke();
   }
   if(g.level.id!==1){
    for(const r of g.level.routers||[]){const bit=g.routerBits[r.id];if(root.orbitMechanismSprite)root.orbitMechanismSprite(bit?'relay-active':'relay-idle',r.x,r.y-50,50,50);ctx.font='bold 26px Arial';ctx.fillStyle='#fff0ca';ctx.fillText(['T','U'].includes(r.id)?r.id+' '+(bit?'→':'←'):String(bit),r.x+8,r.y-60);const paths=g.routePlatforms.filter(s=>Object.hasOwn(s.requiresRouter,r.id));for(const s of paths){ctx.strokeStyle=s.state==='active'?'#b7edd7':'#637f8d';ctx.setLineDash(s.state==='active'?[]:[5,6]);ctx.beginPath();ctx.moveTo(r.x+r.w/2,r.y-10);ctx.lineTo(s.x+s.w/2,s.y+20);ctx.stroke();ctx.setLineDash([]);}}
    if(g.level.id===8&&g.groups.WEST&&g.groups.EAST&&!g.groups.BYPASS)label('ОБРЫВ ВОСТОКА · ВЕРНИ ПРИВОД НА ЗАПАД',6610,418);
   }
  }
  function enemy(g,e,clock,reduced){
   if(e.dead&&e.deadTime>.37)return;ctx.save();ctx.globalAlpha=e.dead?Math.max(0,1-e.deadTime/.37):1;
   if(e.kind==='sentry'){
    ctx.strokeStyle='#789eb099';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(e.ax+20,e.flightY+14);ctx.lineTo(e.bx+20,e.flightY+14);ctx.stroke();ctx.setLineDash([]);
    for(const x of [e.ax,e.bx]){ctx.strokeStyle='#aec8d8';ctx.strokeRect(x+15,e.flightY+9,10,10);}
    const travel=Math.abs(e.bx-e.ax)/e.speed,phase=g.phaseTime%(travel*2+e.dwell*2),pauseAge=phase<e.dwell?phase:phase-travel-e.dwell;
    if(ready('enemies'))drawOrbitSentry(ctx,images.enemies,e.x,e.flightY,e.dead?'off':e.direction===0?(pauseAge<e.dwell/2?'brake':'turn'):'fly',clock,e.facing,reduced);else{ctx.fillStyle='#db8b76';ctx.fillRect(e.x,e.flightY,40,28);}
   }else{
    const safe=e.state==='rest'||e.contactGrace;
    if(e.state==='warn'){const r=OrbitEngine.chargerArea(g,e,e.dashDirection);ctx.fillStyle='#dca25c33';ctx.fillRect(r.x,e.floorY-8,r.w,8);ctx.strokeStyle='#ffc568';ctx.setLineDash([5,5]);ctx.strokeRect(r.x,e.floorY-10,r.w,10);ctx.setLineDash([]);}
    const frame=e.dead?'off':e.state==='warn'?(e.stateTime>=.5?'brace':'warn'):e.state==='dash'?(reduced||Math.floor(clock/.09)%2?'dash-a':'dash-b'):safe?(e.state==='rest'&&e.stateTime>=1?'recover':'rest'):'idle';
    if(ready('enemies'))drawOrbitCharger(ctx,images.enemies,arts.enemies.frames['charger-'+frame],e.x,e.floorY,e.facing);else{ctx.fillStyle=safe?'#a4d6ce':'#d97858';ctx.fillRect(e.x,e.floorY-28,36,28);}
    if(safe){ctx.strokeStyle='#baebe0';ctx.beginPath();ctx.arc(e.x+18,e.floorY-40,7,0,Math.PI*2);ctx.stroke();}
   }ctx.restore();
  }
  return {world,enemy,noteFind(id,time){foundAt[id]=time;}};
 };
})(window);
