(function(root){
  'use strict';
  const E=typeof module==='object'&&module.exports?require('./engine.js'):root.OrbitEngine;
  const legacy8=typeof module==='object'&&module.exports?require('./legacy-chapter8.js'):root.OrbitLegacyChapter8;
  const RUN_KEY='orbit.expedition.runs.v1',DISCOVERY_KEY='orbit.expedition.discoveries.v1';
  const finite=(v,min=0,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
  const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const knownFacts=E.levels.flatMap(l=>Object.keys(l.story||{}).map(id=>`${l.id}:${id}`));
  function normalizeRun(level,raw){
    if(!object(raw)||raw.revision!==level.revision||!finite(raw.elapsed)||!Number.isInteger(raw.deaths)||!finite(raw.deaths))return null;
    const c=raw.checkpoint,flag=c&&E.flags(level).find(f=>f.id===c.id&&f.order===c.order);
    if(!flag||!finite(c.phaseTime)||c.phaseTime>raw.elapsed+1e-6||!Array.isArray(c.coinTakenIds)||!object(c.groups)||!object(c.routerBits)||!Array.isArray(c.enemyStates)||!object(c.learned))return null;
    const coinIds=level.coins.map((v,i)=>Array.isArray(v)?i:v.id??i);
    if(new Set(c.coinTakenIds).size!==c.coinTakenIds.length||c.coinTakenIds.some(id=>!coinIds.includes(id)))return null;
    const groupIds=new Set([...(level.switches||[]).map(s=>s.group),...(level.logic||[]).map(r=>r.group)]),groups={};
    for(const [id,on]of Object.entries(c.groups)){if(!groupIds.has(id)||typeof on!=='boolean')return null;if(on)groups[id]=true;}
    if(level.id===8&&groups.EAST&&!groups.WEST)return null;
    if(level.id===4&&level.revision===2&&groups.Q&&!groups.SOURCE)return null;
    if(level.id===8&&level.revision===2&&groups.SURVEY&&!groups['SURVEY-L']&&!groups['SURVEY-R'])return null;
    const routerBits={};
    if(Object.keys(c.routerBits).length!==(level.routers||[]).length)return null;
    for(const r of level.routers||[]){if(!Number.isInteger(c.routerBits[r.id])||c.routerBits[r.id]<0||c.routerBits[r.id]>=(r.stateCount||2))return null;routerBits[r.id]=c.routerBits[r.id];}
    // Вычисляемые лампы из сохранения недостоверны; восстановим их по текущим ручкам.
    for(const r of level.logic||[])if(!r.latch)delete groups[r.group];
    if(c.enemyStates.length!==level.enemies.length||new Set(c.enemyStates.map(e=>e?.id)).size!==level.enemies.length)return null;
    const enemies=[];
    for(const definition of level.enemies){
      const state=c.enemyStates.find(e=>e?.id===definition.id);
      if(!state||typeof state.dead!=='boolean'||typeof state.awake!=='boolean'||typeof state.firstWarnComplete!=='boolean'||!finite(state.deadTime)||!finite(state.cycle)||![-1,1].includes(state.facing)||!(definition.kind==='charger'?['idle','warn','dash','rest']:['sleep','warn','active','rest']).includes(state.state))return null;
      if(definition.kind==='pulsar'&&state.cycle>=definition.warn+definition.active+definition.rest)return null;
      const enemy={...definition,dead:state.dead,deadTime:state.deadTime,awake:state.awake,firstWarnComplete:state.firstWarnComplete,cycle:state.cycle,state:state.state,facing:state.facing};
      if(definition.kind==='walker')Object.assign(enemy,E.moverPosition({ax:definition.minX,ay:definition.floorY-26,bx:definition.maxX,by:definition.floorY-26,speed:definition.speed,dwell:definition.dwell},c.phaseTime));
      else if(definition.kind==='sentry')Object.assign(enemy,E.moverPosition({ax:definition.ax,ay:definition.flightY,bx:definition.bx,by:definition.flightY,speed:definition.speed,dwell:definition.dwell},c.phaseTime));
      else if(definition.kind==='charger'){
        if(!finite(state.x,definition.minX,definition.maxX)||!finite(state.stateTime,0,state.state==='idle'?0:definition[state.state])||typeof state.contactGrace!=='boolean'||![-1,1].includes(state.dashDirection))return null;
        Object.assign(enemy,{x:state.x,y:definition.floorY-definition.h,stateTime:state.stateTime,contactGrace:state.contactGrace,dashDirection:state.dashDirection});
        if(!enemy.firstWarnComplete){enemy.state='idle';enemy.stateTime=0;}else if(enemy.state==='warn')enemy.stateTime=0;
      }else{enemy.x=definition.x;enemy.y=definition.floorY;}
      enemy.w??=32;enemy.h??=26;
      enemies.push(enemy);
    }
    const learned={};for(const [id,v]of Object.entries(c.learned)){if(!['boost','trainer','transport','crumble','relay','router','walker','pulsar','charger','sentry','resonator','magboots'].includes(id)||typeof v!=='boolean')return null;learned[id]=v;}
    if(c.trainingDistance!==undefined&&!finite(c.trainingDistance))return null;
    return {revision:level.revision,elapsed:raw.elapsed,deaths:raw.deaths,checkpoint:{...flag,coins:coinIds.map(id=>c.coinTakenIds.includes(id)),groups,routerBits,phaseTime:c.phaseTime,enemies,learned,trainingDistance:c.trainingDistance||0}};
  }
  function serializeRun(g){
    const c=g.checkpoint;
    return {revision:g.level.revision,elapsed:g.elapsed,deaths:g.deaths,checkpoint:{id:c.id,order:c.order,phaseTime:c.phaseTime,coinTakenIds:g.coins.filter((coin,i)=>c.coins[i]).map(coin=>coin.id),groups:{...c.groups},routerBits:{...c.routerBits},enemyStates:c.enemies.map(e=>({id:e.id,dead:e.dead,deadTime:e.deadTime,awake:e.awake,firstWarnComplete:e.firstWarnComplete,cycle:e.cycle,state:e.state,facing:e.facing,...(e.kind==='charger'?{x:e.x,stateTime:e.stateTime,contactGrace:e.contactGrace,dashDirection:e.dashDirection}:{})})),learned:{...c.learned},trainingDistance:c.trainingDistance||0}};
  }
  function migrate8(level,saved){
    if(level.id!==8||level.revision!==2||saved.revision!==1)return null;
    // Сначала проверяем старую карту целиком, затем причинность флага и новую карту.
    const old=normalizeRun(legacy8,saved);if(!old)return null;
    const groups=old.checkpoint.groups;
    const required=['SURVEY-L','SURVEY-R',...(old.checkpoint.order>=2?['WEST','EAST','BYPASS']:[])];
    if(required.some(id=>!groups[id]))return null;
    const migrated=JSON.parse(JSON.stringify(saved));migrated.revision=2;migrated.checkpoint.groups.SURVEY=true;
    return normalizeRun(level,migrated)?migrated:null;
  }
  function createStore(storage){
    let persistent=true,activeLevelId=1,migratedAny=false;const runs={},facts=new Set(),updated=[];
    function read(key){let text;try{text=storage.getItem(key);}catch{persistent=false;return null;}try{return JSON.parse(text);}catch{return null;}}
    function write(key,value){try{storage.setItem(key,JSON.stringify(value));}catch{persistent=false;}}
    const raw=read(RUN_KEY);
    if(raw?.schema===1&&object(raw.runs)){
      if(E.levels.some(l=>l.id===raw.activeLevelId))activeLevelId=raw.activeLevelId;
      for(const level of E.levels){const saved=raw.runs[level.id];if(!saved)continue;
        const migrated=migrate8(level,saved),candidate=migrated||saved,clean=normalizeRun(level,candidate);if(clean){runs[level.id]=candidate;if(migrated)migratedAny=true;}else updated.push(level.id);
      }
    }
    const discoveries=read(DISCOVERY_KEY);if(discoveries?.schema===1&&Array.isArray(discoveries.ids))for(const id of discoveries.ids)if(knownFacts.includes(id))facts.add(id);
    const save=()=>write(RUN_KEY,{schema:1,activeLevelId,runs});
    if(updated.length||migratedAny)save();
    return {
      get persistent(){return persistent;},get activeLevelId(){return activeLevelId;},updated,
      get(id){const level=E.levels.find(l=>l.id===id);return level&&runs[id]?normalizeRun(level,runs[id]):null;},
      save(g){activeLevelId=g.level.id;if(g.checkpoint&&!g.won)runs[g.level.id]=serializeRun(g);else delete runs[g.level.id];save();},
      resetAll(){for(const id of Object.keys(runs))delete runs[id];facts.clear();activeLevelId=1;save();write(DISCOVERY_KEY,{schema:1,ids:[]});},
      clear(id){delete runs[id];save();},
      facts(id){return Object.fromEntries([...facts].filter(key=>key.startsWith(id+':')).map(key=>[key.slice(String(id).length+1),true]));},
      discover(levelId,id){const key=`${levelId}:${id}`;if(!knownFacts.includes(key)||facts.has(key))return false;facts.add(key);write(DISCOVERY_KEY,{schema:1,ids:[...facts]});return true;}
    };
  }
  const api={migrate8,createStore,normalizeRun,serializeRun,RUN_KEY,DISCOVERY_KEY};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitExpedition=api;
})(typeof window==='undefined'?globalThis:window);
