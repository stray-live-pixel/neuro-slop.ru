(function(root){
  'use strict';
  // Кампания v2: определения не меняются во время игры; состояние хранится отдельно.
  const P=typeof module==='object'&&module.exports?require('./progression.js'):root.OrbitProgression;
  const levels=[
    {"id":1,"revision":3,"name":"Первый импульс","width":1500,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":600,"h":180,"oneWay":false},{"x":600,"y":345,"w":300,"h":310,"oneWay":false},{"x":900,"y":475,"w":600,"h":180,"oneWay":false},{"x":650,"y":215,"w":150,"h":20,"oneWay":true},{"x":1130,"y":385,"w":140,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[460,447],[680,317],[820,317],[720,187],[990,447],[1200,357],[1310,447]],"beacon":{"x":1380,"y":475},"hint":"На плите со стрелками нажми прыжок — взлетишь выше","theme":0,"pads":[{"x":420,"y":475,"w":80,"power":900},{"x":720,"y":345,"w":80,"power":900}],"movers":[],"crumbles":[],"switches":[],"gates":[],"checkpoint":null,"enemies":[]},
    {"id":2,"revision":3,"name":"Лунный паром","width":1850,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":440,"h":180,"oneWay":false},{"x":920,"y":475,"w":380,"h":180,"oneWay":false},{"x":1460,"y":475,"w":390,"h":180,"oneWay":false},{"x":650,"y":365,"w":140,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[365,447],{"moverId":"ferry","dx":75,"dy":-28},[720,337],[1010,447],[1230,447],[1530,447],[1650,447]],"beacon":{"x":1730,"y":475},"hint":"Встань на паром. На нём можно ехать и прыгать","theme":1,"pads":[],"movers":[{"id":"trainer","ax":160,"ay":445,"bx":280,"by":445,"speed":80,"w":150,"h":20,"dwell":0.45},{"id":"ferry","ax":420,"ay":475,"bx":780,"by":475,"speed":90,"w":150,"h":20,"dwell":0.45}],"crumbles":[],"switches":[],"gates":[],"checkpoint":null,"enemies":[]},
    {"id":3,"revision":3,"name":"Память моста","width":1900,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":420,"h":180,"oneWay":false},{"x":420,"y":555,"w":680,"h":100,"oneWay":false},{"x":1100,"y":475,"w":800,"h":180,"oneWay":false},{"x":1320,"y":375,"w":250,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[475,407],[620,407],[765,407],[910,407],[500,527],[790,527],[1020,527],[1350,447],[1690,447]],"beacon":{"x":1780,"y":475},"hint":"Мост трескается под ногами. Внизу безопасно","theme":2,"pads":[],"movers":[],"crumbles":[{"x":420,"y":435,"w":110,"id":"k0","h":20,"oneWay":true},{"x":565,"y":435,"w":110,"id":"k1","h":20,"oneWay":true},{"x":710,"y":435,"w":110,"id":"k2","h":20,"oneWay":true},{"x":855,"y":435,"w":110,"id":"k3","h":20,"oneWay":true}],"switches":[],"gates":[],"checkpoint":null,"enemies":[{"id":"w1","kind":"walker","minX":1370,"maxX":1490,"floorY":475,"speed":55,"w":32,"h":26,"dwell":0.35}]},
    {"id":4,"revision":3,"name":"Разбудить станцию","width":2000,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":2000,"h":180,"oneWay":false},{"x":440,"y":385,"w":140,"h":20,"oneWay":true},{"x":700,"y":305,"w":160,"h":20,"oneWay":true},{"x":940,"y":245,"w":120,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[500,357],[770,277],[1000,217],[1010,447],[1260,447],[1550,447],[1780,447]],"beacon":{"x":1880,"y":475},"hint":"Встань на реле. Сигнал откроет заслонку с тем же знаком","theme":3,"pads":[],"movers":[],"crumbles":[],"switches":[{"id":"relay","group":"A","x":770,"y":305,"w":50}],"gates":[{"id":"gate-A","group":"A","x":1140,"y":0,"w":24,"h":475}],"checkpoint":null,"enemies":[{"id":"l1","kind":"pulsar","x":1420,"w":120,"floorY":475,"warn":0.95,"active":0.55,"rest":1.6,"detect":220}]},
    {"id":5,"revision":3,"name":"Экспресс над заливом","width":2300,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":500,"h":180,"oneWay":false},{"x":1040,"y":475,"w":500,"h":180,"oneWay":false},{"x":1900,"y":475,"w":400,"h":180,"oneWay":false},{"x":620,"y":295,"w":180,"h":20,"oneWay":true},{"x":1650,"y":365,"w":130,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],{"moverId":"first","dx":75,"dy":-28},[690,267],[760,267],[1130,447],[1370,447],{"moverId":"second","dx":75,"dy":-28},[1710,337],[2010,447],[2110,447]],"beacon":{"x":2180,"y":475},"hint":"Паром надёжен. Импульсная плита ведёт к верхнему пути","theme":4,"pads":[{"x":350,"y":475,"w":80,"power":900}],"movers":[{"id":"first","ax":480,"ay":475,"bx":890,"by":475,"speed":100,"w":150,"h":20,"dwell":0.45},{"id":"second","ax":1520,"ay":475,"bx":1750,"by":475,"speed":75,"w":150,"h":20,"dwell":0.45}],"crumbles":[],"switches":[],"gates":[],"checkpoint":{"x":1300,"y":475},"enemies":[{"id":"l1","kind":"pulsar","x":2010,"w":100,"floorY":475,"warn":0.95,"active":0.55,"rest":1.6,"detect":220}]},
    {"id":6,"revision":3,"name":"Обход аварии","width":2200,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":450,"h":180,"oneWay":false},{"x":450,"y":555,"w":900,"h":100,"oneWay":false},{"x":1350,"y":475,"w":850,"h":180,"oneWay":false},{"x":700,"y":485,"w":120,"h":20,"oneWay":true},{"x":880,"y":435,"w":140,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[480,407],[620,407],[760,407],[950,407],[1110,407],[1250,407],[520,527],[1110,527],[1510,447],[1870,447],[2040,447]],"beacon":{"x":2080,"y":475},"hint":"Реле на целой площадке. К нему ведут верх и низ","theme":5,"pads":[],"movers":[],"crumbles":[{"x":430,"y":435,"w":100,"id":"k0","h":20,"oneWay":true},{"x":570,"y":435,"w":100,"id":"k1","h":20,"oneWay":true},{"x":710,"y":435,"w":100,"id":"k2","h":20,"oneWay":true},{"x":1060,"y":435,"w":100,"id":"k3","h":20,"oneWay":true},{"x":1200,"y":435,"w":100,"id":"k4","h":20,"oneWay":true}],"switches":[{"id":"relay","group":"A","x":930,"y":435,"w":50}],"gates":[{"id":"gate-A","group":"A","x":1640,"y":0,"w":24,"h":475}],"checkpoint":{"x":1450,"y":475},"enemies":[{"id":"w1","kind":"walker","minX":960,"maxX":1060,"floorY":555,"speed":65,"w":32,"h":26,"dwell":0.35},{"id":"l1","kind":"pulsar","x":1800,"w":100,"floorY":475,"warn":0.95,"active":0.55,"rest":1.6,"detect":220}]},
    {"id":7,"revision":3,"name":"Высота обзора","width":2200,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":1000,"h":180,"oneWay":false},{"x":1000,"y":255,"w":400,"h":400,"oneWay":false},{"x":1400,"y":475,"w":800,"h":180,"oneWay":false},{"x":620,"y":275,"w":140,"h":20,"oneWay":true},{"x":780,"y":255,"w":140,"h":20,"oneWay":true},{"x":1100,"y":165,"w":140,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[410,447],{"moverId":"lift","dx":75,"dy":-28},[690,247],[850,227],[1050,227],[1170,137],[1310,227],[1540,447],[1950,447]],"beacon":{"x":2080,"y":475},"hint":"Лифт поднимет спокойно. Плита позволяет взлететь самому","theme":6,"pads":[{"x":360,"y":475,"w":80,"power":900}],"movers":[{"id":"lift","ax":520,"ay":475,"bx":520,"by":255,"speed":70,"w":150,"h":20,"dwell":0.45}],"crumbles":[],"switches":[],"gates":[],"checkpoint":null,"enemies":[{"id":"w1","kind":"walker","minX":1110,"maxX":1200,"floorY":255,"speed":65,"w":32,"h":26,"dwell":0.35}]},
    {"id":8,"revision":3,"name":"Два сигнала","width":2200,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":500,"h":180,"oneWay":false},{"x":1000,"y":475,"w":1200,"h":180,"oneWay":false},{"x":430,"y":335,"w":140,"h":20,"oneWay":true},{"x":650,"y":335,"w":180,"h":20,"oneWay":true},{"x":750,"y":475,"w":140,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],{"moverId":"lift","dx":75,"dy":-28},[500,307],[760,307],{"moverId":"ferry","dx":75,"dy":-28},[820,447],[1110,447],[1420,447],[1730,447],[2020,447]],"beacon":{"x":2080,"y":475},"hint":"Любое реле откроет выход: наверху или на остановке парома","theme":7,"pads":[],"movers":[{"id":"lift","ax":220,"ay":475,"bx":220,"by":335,"speed":65,"w":150,"h":20,"dwell":0.45},{"id":"ferry","ax":480,"ay":475,"bx":850,"by":475,"speed":80,"w":150,"h":20,"dwell":0.45}],"crumbles":[],"switches":[{"id":"high","group":"A","x":720,"y":335,"w":50},{"id":"low","group":"A","x":800,"y":475,"w":50}],"gates":[{"id":"gate-A","group":"A","x":980,"y":0,"w":24,"h":475}],"checkpoint":null,"enemies":[{"id":"w1","kind":"walker","minX":1570,"maxX":1680,"floorY":475,"speed":70,"w":32,"h":26,"dwell":0.35},{"id":"l1","kind":"pulsar","x":700,"w":80,"floorY":335,"warn":0.95,"active":0.55,"rest":1.6,"detect":220}]},
    {"id":9,"revision":3,"name":"Дрожащая дуга","width":2400,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":500,"h":180,"oneWay":false},{"x":1100,"y":475,"w":450,"h":180,"oneWay":false},{"x":2020,"y":475,"w":380,"h":180,"oneWay":false},{"x":1200,"y":240,"w":160,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],[555,447],[705,417],[855,387],[1005,357],[1280,212],[1400,447],[1645,447],[1795,447],[1945,447],[2220,447]],"beacon":{"x":2280,"y":475},"hint":"На хрупкой плите не задерживайся. Импульс ведёт к награде","theme":8,"pads":[{"x":975,"y":385,"w":70,"power":900},{"x":1450,"y":475,"w":80,"power":900}],"movers":[],"crumbles":[{"x":500,"y":475,"w":110,"id":"k0","h":20,"oneWay":true},{"x":650,"y":445,"w":110,"id":"k1","h":20,"oneWay":true},{"x":800,"y":415,"w":110,"id":"k2","h":20,"oneWay":true},{"x":950,"y":385,"w":110,"id":"k3","h":20,"oneWay":true},{"x":1590,"y":475,"w":110,"id":"k4","h":20,"oneWay":true},{"x":1740,"y":475,"w":110,"id":"k5","h":20,"oneWay":true},{"x":1890,"y":475,"w":110,"id":"k6","h":20,"oneWay":true}],"switches":[],"gates":[],"checkpoint":{"x":1430,"y":475},"enemies":[{"id":"w1","kind":"walker","minX":2060,"maxX":2150,"floorY":475,"speed":75,"w":32,"h":26,"dwell":0.35},{"id":"l1","kind":"pulsar","x":1240,"w":90,"floorY":475,"warn":0.95,"active":0.55,"rest":1.6,"detect":220}]},
    {"id":10,"revision":3,"name":"Сердце Орбиты","width":2800,"spawn":{"x":80,"y":433},"platforms":[{"x":0,"y":475,"w":450,"h":180,"oneWay":false},{"x":1020,"y":475,"w":550,"h":180,"oneWay":false},{"x":2170,"y":475,"w":630,"h":180,"oneWay":false},{"x":580,"y":295,"w":160,"h":20,"oneWay":true},{"x":800,"y":315,"w":160,"h":20,"oneWay":true},{"x":700,"y":475,"w":140,"h":20,"oneWay":true},{"x":2250,"y":195,"w":150,"h":20,"oneWay":true}],"hazards":[],"coins":[[180,447],{"moverId":"ferry","dx":75,"dy":-28},[700,267],[870,287],[800,447],[1250,447],[1490,447],[1620,407],[1770,377],[1920,347],[2070,317],[2320,167],[2480,447],[2630,447]],"beacon":{"x":2680,"y":475},"hint":"Выбери сигнал к маяку. После флага — последний хрупкий мост","theme":9,"pads":[{"x":330,"y":475,"w":70,"power":900},{"x":1450,"y":475,"w":80,"power":900},{"x":2040,"y":345,"w":70,"power":900}],"movers":[{"id":"ferry","ax":430,"ay":475,"bx":870,"by":475,"speed":90,"w":150,"h":20,"dwell":0.45}],"crumbles":[{"x":1570,"y":435,"w":100,"id":"k0","h":20,"oneWay":true},{"x":1720,"y":405,"w":100,"id":"k1","h":20,"oneWay":true},{"x":1870,"y":375,"w":100,"id":"k2","h":20,"oneWay":true},{"x":2020,"y":345,"w":100,"id":"k3","h":20,"oneWay":true}],"switches":[{"id":"high","group":"A","x":650,"y":295,"w":50},{"id":"low","group":"A","x":780,"y":475,"w":50}],"gates":[{"id":"gate-A","group":"A","x":1140,"y":0,"w":24,"h":475}],"checkpoint":{"x":1360,"y":475},"enemies":[{"id":"w1","kind":"walker","minX":735,"maxX":785,"floorY":475,"speed":55,"w":32,"h":26,"dwell":0.35},{"id":"l1","kind":"pulsar","x":2520,"w":100,"floorY":475,"warn":0.95,"active":0.55,"rest":1.6,"detect":220}]}
  ];
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const horizontal=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x;
  const chapters=typeof module==='object'&&module.exports?require('./chapters.js'):root.OrbitChapters;
  for(const chapter of chapters||[])levels[chapter.id-1]=chapter;
  function flags(level){return level.checkpoints|| (level.checkpoint?[{id:'flag',order:1,...level.checkpoint}]:[]);}
  function gateOpen(g,gate){return (gate.requires||[gate.group]).every(id=>g.groups[id]);}
  function applyCheckpoint(g,c){
    const flag=flags(g.level).find(f=>f.id===c.id);if(!flag)return;
    g.phaseTime=c.phaseTime;g.groups={...c.groups};g.routerBits={...c.routerBits};g.routerArmed=Object.fromEntries((g.level.routers||[]).map(r=>[r.id,true]));
    g.coins.forEach((coin,i)=>coin.taken=!!c.coins[i]);g.score=g.coins.filter(coin=>coin.taken).length;
    Object.assign(g.player,{x:flag.x-15,y:flag.y-42});
    g.movers.forEach(m=>Object.assign(m,moverPosition(m,g.phaseTime)));
    g.enemies=c.enemies.map(e=>({...e}));
    for(const e of g.enemies){if(e.kind==='pulsar'&&!e.firstWarnComplete)resetFirstWarning(e);if(e.kind==='charger'){if(!e.firstWarnComplete){e.state='idle';e.stateTime=0;}else if(e.state==='warn')e.stateTime=0;}}
    updateLogic(g);updateTemporary(g,0);g.learned={...c.learned};g.trainingDistance=c.trainingDistance||0;g.rideDistance=0;updateCoins(g);
  }
  function resumeRun(g,run){
    reset(g);g.checkpoint=JSON.parse(JSON.stringify(run.checkpoint));applyCheckpoint(g,g.checkpoint);
    g.elapsed=run.elapsed;g.deaths=run.deaths;g.attempts=g.deaths+1;g.event='';g.events=[];
  }
  function pressure(g){
    return Object.fromEntries((g.level.pressureCircuits||[]).map(c=>{
      const requested=c.inputs.reduce((sum,id)=>sum+g.routerBits[id],0),overload=requested>c.capacity;
      const outputs=Object.fromEntries(c.inputs.map(id=>[id,overload?0:g.routerBits[id]]));
      return [c.id,{requested,capacity:c.capacity,overload,outputs,ready:!overload&&Object.entries(c.targets).every(([id,value])=>outputs[id]===value)}];
    }));
  }
  function updateLogic(g){
    const rules=g.level.logic||[],before=g.groups,next={...before};
    // Производные значения строим заново: вчерашнее питание не разрешает сегодняшний контакт.
    for(const r of rules)if(!r.latch)next[r.group]=false;
    for(let pass=0;pass<=rules.length;pass++){
      const values={};
      for(const r of rules){if(r.requiresAny&&r.requiresAny.length===0)throw new Error('Пустое requiresAny');const active=(r.requires||[]).every(id=>next[id])&&(!r.requiresAny||r.requiresAny.some(id=>next[id]))&&(r.any||[{}]).some(choice=>Object.entries(choice).every(([id,bit])=>g.routerBits[id]===bit));values[r.group]=!!values[r.group]||active||(r.latch&&!!next[r.group]);}
      let changed=false;for(const [id,on]of Object.entries(values)){if(next[id]!==on)changed=true;next[id]=on;}if(!changed)break;
    }
    for(const r of rules)if(r.latch&&!next[r.group]&&before[r.group]===undefined)delete next[r.group];
    g.groups=next;g.circuits=pressure(g);
    for(const [id,on]of Object.entries(next))if(on&&!before[id]&&rules.some(r=>r.group===id&&r.latch))signal(g,'relay');
  }
  function observe(g,id){const field=id==='ada-fragment'?'dataIds':id==='ada-bypass'?'traceIds':null;if(field&&!g.meta[field].includes(id)){g.meta[field].push(id);g.metaChanged=true;}if(g.facts[id])return;g.facts[id]=true;g.storyEvents.push(id);signal(g,'discovery');}
  function moverPosition(m,time){
    const duration=Math.hypot(m.bx-m.ax,m.by-m.ay)/m.speed,dwell=m.dwell??.45;
    const period=duration*2+dwell*2,t=((time%period)+period)%period;
    let fraction=0,direction=0;
    if(t>=dwell&&t<dwell+duration){fraction=(t-dwell)/duration;direction=1;}
    else if(t>=dwell+duration&&t<2*dwell+duration)fraction=1;
    else if(t>=2*dwell+duration){fraction=1-(t-2*dwell-duration)/duration;direction=-1;}
    return {x:m.ax+(m.bx-m.ax)*fraction,y:m.ay+(m.by-m.ay)*fraction,direction};
  }
  function createGame(index=0){
    if(!Number.isInteger(index)||!levels[index])throw new RangeError('Неизвестный уровень');
    const g={level:levels[index],levelIndex:index,attempts:0,meta:P.blank(),facts:{},storyEvents:[]};reset(g);return g;
  }
  function restoreStart(g){
    g.player={...g.level.spawn,w:30,h:42,vx:0,vy:0,grounded:false,facing:1,supportId:null};
    g.routerBits=Object.fromEntries((g.level.routers||[]).map(r=>[r.id,r.initial]));g.routerArmed=Object.fromEntries((g.level.routers||[]).map(r=>[r.id,true]));
    g.groups={};
    g.resonantPlatforms=(g.level.resonantPlatforms||[]).map(s=>({...s,state:'inactive',remaining:0}));
    g.routePlatforms=(g.level.routePlatforms||[]).map(s=>({...s,state:P.allowed(g,s)&&Object.entries(s.requiresRouter).every(([id,bit])=>g.routerBits[id]===bit)?'active':'inactive'}));
    g.relayVisits={};g.grip=null;g.wallKick=0;g.railCooldown=0;g.lastRail=null;g.pickupEvents=[];
    g.phaseTime=0;g.score=0;g.won=false;g.jumpBuffer=0;g.coyote=0;g.groups={};
    g.crumbles=(g.level.crumbles||[]).map(k=>({...k,state:'whole',remaining:0}));
    g.enemies=(g.level.enemies||[]).map(e=>({...e,w:e.w??32,h:e.h??26,x:e.x??e.spawnX??e.minX??e.ax,y:e.kind==='sentry'?e.flightY:e.floorY-(e.h||26),dead:false,deadTime:0,awake:false,firstWarnComplete:false,cycle:0,state:e.kind==='charger'?'idle':'sleep',stateTime:0,contactGrace:false,dashDirection:e.facing||1,facing:e.facing||1}));
    g.movers=(g.level.movers||[]).map(m=>({...m,...moverPosition(m,0),oneWay:true}));
    g.coins=g.level.coins.map((c,id)=>Array.isArray(c)?{id,x:c[0],y:c[1],taken:false}:{...c,id:c.id??id,x:c.x??0,y:c.y??0,taken:false});
    g.circuits=pressure(g);updateCoins(g);
  }
  function reset(g){g.attempts=(g.attempts||0)+1;g.elapsed=0;g.deaths=0;g.checkpoint=null;g.learned={};g.trainingDistance=0;g.rideDistance=0;restoreStart(g);g.events=[];signal(g,'restart');}
  function signal(g,event){g.event=event;g.events.push(event);}
  function die(g){
    const death={x:g.player.x,y:g.player.y,facing:g.player.facing};
    g.deaths++;g.attempts++;restoreStart(g);
    if(g.checkpoint)applyCheckpoint(g,g.checkpoint);
    g.death=death;g.events=[];signal(g,'fall');
  }
  function learnAbility(g,id){if(!g.meta.seenTutorials.includes(id)){g.meta.seenTutorials.push(id);g.metaChanged=true;}g.learned[id]=true;}
  function readyResonator(g){const p=g.player;if(!p.grounded||!g.meta.abilities.resonator)return null;return (g.level.resonators||[]).find(s=>P.allowed(g,s)&&p.x+p.w/2>=s.x&&p.x+p.w/2<=s.x+s.w&&Math.abs(p.y+p.h-s.y)<.1)||null;}
  function updateTemporary(g,dt){
    for(const s of [...g.resonantPlatforms,...g.routePlatforms]){
      const timed=Object.hasOwn(s,'remaining'),was=s.state;
      if(timed)s.remaining=Math.max(0,s.remaining-dt);
      const on=timed?s.remaining>1e-9:P.allowed(g,s)&&Object.entries(s.requiresRouter).every(([id,bit])=>g.routerBits[id]===bit);
      // Истёкшая опора держит только уже стоящего героя; после схода новых посадок нет.
      const standing=g.player.grounded&&g.player.supportId===s.id&&horizontal(g.player,s)&&Math.abs(g.player.y+g.player.h-s.y)<.1;
      if(on)s.state=was==='active'||was==='held'?'active':overlap(g.player,s)?'pending':'active';
      else s.state=standing&&(was==='active'||was==='held')?'held':'inactive';
      if(timed&&was==='active'&&!on)signal(g,'resonance-expire');
    }
  }
  function railContact(g,input){
    const p=g.player;if(p.grounded||p.vy<0||!g.meta.abilities.magboots||g.wallKick>0)return null;
    return (g.level.rails||[]).find(r=>{const wall=g.level.platforms.find(s=>s.id===r.wallId);if(!P.allowed(g,r)||!wall||wall.oneWay||g.lastRail===r.id&&g.railCooldown>0)return false;
      return Math.min(p.y+p.h,r.y1)-Math.max(p.y,r.y0)>=12&&(r.face==='left'?input.right&&Math.abs(p.x+p.w-wall.x)<=4:input.left&&Math.abs(p.x-wall.x-wall.w)<=4);})||null;
  }
  function readyPad(g){
    const p=g.player;if(!p.grounded)return null;
    return (g.level.pads||[]).find(s=>p.x+p.w/2>=s.x&&p.x+p.w/2<=s.x+s.w&&Math.abs(p.y+p.h-s.y)<.1)||null;
  }
  function warningVisible(e,view){
    if(!view||![view.x,view.y,view.w,view.h].every(Number.isFinite))return false;
    const left=Math.min(e.x,e.x+e.w/2-24),right=Math.max(e.x+e.w,e.x+e.w/2+24);
    return left>=view.x+12&&right<=view.x+view.w-12&&e.floorY-214>=view.y+12&&e.floorY<=view.y+view.h-12;
  }
  function resetFirstWarning(e){e.awake=false;e.cycle=0;e.state='sleep';}
  // Resize может скрыть предупреждение даже во время паузы, без шага физики.
  function validateView(g,view){
    for(const e of g.enemies){if(e.kind==='pulsar'&&!e.firstWarnComplete&&!warningVisible(e,view))resetFirstWarning(e);if(e.kind==='charger'&&!e.firstWarnComplete&&e.state==='warn'&&!rectVisible(chargerArea(g,e,e.dashDirection),view)){e.state='idle';e.stateTime=0;}}
  }
  function updateMechanisms(g,dt,viewRect){
    for(const k of g.crumbles){
      if(k.state==='whole')continue;k.remaining-=dt;
      if(k.remaining>1e-8)continue;
      if(k.state==='cracking'){
        k.state='gone';k.remaining=2;signal(g,'crumble');
        if(g.player.supportId===k.id){g.player.grounded=false;g.player.supportId=null;}
      }else if(!overlap(g.player,k)){k.state='whole';k.remaining=0;}
    }
    for(const e of g.enemies){
      if(e.dead){e.deadTime+=dt;continue;}
      if(e.kind==='walker'){
        const position=moverPosition({ax:e.minX,ay:e.floorY-26,bx:e.maxX,by:e.floorY-26,speed:e.speed,dwell:e.dwell},g.phaseTime);
        e.x=position.x;e.y=position.y;e.direction=position.direction;if(e.direction)e.facing=e.direction;
      }else if(e.kind==='sentry'){const priorDirection=e.direction;const m=moverPosition({ax:e.ax,ay:e.flightY,bx:e.bx,by:e.flightY,speed:e.speed,dwell:e.dwell},g.phaseTime);Object.assign(e,m);if(e.direction){e.facing=e.direction;if(priorDirection===0&&viewRect&&overlap({x:e.x,y:e.flightY,w:e.w,h:e.h},viewRect))signal(g,'enemy-turn');}
      }else if(e.kind==='charger'){updateCharger(g,e,dt,viewRect);
      }else{
        const center=g.player.x+g.player.w/2;
        if(!e.firstWarnComplete){
          if(!warningVisible(e,viewRect)){resetFirstWarning(e);continue;}
          if(!e.awake){
            if(center<e.x-e.detect||center>e.x+e.w+e.detect)continue;
            e.awake=true;e.cycle=0;
          }else{
            e.cycle+=dt;
            if(e.cycle+1e-9>=e.warn){e.cycle=Math.max(e.warn,e.cycle);e.firstWarnComplete=true;}
          }
        }else e.cycle=(e.cycle+dt)%(e.warn+e.active+e.rest);
        const state=e.cycle<e.warn?'warn':e.cycle<e.warn+e.active?'active':'rest';
        if(state!==e.state&&state==='warn')signal(g,'enemy-warn');
        if(state!==e.state&&state==='active')signal(g,'enemy-pulse');e.state=state;
      }
    }
  }
  function enemyBody(e){return e.kind==='sentry'?{x:e.x+4,y:e.flightY+4,w:32,h:24}:e.kind==='charger'?{x:e.x+4,y:e.floorY-24,w:28,h:24}:{x:e.x+4,y:e.floorY-22,w:24,h:22};}
  function rectVisible(r,v){return !!v&&r.x>=v.x+12&&r.x+r.w<=v.x+v.w-12&&r.y>=v.y+12&&r.y+r.h<=v.y+v.h-12;}
  function chargerArea(g,e,dir){
    let end=Math.max(e.minX,Math.min(e.maxX,e.x+dir*e.speed*e.dash));
    const solids=[...g.level.platforms.filter(s=>!s.oneWay),...(g.level.gates||[]).filter(s=>!gateOpen(g,s))];
    for(const s of solids)if(s.y<e.floorY&&s.y+s.h>e.floorY-e.h){if(dir>0&&s.x>=e.x+e.w)end=Math.min(end,s.x-e.w);if(dir<0&&s.x+s.w<=e.x)end=Math.max(end,s.x+s.w);}
    return {x:Math.min(e.x,end),y:e.floorY-e.h,w:Math.abs(end-e.x)+e.w,h:e.h,end};
  }
  function updateCharger(g,e,dt,view){
    // Безопасный отдых не превращается в урон внутри тела героя.
    if(e.contactGrace&&!overlap(g.player,enemyBody(e)))e.contactGrace=false;
    if(e.state==='idle'){
      const dx=g.player.x+g.player.w/2-e.x-e.w/2,dir=Math.sign(dx)||e.facing;
      if(e.contactGrace||Math.abs(dx)>e.detect||Math.abs(g.player.y+g.player.h-e.floorY)>80||!e.firstWarnComplete&&!rectVisible(chargerArea(g,e,dir),view))return;
      e.facing=e.dashDirection=dir;e.state='warn';e.stateTime=0;signal(g,'charger-warn');return;
    }
    if(e.state==='warn'&&!e.firstWarnComplete&&!rectVisible(chargerArea(g,e,e.dashDirection),view)){e.state='idle';e.stateTime=0;return;}
    e.stateTime+=dt;
    if(e.state==='warn'&&e.stateTime+1e-9>=e.warn){e.firstWarnComplete=true;e.state='dash';e.stateTime=0;signal(g,'charger-dash');}
    else if(e.state==='dash'){
      const end=chargerArea(g,e,e.dashDirection).end,step=e.dashDirection*e.speed*dt;
      e.x=e.dashDirection>0?Math.min(end,e.x+step):Math.max(end,e.x+step);
      if(e.stateTime+1e-9>=e.dash||Math.abs(e.x-end)<1e-7){e.state='rest';e.stateTime=0;signal(g,'charger-rest');}
    }else if(e.state==='rest'&&e.stateTime+1e-9>=e.rest){e.contactGrace=overlap(g.player,enemyBody(e));e.state='idle';e.stateTime=0;}
  }
  function tutorialEnemy(g,view){
    const p=g.player,cx=p.x+p.w/2;
    return g.enemies.filter(e=>!e.dead&&!g.learned[e.kind]).map(e=>{
      const r=e.kind==='pulsar'?{x:e.x,y:e.floorY-214,w:e.w,h:214}:e.kind==='charger'?chargerArea(g,e,e.dashDirection):{x:e.x,y:e.y,w:e.w,h:e.h};
      return {e,r,d:Math.max(r.x-cx,cx-r.x-r.w,0)};
    }).filter(v=>view&&overlap(v.r,view)&&v.d<=220).sort((a,b)=>(a.e.kind==='pulsar'&&!a.e.firstWarnComplete?-1:0)-(b.e.kind==='pulsar'&&!b.e.firstWarnComplete?-1:0)||a.d-b.d)[0]?.e||null;
  }
  function enemyContact(g,previousBottom){
    const p=g.player;
    for(const e of g.enemies){
      if(e.dead)continue;
      if(e.kind!=='pulsar'){
        const top=e.kind==='sentry'?e.flightY:e.floorY-e.h,body=enemyBody(e);
        if(p.vy>0&&previousBottom<=top+6&&p.y+p.h>=top&&horizontal(p,body)){
          e.dead=true;e.deadTime=0;p.y=top-p.h;p.vy=-420;p.grounded=false;p.supportId=null;g.jumpBuffer=0;g.coyote=0;signal(g,'enemy-stomp');
        }else if(overlap(p,body)&&!(e.kind==='charger'&&(e.state==='rest'||e.contactGrace)))return true;
      }else if(e.state==='active'&&overlap(p,{x:e.x+4,y:e.floorY-18,w:e.w-8,h:18}))return true;
    }
    return false;
  }
  function updateCoins(g){
    for(const coin of g.coins)if(coin.moverId){const m=g.movers.find(m=>m.id===coin.moverId);coin.x=m.x+coin.dx;coin.y=m.y+coin.dy;}
  }
  function moveHorizontal(p,dx,solids){
    p.x+=dx;
    for(const s of solids)if(overlap(p,s)){if(dx>0)p.x=s.x-p.w;else if(dx<0)p.x=s.x+s.w;}
  }
  function step(g,input={},dt=1/120,viewRect){
    if(g.won)return;
    dt=Math.max(0,Math.min(dt,1/60));g.event='';g.events=[];g.storyEvents=[];g.pickupEvents=[];g.metaChanged=false;g.elapsed+=dt;g.phaseTime+=dt;const previousSupport=g.player.supportId;updateTemporary(g,dt);updateMechanisms(g,dt,viewRect);
    const p=g.player,statics=[...g.level.platforms.map((s,i)=>({...s,id:s.id||'static-'+i})),...g.crumbles.filter(k=>k.state!=='gone'),...[...g.resonantPlatforms,...g.routePlatforms].filter(s=>s.state==='active'||s.state==='held'),...(g.level.gates||[]).filter(gate=>!gateOpen(g,gate))];
    const solids=statics.filter(s=>!s.oneWay);
    for(const mover of g.movers){
      mover.previousX=mover.x;mover.previousY=mover.y;
      Object.assign(mover,moverPosition(mover,g.phaseTime));
    }
    const stationary=p.grounded&&statics.find(s=>horizontal(p,s)&&Math.abs(p.y+p.h-s.y)<.01);
    if(stationary)p.supportId=stationary.id;
    const support=g.movers.find(m=>m.id===p.supportId);let carriedId=null;
    if(!p.grounded||support?.id!=='trainer'||input.left||input.right)g.trainingDistance=0;
    if(!p.grounded||!support||support.id==='trainer'||input.left||input.right)g.rideDistance=0;
    if(p.grounded&&support&&horizontal(p,{...support,x:support.previousX})){
      carriedId=support.id;
      if(support.id==='trainer'&&!input.left&&!input.right){g.trainingDistance+=Math.abs(support.x-support.previousX);if(g.trainingDistance>=40)g.learned.trainer=true;}
      else g.trainingDistance=0;
      if(support.id!=='trainer'&&!input.left&&!input.right){g.rideDistance+=Math.hypot(support.x-support.previousX,support.y-support.previousY);if(g.rideDistance>=20)g.learned.transport=true;}
      moveHorizontal(p,support.x-support.previousX,solids);
      const dy=support.y-support.previousY;p.y+=dy;
      for(const solid of solids)if(overlap(p,solid)){if(dy<0)p.y=solid.y+solid.h;else if(dy>0)p.y=solid.y-p.h;}
      // На стыке берега и парома неподвижная опора удерживает игрока на берегу.
      const shore=statics.find(s=>horizontal(p,s)&&Math.abs(p.y+p.h-s.y)<.01);
      if(shore)p.supportId=shore.id;
    }
    g.jumpBuffer=input.jump?.13:Math.max(0,g.jumpBuffer-dt);
    g.coyote=p.grounded?.09:Math.max(0,g.coyote-dt);
    g.wallKick=Math.max(0,g.wallKick-dt);g.railCooldown=Math.max(0,g.railCooldown-dt);
    p.vx=g.wallKick>0?g.kickDirection*290:((input.right?1:0)-(input.left?1:0))*290;if(p.vx)p.facing=Math.sign(p.vx);
    g.grip=railContact(g,input);
    if(g.jumpBuffer>0&&g.coyote>0){
      const pad=readyPad(g),contact=input.jump&&readyResonator(g);
      if(contact){for(const id of contact.targets){const s=g.resonantPlatforms.find(s=>s.id===id);if(s){s.remaining=contact.duration;s.state=overlap(p,s)?'pending':'active';}}signal(g,'resonance-pulse');}
      p.vy=-(pad?pad.power:650);p.grounded=false;p.supportId=null;g.jumpBuffer=0;g.coyote=0;signal(g,pad?'boost':'jump');if(pad)g.learned.boost=true;
    }
    if(input.jump&&g.grip&&!p.grounded&&g.coyote<=0){p.vy=-650;g.kickDirection=g.grip.face==='left'?-1:1;p.vx=g.kickDirection*290;g.wallKick=.10;g.railCooldown=.20;g.lastRail=g.grip.id;g.grip=null;g.jumpBuffer=0;g.coyote=0;learnAbility(g,'magboots');signal(g,'wall-jump');}
    const ownStart=p.x;moveHorizontal(p,p.vx*dt,solids);p.moving=Math.abs(p.x-ownStart)>.001;p.x=Math.max(0,Math.min(g.level.width-p.w,p.x));
    const previousBottom=p.y+p.h;g.grip=railContact(g,input);p.vy=Math.min(g.grip?120:1000,p.vy+1700*dt);p.y+=p.vy*dt;
    p.grounded=false;p.supportId=null;
    if(p.vy<0){for(const s of solids)if(overlap(p,s)){p.y=s.y+s.h;p.vy=0;}}
    else {
      // Сначала выбираем самую высокую пересечённую поверхность; при равенстве — статичную.
      const candidates=[...statics,...g.movers].filter(s=>horizontal(p,s)&&previousBottom<=(s.id===carriedId?s.y:(s.previousY??s.y))+.05&&p.y+p.h>=s.y&&p.vy*dt-(s.y-(s.previousY??s.y))>=-.001).sort((a,b)=>a.y-b.y);
      const landed=candidates[0];
      if(landed){if(g.resonantPlatforms.some(s=>s.id===landed.id))learnAbility(g,'resonator');p.y=landed.y-p.h;p.vy=0;p.grounded=true;p.supportId=landed.id;const k=g.crumbles.find(k=>k.id===landed.id);if(k&&k.state==='whole'){k.state='cracking';k.remaining=1;signal(g,'crack');}}
    }
    if(g.crumbles.some(k=>k.id===previousSupport)&&p.supportId!==previousSupport)g.learned.crumble=true;
    if(enemyContact(g,previousBottom)||p.y>720||g.level.hazards.some(h=>overlap(p,{x:h.x+6,y:h.y+5,w:h.w-12,h:h.h-5}))){die(g);return;}
    for(const enemy of g.enemies){if(enemy.kind==='walker'&&(enemy.dead||p.x>enemy.maxX+32))g.learned.walker=true;if(enemy.kind==='pulsar'){if(horizontal(p,{x:enemy.x,w:enemy.w}))enemy.playerEntered=true;if(enemy.firstWarnComplete&&enemy.playerEntered&&(p.x>enemy.x+enemy.w+20||p.x+p.w<enemy.x-20))g.learned.pulsar=true;}}
    updateCoins(g);
    for(const c of g.coins)if(!c.taken&&overlap(p,{x:c.x-12,y:c.y-12,w:24,h:24})){c.taken=true;g.score++;signal(g,'coin');}
    for(const router of g.level.routers||[]){
      const center=p.x+p.w/2;
      // Гистерезис не даёт прыжку на месте и дрожанию на краю переключать сеть.
      if(center<router.x-router.rearmMargin||center>router.x+router.w+router.rearmMargin)g.routerArmed[router.id]=true;
      if(P.allowed(g,router)&&g.routerArmed[router.id]&&p.grounded&&Math.abs(p.y+p.h-router.y)<.1&&center>=router.x&&center<=router.x+router.w){
        g.routerBits[router.id]=(g.routerBits[router.id]+1)%(router.stateCount||2);g.routerArmed[router.id]=false;g.learned.router=true;signal(g,'router');
      }
    }
    updateLogic(g);
    for(const relay of g.level.switches||[])if(P.allowed(g,relay)&&p.grounded&&Math.abs(p.y+p.h-relay.y)<.1&&p.x+p.w/2>=relay.x&&p.x+p.w/2<=relay.x+relay.w){
      if(!g.groups[relay.group]){g.groups[relay.group]=true;g.learned.relay=true;signal(g,'relay');}
      else if(g.level.id===4&&relay.group==='P'&&!g.relayVisits[relay.id])signal(g,'duplicate-relay');
      g.relayVisits[relay.id]=true;
    }
    updateLogic(g);updateTemporary(g,0);
    for(const pickup of g.level.pickups||[])if(P.allowed(g,pickup)&&overlap(p,pickup)&&P.grant(g.meta,pickup)){g.pickupEvents.push(pickup.id);g.metaChanged=true;signal(g,pickup.kind==='ability'?'module-found':'discovery');}
    for(const trigger of g.level.storyTriggers||[]){
      if(trigger.group?g.groups[trigger.group]:Math.abs(p.x+p.w/2-trigger.x)<80)observe(g,trigger.id);
    }
    const trace=g.level.optionalTrace;
    if(trace&&Math.hypot(p.x+p.w/2-trace.x,p.y+p.h-trace.y)<=trace.radius)observe(g,trace.id);
    for(const flag of flags(g.level))if(flag.order>(g.checkpoint?.order||0)&&p.grounded&&Math.abs(p.y+p.h-flag.y)<.1&&Math.abs(p.x+p.w/2-flag.x)<=25){
      g.checkpoint={...flag,coins:g.coins.map(c=>c.taken),groups:{...g.groups},routerBits:{...g.routerBits},phaseTime:g.phaseTime,enemies:g.enemies.map(e=>({...e})),learned:{...g.learned},trainingDistance:g.trainingDistance};signal(g,'checkpoint');
    }
    if(P.allowed(g,g.level.beacon)&&overlap(p,{x:g.level.beacon.x,y:g.level.beacon.y-80,w:50,h:80})){g.won=true;signal(g,'win');}

  }

  const STORAGE_KEY='orbit.campaign.v2';
  const LEGACY_STORAGE_KEY='orbit.campaign.v1';
  // Лимиты старой кампании не зависят от будущей геометрии новых уровней.
  const LEGACY_COIN_COUNTS=[7,7,7,10,9,9,11,11,10,15];
  function blankProgress(){return {version:2,unlocked:1,importedUnlocked:1,migrationNoticePending:false,migrationSuppressed:false,records:levels.map(()=>null)};}
  function validRecord(r,maxCoins){
    return r && Number.isInteger(r.coins) && r.coins>=0 && r.coins<=maxCoins && Number.isFinite(r.time) && r.time>0;
  }
  function normalizeProgress(value){
    const clean=blankProgress();
    if(!value || value.version!==2 || !Array.isArray(value.records))return clean;
    if(Number.isInteger(value.importedUnlocked)&&value.importedUnlocked>=1&&value.importedUnlocked<=levels.length){
      clean.importedUnlocked=value.importedUnlocked;
    }
    clean.migrationNoticePending=value.migrationNoticePending===true;clean.migrationSuppressed=value.migrationSuppressed===true;
    for(let i=0;i<levels.length;i++){
      const r=value.records[i];
      if(validRecord(r,levels[i].coins.length) && (r.revision??1)===(levels[i].revision||1)){
        clean.records[i]={revision:levels[i].revision||1,coins:r.coins,time:r.time,fullTime:r.coins===levels[i].coins.length && Number.isFinite(r.fullTime) && r.fullTime>=r.time ? r.fullTime:null};
      }
    }
    let previousAccess=clean.importedUnlocked;
    while(previousAccess<levels.length){
      const r=value.records[previousAccess-1],revision=r?.revision??1;
      const max=revision===1?LEGACY_COIN_COUNTS[previousAccess-1]:levels[previousAccess-1].coins.length;
      if(!validRecord(r,max))break;
      previousAccess++;
    }
    if(value.records.some((r,i)=>r && (r.revision??1)!==(levels[i]?.revision||1))){
      clean.importedUnlocked=Math.max(clean.importedUnlocked,previousAccess);
    }
    clean.unlocked=clean.importedUnlocked;
    // Доступ, перенесённый из v1, не является прохождением новых маршрутов.
    while(clean.unlocked<levels.length && clean.records[clean.unlocked-1])clean.unlocked++;
    return clean;
  }
  function migrateLegacy(value){
    if(!value || value.version!==1 || !Array.isArray(value.records) || value.records.length!==LEGACY_COIN_COUNTS.length ||
      !Number.isInteger(value.unlocked) || value.unlocked<1 || value.unlocked>10 ||
      !value.records.every((r,i)=>r===null || validRecord(r,LEGACY_COIN_COUNTS[i])))return null;
    const clean=blankProgress();let earned=1;
    while(earned<10 && value.records[earned-1])earned++;
    clean.unlocked=clean.importedUnlocked=Math.min(value.unlocked,earned);
    clean.migrationNoticePending=true;
    return clean;
  }
  function createProgressStore(storage){
    let progress=blankProgress(),persistent=true;
    function read(key){try{return JSON.parse(storage.getItem(key));}catch{persistent=false;return null;}}
    function save(){try{storage.setItem(STORAGE_KEY,JSON.stringify(progress));persistent=true;}catch{persistent=false;}}
    const saved=read(STORAGE_KEY);
    if(saved?.version===2 && Array.isArray(saved.records))progress=normalizeProgress(saved);
    else {
      const migrated=migrateLegacy(read(LEGACY_STORAGE_KEY));
      if(migrated){progress=migrated;save();}
    }
    return {
      get progress(){return progress;},get persistent(){return persistent;},
      resetAll(){progress=blankProgress();progress.migrationSuppressed=true;save();},
      acknowledgeMigration(){
        if(!progress.migrationNoticePending)return;
        progress.migrationNoticePending=false;save();
      },
      record(index,coins,time){
        if(!levels[index] || index>=progress.unlocked || !Number.isInteger(coins) || coins<0 || coins>levels[index].coins.length || !Number.isFinite(time) || time<=0)return false;
        const old=progress.records[index];
        progress.records[index]={revision:levels[index].revision||1,coins:Math.max(old?.coins||0,coins),time:Math.min(old?.time||Infinity,time),fullTime:coins===levels[index].coins.length?Math.min(old?.fullTime||Infinity,time):(old?.fullTime||null)};
        progress.unlocked=Math.min(levels.length,Math.max(progress.unlocked,index+2));
        save();return true;
      }
    };
  }
  const api={pressure,tutorialEnemy,enemyBody,chargerArea,rectVisible,readyResonator,railContact,updateTemporary,flags,gateOpen,updateLogic,resumeRun,warningVisible,validateView,levels,overlap,createGame,reset,step,moverPosition,readyPad,createProgressStore,normalizeProgress,STORAGE_KEY,LEGACY_STORAGE_KEY};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitEngine=api;
})(typeof window==='undefined'?globalThis:window);
