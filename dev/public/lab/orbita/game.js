(() => {
  'use strict';
  const E=window.OrbitEngine,C=window.OrbitCopy,A=window.OrbitAnimation, $=id=>document.getElementById(id);
  let storage;try{storage=window.localStorage;}catch{}
  const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('icon');svg.innerHTML=window.OrbitIcons?.[name]||'';return svg;};
  function buttonText(id,name,text){$(id).replaceChildren(icon(name),document.createTextNode(text));}
  for(const node of document.querySelectorAll('[data-icon]'))node.prepend(icon(node.dataset.icon));
  const metaStore=window.OrbitProgression.createStore(storage,E.levels);
  const store=E.createProgressStore(storage),expedition=window.OrbitExpedition.createStore(storage);
  const sound=window.OrbitAudio.createAudio({storage}),soundDialog=$('sound-settings');
  const menuOpen=()=>map.open||soundDialog.open;
  let game=E.createGame(expedition.get(expedition.activeLevelId)&&expedition.activeLevelId<=store.progress.unlocked?expedition.activeLevelId-1:0);
  game.meta=metaStore.value;game.facts=expedition.facts(game.level.id);const savedRun=expedition.get(game.level.id);if(savedRun)E.resumeRun(game,savedRun);
  let lastSavedTime=game.elapsed;
  function saveRun(){expedition.save(game);lastSavedTime=game.elapsed;updateRecords();}
  const canvas=$('game'),ctx=canvas.getContext('2d'),win=$('win'),notice=$('notice'),map=$('map');
  const worldArt=window.createOrbitWorldRenderer(ctx),expeditionArt=window.createOrbitExpeditionRenderer(ctx);window.orbitMechanismSprite=(...args)=>worldArt.sprite('mechanisms',...args);
  const keys=new Set(),touch=new Map();
  document.documentElement.classList.toggle('touch-device',navigator.maxTouchPoints>0);
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const biomes=['dawn','ruins','garden','dawn','ruins','garden','ruins','garden','dawn','ruins'];
  const art={},framesByName=new Map(A.frames.map(frame=>[frame.name,frame]));let playing=false,hasStarted=false;
  function loadArt(key,path){if(art[key])return;const img=new Image();img.onload=()=>{};img.onerror=()=>{};img.src=path;art[key]=img;}
  function loadLevelArt(){loadArt(biomes[game.level.theme],`assets/bg-${biomes[game.level.theme]}-v2.png`);loadArt('sprite','assets/astronaut-v2.png');for(const path of A.images)loadArt(path,path);for(const enemy of game.level.enemies){const names=enemy.kind==='walker'?['scarab-walk-a','scarab-walk-b','scarab-turn','scarab-hit','scarab-off']:['pulsar-sleep','pulsar-charge','pulsar-open','pulsar-active','pulsar-rest'];for(const name of names)loadArt(name,`assets/enemies-v3/${name}.svg`);}}
  function enterGame(){playing=true;hasStarted=true;$('home').hidden=true;$('play').hidden=false;clearInput();loadLevelArt();resize();canvas.focus({preventScroll:true});window.scrollTo(0,0);syncSound();sound.activate().then(updateSoundSettings);}
  function goHome(){saveRun();if(soundDialog.open)soundDialog.close();playing=false;syncSound();leaveFullscreen();clearInput();$('play').hidden=true;$('home').hidden=false;updateRecords();$('start').focus({preventScroll:true});window.scrollTo(0,0);}
  $('reset-campaign').addEventListener('click',()=>{if(!window.confirm('Сбросить главы, находки, записи и рекорды? Настройки звука останутся.'))return;metaStore.reset();expedition.resetAll();store.resetAll();game=E.createGame(0);game.meta=metaStore.value;game.facts={};prepareLevel();goHome();});
  $('start').addEventListener('click',enterGame);$('go-home').addEventListener('click',goHome);
  $('home-map').addEventListener('click',openMap);for(const card of document.querySelectorAll('[data-world]'))card.addEventListener('click',openMap);
  let coinFlash=null,particles=[],deathEcho=null,jumpAt=-Infinity,landAt=-Infinity,winAt=-Infinity,poseSince=0,poseState='idle',coinGhosts=[],relayAt={},flagAt=-Infinity;
  let jumpQueued=false,camera=0,accumulator=0,last=0,clock=0,noticeRemaining=7,noticeOverride=false,noticeText=notice.textContent,viewWidth=1200;
  const movement=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','Space']);
  const formatTime=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  function clearInput(){keys.clear();touch.clear();jumpQueued=false;accumulator=0;last=0;for(const b of document.querySelectorAll('[data-control]'))b.classList.remove('pressed');}
  function showNotice(text,override=false){noticeText=text;noticeRemaining=6;noticeOverride=override;}
  function renderNotice(){
    if(noticeRemaining<=0)noticeOverride=false;
    const tutorial=tutorialText(),scheme=window.OrbitPuzzleUI.scheme(game),danger=enemyHelp(),action=abilityHelp()||heldHelp();notice.dataset.scheme=scheme&&!danger&&!action?'true':'false';notice.textContent=danger||action||scheme?.compact||(tutorial&&!noticeOverride?tutorial:noticeText);
    notice.hidden=game.won||(!tutorial&&!scheme&&noticeRemaining<=0);
  }
  function heldHelp(){return [...game.resonantPlatforms,...game.routePlatforms].some(s=>s.state==='held'&&game.player.supportId===s.id)?'Опора держится под тобой. Исчезнет после схода':'';}
  function enemyHelp(){
    const enemy=E.tutorialEnemy(game,actualViewRect());if(!enemy)return '';
    if(enemy.kind==='charger')return window.OrbitPuzzleUI.chargerHelp(game,enemy);
    return {walker:C.help.walker,pulsar:C.help.pulsar,sentry:'Смотритель движется по тросу. Снизу безопасно; сверху можно отключить.'}[enemy.kind];
  }
  function abilityHelp(){return window.OrbitPuzzleUI.abilityHelp(game,!!navigator.maxTouchPoints);}
  function tutorialText(){
    const danger=enemyHelp();if(danger)return danger;
    if(abilityHelp())return abilityHelp();if(heldHelp())return heldHelp();
    const m=game.meta,p=game.player,copy=window.OrbitProgressionCopy;
    const locked=(game.level.switches||[]).concat(game.level.routers||[]).find(r=>Math.abs(r.x-p.x)<110&&!window.OrbitProgression.allowed(game,r));if(locked){if(locked.requiresKeys?.length)return 'Нужен сервисный допуск Ады из главы 4. Открой карту уровней';if(locked.requiresCircuits?.length)return 'Бак не заполнен. Проверь корни и вентиляцию';return 'Сначала: '+(locked.requires||[]).filter(id=>!game.groups[id]).map(id=>window.OrbitPuzzleUI.labels[id]||id).join(' + ');}
    if(p.x>game.level.beacon.x-200){const data=(game.level.beacon.requiresData||[]).find(id=>!m.dataIds.includes(id));if(data)return 'Найди запись «'+window.OrbitProgression.names[data]+'». К приёмнику можно вернуться';}
    const missing=missingFindings(game.level);if(missing&&p.x<450)return missing;
    if(game.level.id===4){if(p.x>2800&&p.x<4100&&!game.groups.ACCESS)return window.OrbitPlaytestSignals.copy[m.abilities.magboots?'bootsOwned':'bootsMissing'];if(p.x>4100&&p.x<5800&&!(game.groups.P&&game.groups.Q))return 'Источник питает дверь или рейки. Накопитель Q хранит заряд';if(p.x>6200&&p.x<7500)return game.groups.ISOLATED?'Вернись к приёмнику слева: там протокол и допуск Ады':'Переведи верхний контакт: изолируй повреждённую линию';}
    if(game.level.id===8){if(p.x>1400&&p.x<3100&&!(game.groups['SURVEY-L']&&game.groups['SURVEY-R']))return 'Проверь любую антенну. Вторая — дополнительные монеты';if(p.x>5060&&p.x<7100&&!game.groups.BYPASS)return !game.groups.WEST?'Сначала западная трасса. Восток проверяет её':!game.groups.EAST?'Запад прочитан. Переведи привод на восток':'Верни привод влево: выход питается от западного обхода';}
    if(game.level.id===1&&game.level.routers){
      const x=game.player.x;
      if(x<1400&&!game.learned.boost)return x<620?'Стрелки — движение. Прыжок — пробел или кнопка справа.':'На плите нажми прыжок — взлетишь выше';
      if(x>=1400&&x<2800&&!game.groups.DEMO)return 'Встань на переводник наверху. Проследи целую линию до двери';
      if(x>=4140&&x<5620&&!game.groups.GARDEN)return 'Проследи питание к саду. Повреждённые ветки не проводят ток';
      if(x>=5620&&x<7020&&!game.groups.ARCHIVE)return !m.abilities.resonator?'Найди катушку в теплице слева':'Прыжок с дуг создаст ступень к приёмнику на крыше';
      if(x>=8400&&!game.groups.UPLINK)return 'Разведи два источника: один питает сад, другой — связь';
    }

    if(E.flags(game.level).some(f=>f.order>(game.checkpoint?.order||0)&&Math.abs(game.player.x-f.x)<140))return C.help.flag;
    if(game.levelIndex===0&&!game.learned.boost)return 'На плите нажми прыжок — взлетишь выше';
    if(!game.level.sectors&&game.levelIndex===1&&!game.learned.transport)return game.learned.trainer?'Сойди влево на землю. Основной паром — у края справа.':'Прыгни на учебную опору и отпусти направление: она повезёт тебя';
    if(game.levelIndex===2&&!game.learned.crumble)return 'Мост трескается под ногами. Внизу можно продолжить путь';
    if(game.levelIndex===3&&!game.learned.relay)return 'Встань на реле наверху — заслонка с тем же знаком откроется';
    return '';
  }
  function missingEntries(level){const m=metaStore.value,ids=[...(level.abilityRequirements||[]).filter(id=>!m.abilities[id]),...(level.keyRequirements||[]).filter(id=>!m.keyIds.includes(id)),...(level.dataRequirements||[]).filter(id=>!m.dataIds.includes(id))];return ids.map(id=>({id,source:E.levels.findIndex(l=>(l.pickups||[]).some(p=>[p.ability,p.keyId,p.dataId].includes(id)))}));}
  function missingFindings(level){return missingEntries(level).map(({id,source})=>'Нужна находка «'+window.OrbitProgression.names[id]+'»: глава '+(source+1)).join(' · ');}
  $('migration-dismiss').addEventListener('click',()=>{store.acknowledgeMigration();updateRecords();$('start').focus({preventScroll:true});});
  function updateRecords(){
    $('imported-access').hidden=store.progress.importedUnlocked<=1;$('imported-access').textContent=`Доступ из прошлой версии: главы 1–${store.progress.importedUnlocked}. Новые находки открываются в игре.`;
    $('migration-note').hidden=!store.progress.migrationNoticePending;
    buttonText('start','play',expedition.get(game.level.id)?`Продолжить с флага · ${String(game.levelIndex+1).padStart(2,'0')}`:hasStarted||store.progress.unlocked>1?`Продолжить · ${String(game.levelIndex+1).padStart(2,'0')}`:C.home.start);
    const r=store.progress.records[game.levelIndex];
    $('best').textContent=r?`Лучший сбор: ${r.coins}/${game.coins.length} · лучшее время: ${r.time.toFixed(1)} с${r.fullTime?` · полный сбор: ${r.fullTime.toFixed(1)} с`:` · осталось: ${game.coins.length-r.coins}`}`:'Первый полёт — твой первый рекорд';
    $('storage-status').textContent=store.persistent&&expedition.persistent&&metaStore.persistent?'Прогресс сохраняется на этом устройстве':'Прогресс только до закрытия страницы';
    $('campaign-count').textContent=`${store.progress.records.filter(Boolean).length} ИЗ ${E.levels.length} МАЯКОВ`;
  }
  function prepareLevel(){
    clearInput();camera=0;coinFlash=null;particles=[];deathEcho=null;coinGhosts=[];relayAt={};jumpAt=landAt=winAt=flagAt=-Infinity;poseState='idle';poseSince=clock;$('death-portrait').hidden=true;notice.classList.remove('death-notice');if(win.open)win.close();
    $('level-name').textContent=game.level.name;$('level-number').textContent=`УРОВЕНЬ ${String(game.levelIndex+1).padStart(2,'0')} / ${E.levels.length}`;
    $('location').textContent=`СЕКТОР ${String(game.levelIndex+1).padStart(2,'0')} · ${game.level.name.toUpperCase()}`;
    $('total').textContent=` / ${game.coins.length}`;$('status').textContent='На пути к маяку';
    showNotice(expedition.updated.includes(game.level.id)?'Схема станции обновлена. Глава начнётся заново; находки сохранены':game.level.hint);expedition.updated.splice(expedition.updated.indexOf(game.level.id),expedition.updated.includes(game.level.id)?1:0);syncSound();if(playing)loadLevelArt();updateRecords();updateHud();if(playing)canvas.focus({preventScroll:true});
  }
  function startLevel(index){if(index>=store.progress.unlocked)return;saveRun();game=E.createGame(index);game.meta=metaStore.value;game.facts=expedition.facts(game.level.id);const run=expedition.get(game.level.id);if(run)E.resumeRun(game,run);lastSavedTime=game.elapsed;if(map.open)map.close();prepareLevel();enterGame();}
  function restart(){if(soundDialog.open)soundDialog.close();if(map.open)map.close();expedition.clear(game.level.id);E.reset(game);lastSavedTime=0;prepareLevel();}
  function openMap(){
    saveRun();clearInput();if(win.open)win.close();const grid=$('level-grid');grid.replaceChildren();
    E.levels.forEach((level,index)=>{
      const button=document.createElement('button'),r=store.progress.records[index],locked=index>=store.progress.unlocked;
      button.disabled=locked;button.className='level-card'+(index===game.levelIndex?' current':'')+(r?' completed':'');
      button.setAttribute('aria-label',`${index+1}. ${level.name}. ${locked?'Закрыт':r?'Пройден':'Открыт'}`);
      const number=document.createElement('span');number.className='world-number';number.textContent=String(index+1).padStart(2,'0');button.style.backgroundImage=`url('assets/bg-${biomes[level.theme]}-v2.png')`;
      const name=document.createElement('strong');name.textContent=level.name;
      const result=document.createElement('small');result.textContent=locked?`Пройди уровень ${String(index).padStart(2,'0')}`:r?`Пройден${r.coins===level.coins.length?' · Все монеты':''}\nЛучший сбор: ${r.coins}/${level.coins.length}\nЛучшее время: ${r.time.toFixed(1)} с${r.fullTime?'\nПолный сбор: '+r.fullTime.toFixed(1)+' с':'\nОсталось монет: '+(level.coins.length-r.coins)}`:C.map.open;
      if(!locked&&missingFindings(level))result.textContent+='\n'+missingFindings(level);
      if(!locked&&!r&&index<store.progress.importedUnlocked)result.textContent='Доступ из прошлой версии · '+result.textContent;
      if(expedition.get(level.id))result.textContent='Продолжить с флага · '+result.textContent;
      if(index===game.levelIndex)result.textContent='Ты здесь · '+result.textContent;
      button.append(number,name,result);if(locked)button.prepend(icon('lock'));else if(r)button.prepend(icon('check'));button.addEventListener('click',()=>startLevel(index));grid.append(button);if(!locked&&missingFindings(level)){const source=document.createElement('button'),chapter=missingEntries(level)[0].source;source.textContent='К находке · глава '+(chapter+1);source.className='level-source';source.addEventListener('click',()=>startLevel(chapter));grid.append(source);}
    });
    $('map-summary').textContent=`Найдено маяков: ${store.progress.records.filter(Boolean).length}/${E.levels.length}. Полные коллекции: ${store.progress.records.filter((r,i)=>r?.coins===E.levels[i].coins.length).length}/${E.levels.length}.`;
    $('map-storage').textContent=$('storage-status').textContent;
    map.showModal();syncSound();$('map-close').focus();
  }
  $('map-open').addEventListener('click',openMap);$('win-map').addEventListener('click',openMap);
  $('map-close').addEventListener('click',()=>map.close());
  map.addEventListener('close',()=>{syncSound();if(game.won&&!win.open)win.showModal();(game.won?$('again'):playing?canvas:$('home-map')).focus({preventScroll:true});});
  win.addEventListener('cancel',e=>e.preventDefault());
  $('restart').addEventListener('click',restart);$('again').addEventListener('click',restart);
  $('next').addEventListener('click',()=>startLevel(game.levelIndex+1));
  window.addEventListener('keydown',e=>{
    if(menuOpen()||!playing)return;
    if(game.won){if(e.code==='KeyR'&&!e.repeat)restart();return;}
    if(e.code==='Space' && e.target.tagName==='BUTTON')return;
    if(movement.has(e.code)){e.preventDefault();keys.add(e.code);}
    if(!e.repeat && ['Space','KeyW','ArrowUp'].includes(e.code) && !game.won)jumpQueued=true;
    if(e.code==='KeyR' && !e.repeat)restart();
  });
  window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='Space'&&e.target.tagName==='BUTTON')return;if(movement.has(e.code)&&!map.open)e.preventDefault();});
  window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',clearInput);
  for(const button of document.querySelectorAll('[data-control]')){
    button.addEventListener('pointerdown',e=>{e.preventDefault();if(menuOpen()||game.won||!playing)return;button.setPointerCapture(e.pointerId);touch.set(e.pointerId,button.dataset.control);button.classList.add('pressed');if(button.dataset.control==='jump')jumpQueued=true;});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>{touch.delete(e.pointerId);if(![...touch.values()].includes(button.dataset.control))button.classList.remove('pressed');});
  }
  function updateHud(){
    if(game.level.sectors){const sector=game.level.sectors.find(s=>game.player.x>=s.x0&&game.player.x<s.x1);$('location').textContent=`ГЛАВА ${String(game.level.id).padStart(2,'0')} · СЕКТОР ${String(sector?.id||1).replace(/^s/,'')} / ${game.level.sectors.length}`;}
    $('score').textContent=game.score;$('attempt').textContent=game.deaths;$('timer').textContent=formatTime(game.elapsed);$('timer').setAttribute('aria-label',`Время с начала уровня: ${formatTime(game.elapsed)}`);$('score').parentElement.setAttribute('aria-label',`Монеты: ${game.score} из ${game.coins.length}`);
    const percent=game.won?100:Math.max(0,Math.min(99,Math.round((game.player.x-game.level.spawn.x)/(game.level.beacon.x-game.level.spawn.x)*100)));
    $('progress').style.width=percent+'%';$('distance').textContent=percent+'%';
  }
  function round(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  const relayLabels={SERVICE:'ДОСТУП',ARCHIVE:'АРХИВ',DEMO:'ПУТЬ',ACCESS:'ВХОД','SURVEY-L':'ЗАПАД','SURVEY-R':'ВОСТОК',WEST:'ЗАПАД',EAST:'ВОСТОК','SERVICE-EXIT':'ДОПУСК АДЫ'};
  function drawPlatform(s,kind){
    if(s.x+s.w<camera||s.x>camera+viewWidth)return;
    if(worldArt.platform(s,kind))return;
    const metal=kind==='ruins',one=s.oneWay;
    round(s.x,s.y,s.w,s.h,2,metal?'#152b3b':kind==='garden'?'#29293f':'#23394a');
    ctx.fillStyle=metal?'#35556b':kind==='garden'?'#474354':'#3c5363';
    ctx.beginPath();ctx.moveTo(s.x+4,s.y+9);ctx.lineTo(s.x+s.w-4,s.y+9);ctx.lineTo(s.x+s.w-16,s.y+s.h);ctx.lineTo(s.x+17,s.y+s.h);ctx.fill();
    ctx.fillStyle='#e9dbb8';ctx.fillRect(s.x,s.y,s.w,5);ctx.fillStyle='#a38154';ctx.fillRect(s.x,s.y+5,s.w,3);
    ctx.strokeStyle=one?'#b5c1cb':'#172c3c';ctx.lineWidth=2;
    for(let x=s.x+15;x<s.x+s.w-10;x+=metal?42:64){
      if(one){ctx.beginPath();ctx.moveTo(x,s.y+10);ctx.lineTo(x+9,s.y+s.h-2);ctx.stroke();}
      else if(metal){ctx.fillStyle='#0e2535';ctx.fillRect(x,s.y+25,24,5);ctx.fillStyle='#9aa9ad';ctx.fillRect(x+8,s.y+13,3,3);}
      else{ctx.beginPath();ctx.moveTo(x,s.y+14);ctx.lineTo(x+17,s.y+35);ctx.lineTo(x+8,s.y+65);ctx.stroke();}
    }
  }
  function clipFrame(state,seconds){
    const clip=A.clips[state];if(reducedMotion.matches&&state==='idle')return 'idle';
    if(reducedMotion.matches&&['land','death','win'].includes(state))return clip.frames[0];
    let ms=Math.max(0,seconds*1000),total=clip.ms.reduce((sum,n)=>sum+n,0);if(clip.loop)ms%=total;
    for(let i=0;i<clip.frames.length;i++){if(ms<clip.ms[i])return clip.frames[i];ms-=clip.ms[i];}return clip.frames[clip.frames.length-1];
  }
  function drawPose(context,name,x,y,height,facing){
    const frame=framesByName.get(name),picture=frame&&art[frame.image||A.image];
    if(picture?.complete&&picture.naturalWidth){const scale=height/(frame.normalHeight||A.normalHeight),[sx,sy,sw,sh]=frame.sourceRect;context.save();context.translate(x,y);context.scale(facing,1);context.drawImage(picture,sx,sy,sw,sh,-frame.anchor[0]*scale,-frame.anchor[1]*scale,sw*scale,sh*scale);context.restore();}
    else if(art.sprite?.complete&&art.sprite.naturalWidth){context.save();context.translate(x,y);context.scale(facing,1);context.drawImage(art.sprite,338,67,610,1129,-height*610/2258,-height,height*610/1129,height);context.restore();}
    else{context.fillStyle='#f6e7c8';context.fillRect(x-12,y-height,24,height);context.fillStyle='#1b3545';context.fillRect(x-5,y-height+5,16,13);}
  }
  function draw(){
    ctx.clearRect(0,0,viewWidth,580);ctx.fillStyle='#152a3b';ctx.fillRect(0,0,viewWidth,580);
    const kind=biomes[game.level.theme],bg=art[kind];
    if(bg?.complete&&bg.naturalWidth){
      const scale=Math.max(viewWidth/bg.width,580/bg.height)*1.04,w=bg.width*scale,h=bg.height*scale;
      const travel=reducedMotion.matches?.5:Math.min(1,camera/Math.max(1,game.level.width-viewWidth));
      ctx.drawImage(bg,-(w-viewWidth)*(.35+.3*travel),0,w,h);
    }
    const veil=ctx.createLinearGradient(0,160,0,580);veil.addColorStop(0,'#0b172300');veil.addColorStop(1,'#0b17236a');ctx.fillStyle=veil;ctx.fillRect(0,0,viewWidth,580);
    ctx.save();ctx.translate(-camera,0);
    for(const s of game.level.platforms)drawPlatform(s,kind);
    // Концы маршрута и опора используют те же координаты, что физика.
    for(const m of game.movers){
      ctx.strokeStyle='#d0e1e990';ctx.lineWidth=2;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(m.ax+m.w/2,m.ay+12);ctx.lineTo(m.bx+m.w/2,m.by+12);ctx.stroke();ctx.setLineDash([]);
      for(const [x,y] of [[m.ax,m.ay],[m.bx,m.by]]){ctx.strokeStyle='#d0e1e9';ctx.strokeRect(x+70,y+7,10,10);}
      if(!worldArt.sprite('mechanisms',m.direction<0?'transport-left':m.direction>0?'transport-right':'transport-stop',m.x,m.y,m.w,32))drawPlatform(m,'ruins');ctx.fillStyle='#d8f2ed';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText(m.direction<0?'«':m.direction>0?'»':'◇',m.x+m.w/2,m.y+18);ctx.textAlign='left';
    }
    for(const pad of game.level.pads||[]){
      const ready=E.readyPad(game)===pad;if(worldArt.pad(pad,ready))continue;round(pad.x,pad.y-8,pad.w,8,2,ready?'#fff8dc':'#ffc568');if(ready){ctx.fillStyle='#ffffff';ctx.fillRect(pad.x,pad.y-10,pad.w,3);}ctx.strokeStyle='#1e2e3c';ctx.lineWidth=2;
      for(let x=pad.x+10;x<pad.x+pad.w;x+=14){ctx.beginPath();ctx.moveTo(x,pad.y-1);ctx.lineTo(x+5,pad.y-7);ctx.stroke();}
      ctx.strokeStyle=ready?'#ffffff':'#ffc568';ctx.lineWidth=3;for(const y of [pad.y-19,pad.y-29]){ctx.beginPath();ctx.moveTo(pad.x+pad.w/2-8,y+6);ctx.lineTo(pad.x+pad.w/2,y);ctx.lineTo(pad.x+pad.w/2+8,y+6);ctx.stroke();}
    }
    for(const k of game.crumbles){
      if(k.state==='gone'){ctx.strokeStyle='#e6c8aa55';ctx.setLineDash([3,7]);ctx.strokeRect(k.x,k.y,k.w,k.h);ctx.setLineDash([]);continue;}
      if(!worldArt.platform(k,kind,k.state))drawPlatform(k,kind);ctx.strokeStyle='#ffc568';ctx.lineWidth=2;
      const gap=k.state==='cracking'?(1-k.remaining)*10:0;
      ctx.beginPath();ctx.moveTo(k.x+k.w*.45-gap,k.y+3);ctx.lineTo(k.x+k.w*.55,k.y+10);ctx.lineTo(k.x+k.w*.4-gap,k.y+20);ctx.stroke();
      if(k.state==='cracking'){ctx.fillStyle='#f69b6a';ctx.fillRect(k.x,k.y-5,k.w*Math.max(0,k.remaining),3);}
    }
    for(const relay of game.level.switches.filter((r,i,list)=>list.findIndex(other=>other.x===r.x&&other.y===r.y)===i)){
      const open=game.groups[relay.group]||(game.level.id===9&&game.groups['READ-B']),gate=game.level.gates.find(gate=>(gate.requires||[gate.group]).includes(relay.group));
      if(game.level.id===6&&relay.id==='fault-right'){worldArt.eastContact(open,canvas.clientWidth/viewWidth,game.level.gates.find(g=>g.id==='fault-door'));continue;}
      ctx.strokeStyle=open?'#9df3c190':'#8ccbd466';ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(relay.x+25,relay.y-10);ctx.lineTo((gate?.x??relay.x+70)+12,relay.y-10);ctx.lineTo((gate?.x??relay.x+70)+12,gate?.h??relay.y);ctx.stroke();ctx.setLineDash([]);
      if(!worldArt.sprite('mechanisms',open?'relay-active':'relay-idle',relay.x,relay.y-50,50,50))round(relay.x,relay.y-8,50,8,2,open?'#9df3c1':'#8ccbd4');ctx.font='bold 16px monospace';ctx.fillStyle=open?'#9df3c1':'#c0edf2';ctx.textAlign='center';ctx.fillText(open?'✓':relayLabels[relay.group]||relay.group,relay.x+25,relay.y-16);ctx.textAlign='left';
    }
    for(const gate of game.level.gates){
      if(E.gateOpen(game,gate)){const age=clock-Math.max(...(gate.requires||[gate.group]).map(id=>relayAt[id]??-Infinity));if(age<.25){ctx.strokeStyle='#bcfff0';ctx.globalAlpha=reducedMotion.matches?1:1-age/.25;ctx.strokeRect(gate.x,gate.y,gate.w,gate.h);ctx.globalAlpha=1;}continue;}if(worldArt.gate(gate))continue;round(gate.x,gate.y,gate.w,gate.h,3,'#244758');ctx.fillStyle='#8ccbd4';ctx.fillRect(gate.x+6,0,3,gate.h);ctx.fillRect(gate.x+15,0,3,gate.h);ctx.font='bold 17px monospace';ctx.fillStyle='#f6e7c8';ctx.fillText((gate.requires||[gate.group]).map(id=>relayLabels[id]||id).join(' + '),gate.x+6,gate.h-55);
    }
    for(const flag of E.flags(game.level)){
      const active=(game.checkpoint?.order||0)>=flag.order;
      if(!worldArt.sprite('mechanisms',active?'flag-active':'flag-idle',flag.x-22,flag.y-64,44,64)){ctx.fillStyle=active?'#9df3c1':'#a3b8bb';ctx.fillRect(flag.x,flag.y-60,3,60);ctx.fillRect(flag.x,flag.y-60,26,16);}
      ctx.font='11px Arial';ctx.fillStyle='#ecffe3';ctx.fillText('ТОЧКА ВОЗВРАТА',flag.x-44,flag.y-76);
    }
    if(game.level.id===1)window.drawOrbitChapter(ctx,game,worldArt);
    expeditionArt.world(game,clock,reducedMotion.matches,canvas.clientWidth/viewWidth);
    for(const enemy of game.enemies){
      if(enemy.kind==='charger'||enemy.kind==='sentry'){expeditionArt.enemy(game,enemy,clock,reducedMotion.matches);continue;}
      if(enemy.kind==='walker'){
        if(worldArt.enemy(enemy,clock,reducedMotion.matches))continue;
        const sprite=art[enemy.dead?(enemy.deadTime<.12?'scarab-hit':'scarab-off'):enemy.direction===0?'scarab-turn':reducedMotion.matches||Math.floor(clock/.09)%2===0?'scarab-walk-a':'scarab-walk-b'];
        if(sprite?.complete&&sprite.naturalWidth){if(!enemy.dead||enemy.deadTime<.37){ctx.save();ctx.globalAlpha=enemy.dead?Math.max(0,1-enemy.deadTime/.37):1;ctx.translate(enemy.x+16,enemy.floorY);ctx.scale(enemy.facing,1);ctx.drawImage(sprite,-16,-26,32,26);ctx.restore();}continue;}
        if(enemy.dead&&enemy.deadTime>.37)continue;
        ctx.save();ctx.globalAlpha=enemy.dead?Math.max(0,1-enemy.deadTime/.37):1;
        const h=enemy.dead?Math.max(4,26*(1-enemy.deadTime/.12)):26;
        const stride=reducedMotion.matches||enemy.dead?0:Math.sin(clock*18)*4;
        ctx.strokeStyle='#ffd6b4';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(enemy.x+7+i*9,enemy.floorY-9);ctx.lineTo(enemy.x+4+i*9+(i%2?stride:-stride),enemy.floorY);ctx.stroke();}
        round(enemy.x,enemy.floorY-h,32,h-4,9,'#d37465');round(enemy.x+4,enemy.floorY-h+3,24,8,4,'#3a333e');ctx.fillStyle=enemy.dead?'#7b6664':'#fff1b9';ctx.beginPath();ctx.arc(enemy.x+(enemy.facing>0?26:6),enemy.floorY-h+10,3,0,Math.PI*2);ctx.fill();ctx.restore();
      }else{
        const cx=enemy.x+enemy.w/2,cy=enemy.floorY-190,warn=enemy.state==='warn',active=enemy.state==='active';
        const drawn=worldArt.enemy(enemy,clock,reducedMotion.matches);
        if(!drawn){ctx.fillStyle='#657c8a';ctx.fillRect(cx-24,cy-24,48,48);}
        if(!drawn){ctx.strokeStyle=active?'#ffd9c1':warn?'#ffb86b':'#657c8a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,18,13,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle=active?'#ff725d':warn?'#ffd08a':'#9bb0be';ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fill();}
        if(warn){ctx.strokeStyle='#ffc568';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,23,-Math.PI/2,-Math.PI/2+Math.PI*2*enemy.cycle/enemy.warn);ctx.stroke();}
        if(warn||active){ctx.strokeStyle=active?'#ff725d55':'#ffc56844';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(cx,cy+16);ctx.lineTo(enemy.x,enemy.floorY-22);ctx.moveTo(cx,cy+16);ctx.lineTo(enemy.x+enemy.w,enemy.floorY-22);ctx.stroke();ctx.setLineDash([]);}
        if(warn||active){ctx.strokeStyle=warn?'#ffc568':'#ffe0b6';ctx.strokeRect(enemy.x,enemy.floorY-22,enemy.w,22);}
        if(warn||active)worldArt.sprite('mechanisms',active?'pulse-active':'pulse-warn',enemy.x,enemy.floorY-22,enemy.w,22);
        if(active&&!worldArt.available('mechanisms')){ctx.fillStyle='#ff725d';ctx.fillRect(enemy.x,enemy.floorY-18,enemy.w,18);for(let x=enemy.x;x<enemy.x+enemy.w;x+=12){ctx.beginPath();ctx.moveTo(x,enemy.floorY-18);ctx.lineTo(x+6,enemy.floorY-22);ctx.lineTo(x+12,enemy.floorY-18);ctx.fill();}}
      }
    }
    for(const hazard of game.level.hazards){
      ctx.fillStyle='#132231';ctx.fillRect(hazard.x,hazard.y+hazard.h-5,hazard.w,5);
      if(worldArt.sprite('mechanisms','crystal',hazard.x,hazard.y,hazard.w,hazard.h))continue;
      for(let x=hazard.x;x<hazard.x+hazard.w;x+=17){ctx.fillStyle='#ff6e76';ctx.beginPath();ctx.moveTo(x,hazard.y+hazard.h);ctx.lineTo(x+8,hazard.y);ctx.lineTo(Math.min(x+17,hazard.x+hazard.w),hazard.y+hazard.h);ctx.fill();ctx.strokeStyle='#ffd1bc';ctx.lineWidth=1.5;ctx.stroke();}
    }
    for(const coin of game.coins){if(coin.taken)continue;const y=coin.y+(reducedMotion.matches?0:Math.sin(clock*3+coin.x*.1)*2);
      if(worldArt.sprite('mechanisms','coin',coin.x-10,y-12,20,24))continue;
      ctx.fillStyle='#ffd078';ctx.beginPath();ctx.ellipse(coin.x,y,10,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#7f4c2f';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(coin.x,y,5,8,0,0,Math.PI*2);ctx.stroke();
    }
    const b=game.level.beacon;if(!worldArt.sprite('mechanisms','beacon',b.x-15,b.y-90,58,90)){round(b.x-10,b.y-70,35,70,4,'#173b42');round(b.x+2,b.y-63,11,60,2,'#9df3c1');}
    ctx.strokeStyle='#9df3c1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x+8,b.y-91,16+(game.won&&!reducedMotion.matches?Math.min(1,(clock-winAt)/.24)*8:0),0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ecffe3';ctx.beginPath();ctx.arc(b.x+8,b.y-91,4,0,Math.PI*2);ctx.fill();
    ctx.font='12px monospace';ctx.textAlign='center';ctx.fillStyle='#c9ffe0';ctx.fillText('МАЯК',b.x+8,b.y-121);ctx.textAlign='left';
    const p=game.player;
    let state=game.won?'win':clock-jumpAt<.07?'takeoff':!p.grounded?(p.vy< -80?'rise':p.vy>80?'fall':'apex'):p.moving?'run':clock-landAt<.14?'land':'idle';
    if(state!==poseState){poseState=state;poseSince=clock;}
    const age=state==='win'?clock-winAt:state==='takeoff'?clock-jumpAt:state==='land'?clock-landAt:clock-poseSince;
    const pose=clipFrame(state,age);canvas.dataset.pose=pose;
    drawPose(ctx,pose,p.x+p.w/2,p.y+p.h,p.h,p.facing);
    if(game.won){const portrait=$('win-portrait'),pc=portrait.getContext('2d');pc.clearRect(0,0,180,180);drawPose(pc,pose,90,168,145,1);}
    coinGhosts=coinGhosts.filter(coin=>clock-coin.at<.16);
    if(!reducedMotion.matches)for(const coin of coinGhosts){const age=(clock-coin.at)/.16;ctx.fillStyle='#ffe5a6';ctx.beginPath();ctx.ellipse(coin.x,coin.y-age*8,Math.max(.1,10*(1-age)),12,0,0,Math.PI*2);ctx.fill();}
    if(coinFlash&&clock-coinFlash.at<.25&&!reducedMotion.matches){ctx.fillStyle='#ffe8b8';ctx.font='bold 20px Arial';ctx.fillText(coinFlash.text||'+1',coinFlash.x,coinFlash.y-(clock-coinFlash.at)*55);}
    particles=particles.filter(particle=>clock-particle.at<.4);
    if(!reducedMotion.matches)for(const particle of particles){const age=clock-particle.at;ctx.globalAlpha=1-age/.4;ctx.fillStyle='#ffe4a3';ctx.fillRect(particle.x+Math.cos(particle.angle)*age*70,particle.y+Math.sin(particle.angle)*age*70,3,3);}ctx.globalAlpha=1;
    const deathPortrait=$('death-portrait');deathPortrait.hidden=true;notice.classList.remove('death-notice');canvas.dataset.deathPose='';
    if(deathEcho&&clock-deathEcho.at<.26){
      const age=clock-deathEcho.at,pose=clipFrame('death',age),visible=deathEcho.x>=camera&&deathEcho.x<camera+viewWidth;
      canvas.dataset.deathPose=pose;
      if(visible){ctx.globalAlpha=reducedMotion.matches?1:1-age/.26;drawPose(ctx,pose,deathEcho.x+15,deathEcho.y+42,42,deathEcho.facing);ctx.globalAlpha=1;}
      else{deathPortrait.hidden=false;notice.classList.add('death-notice');deathPortrait.style.top=notice.offsetTop+(notice.offsetHeight-28)/2+'px';const pc=deathPortrait.getContext('2d');pc.clearRect(0,0,96,96);drawPose(pc,pose,48,90,80,deathEcho.facing);}
    }
    ctx.restore();
  }
  function finish(){
    winAt=clock;const previous=store.progress.records[game.levelIndex];
    store.record(game.levelIndex,game.score,game.elapsed);updateRecords();
    const final=game.levelIndex===E.levels.length-1,complete=store.progress.records.every(Boolean);
    win.showModal();$('next').hidden=final;
    $('win-map').classList.toggle('primary',final);buttonText('again','restart',final?C.final.again:C.win.again);
    $('win-label').textContent=final&&complete?'ДЕСЯТЫЙ МАЯК':`ГЛАВА ${String(game.level.id).padStart(2,'0')} ЗАВЕРШЕНА`;
    $('win-title').textContent=final?'Мы дома':C.win.title;
    $('win-text').textContent=(final?'Ада: «Рин? Слышу тебя. Мы дома». Обход вернул связь и сохранил защиту кольца. ':'')+`Уровень ${game.levelIndex+1} / ${E.levels.length} · Монеты: ${game.score} из ${game.coins.length} · время: ${game.elapsed.toFixed(1)} с · падения: ${game.deaths}`;
    $('win-record').textContent=game.score===game.coins.length?C.win.full:`Осталось монет: ${game.coins.length-game.score}. Можно вернуться за ними.`;
    if(game.deaths===0)$('win-record').textContent+=' '+C.win.noDeaths+'.';
    if(previous && game.elapsed<previous.time)$('win-record').textContent+=' Новый рекорд времени!';
    if(final)$('win-record').textContent+=` Найдено маяков: ${store.progress.records.filter(Boolean).length}/10. Лучший сбор кампании: ${store.progress.records.reduce((sum,r)=>sum+(r?.coins||0),0)}/${E.levels.reduce((sum,level)=>sum+level.coins.length,0)}.`;
    else $('win-record').textContent+=` Открыт уровень ${game.levelIndex+2}.`;
    const record=store.progress.records[game.levelIndex];
    $('win-record').textContent+=` Лучшее время: ${record.time.toFixed(1)} с.${record.fullTime?' Полный сбор: '+record.fullTime.toFixed(1)+' с.':''}`;
    $('status').textContent=final&&complete?'Экспедиция завершена':'Маяк найден';
    clearInput();(final?$('win-map'):$('next')).focus({preventScroll:true});
  }
  function frame(now){
    if(!last)last=now;
    const delta=Math.min((now-last)/1000,.05);last=now;if(playing&&!menuOpen()&&!document.hidden)clock+=delta;
    if(playing&&!menuOpen()&&!document.hidden){accumulator+=delta;if(!game.won&&(!tutorialText()||noticeOverride))noticeRemaining-=delta;}
    renderNotice();
    if(playing&&!menuOpen()&&!document.hidden)camera+=(cameraTarget()-camera)*(1-Math.exp(-9*delta));
    const viewRect=actualViewRect();E.validateView(game,viewRect);
    while(accumulator>=1/120 && !game.won && !menuOpen() && playing && !document.hidden){
      const controls=[...touch.values()],wasGrounded=game.player.grounded,previousVy=game.player.vy,previousCoins=game.coins.map(c=>c.taken),previousGroups={...game.groups};
      E.step(game,{left:keys.has('ArrowLeft')||keys.has('KeyA')||controls.includes('left'),right:keys.has('ArrowRight')||keys.has('KeyD')||controls.includes('right'),jump:jumpQueued},1/120,viewRect);jumpQueued=false;accumulator-=1/120;
      if(game.metaChanged){metaStore.save();updateRecords();}
      for(const id of game.pickupEvents){expeditionArt.noteFind(id,clock);const pickup=game.level.pickups.find(p=>p.id===id),name=window.OrbitProgression.names[pickup.ability||pickup.dataId||pickup.keyId||pickup.traceId];showNotice(pickup.ability?window.OrbitProgressionCopy[pickup.ability].foundTitle+'. '+(pickup.ability==='magboots'?window.OrbitPlaytestSignals.copy.bootsFound:window.OrbitProgressionCopy[pickup.ability].foundBody):'Найдено: '+name+'. Запись добавлена в журнал.',true);}
      for(const event of game.events)sound.playEffect(event);
      if(game.events.includes('jump')||game.events.includes('boost')||game.events.includes('enemy-stomp'))jumpAt=clock;
      if(!wasGrounded&&game.player.grounded)landAt=clock;
      game.coins.forEach((coin,i)=>{if(coin.taken&&!previousCoins[i])coinGhosts.push({x:coin.x,y:coin.y,at:clock});});
      if(!wasGrounded&&game.player.grounded&&previousVy>150&&!game.event)sound.playEffect('land');
      if(game.event==='fall'){saveRun();deathEcho={...game.death,at:clock};clearInput();camera=cameraTarget();coinFlash=null;particles=[];coinGhosts=[];jumpAt=landAt=-Infinity;poseState='idle';poseSince=clock;for(const group of Object.keys(relayAt))if(!game.groups[group])delete relayAt[group];showNotice(game.checkpoint?C.events.deathFlag:C.events.deathStart,true);noticeRemaining=4;break;}
      if(game.events.includes('boost'))coinFlash={x:game.player.x,y:game.player.y-10,at:clock,text:'↑↑'};
      if(game.events.includes('coin')){coinFlash={x:game.player.x,y:game.player.y-10,at:clock};for(let i=0;i<6;i++)particles.push({x:game.player.x+15,y:game.player.y,angle:i*Math.PI/3,at:clock});}
      if(game.events.includes('checkpoint')){flagAt=clock;saveRun();}
      if(game.events.includes('relay'))for(const group of Object.keys(game.groups))if(game.groups[group]&&!previousGroups[group])relayAt[group]=clock;
      if(game.events.includes('checkpoint'))showNotice('Точка возврата сохранена. Время продолжает идти.',true);
      if(game.events.includes('duplicate-relay'))showNotice(game.groups.Q?'Та же линия P. Оба источника готовы':'Та же линия P. Для двери нужен ещё Q',true);
      if(game.events.includes('router')){noticeRemaining=0;noticeOverride=false;}
      if(game.events.includes('relay')){const active=Object.keys(game.groups).filter(id=>game.groups[id]&&relayAt[id]===clock).map(id=>window.OrbitPuzzleUI.labels[id]||id);if(active.length)showNotice(active.join(' · ')+': включено',false);}
      for(const id of game.storyEvents){expedition.discover(game.level.id,id);updateRecords();showNotice(id==='start'?game.level.story[id].text:game.level.story[id].title+'. Запись в журнале.',false);}
      if(game.event==='win'){expedition.clear(game.level.id);finish();break;}
    }
    if(game.won)accumulator=0;else if(game.checkpoint&&game.elapsed-lastSavedTime>=5)saveRun();
    renderNotice();updateHud();if(playing)draw();requestAnimationFrame(frame);
  }
  function cameraTarget(){return Math.max(0,Math.min(Math.max(0,game.level.width-viewWidth),game.player.x+game.player.w/2-viewWidth/2));}
  function actualViewRect(){
    const rect=canvas.getBoundingClientRect(),hint=notice.getBoundingClientRect();
    // В landscape подсказка лежит поверх неба: закрытая часть не считается видимой.
    const top=!notice.hidden&&hint.top<rect.bottom&&hint.bottom>rect.top?Math.max(0,(hint.bottom-rect.top)/rect.height*580):0;
    return {x:camera,y:top,w:viewWidth,h:580-top};
  }
  function resize(){
    if(!playing)return;
    const shell=document.querySelector('.game-shell'),viewport=document.querySelector('.viewport');
    const width=shell.getBoundingClientRect().width-2;
    const low=window.innerHeight<=500&&window.innerWidth>window.innerHeight;
    const reserved=[document.querySelector('.toolbar'),notice,document.querySelector('.game-bottom'),document.querySelector('.touch-controls'),document.querySelector('.record-line'),document.querySelector('.shortcuts')].reduce((sum,node)=>sum+(getComputedStyle(node).position==='absolute'?0:node.getBoundingClientRect().height),0)+(low?22:48);
    const maxHeight=Math.max(low?80:290,window.innerHeight-reserved);
    const expanded=document.documentElement.classList.contains('full-window');
    const scale=expanded?Math.max(low?.2:.5,Math.min(maxHeight/580,width/460)):low?Math.max(.2,Math.min(width/1200,maxHeight/580)):Math.max(.5,Math.min(width/1200,maxHeight/580));
    viewWidth=Math.min(expanded?game.level.width:1200,width/scale);
    const pixelWidth=viewWidth*scale,height=580*scale,dpr=window.devicePixelRatio||1;
    viewport.style.width=pixelWidth+'px';canvas.style.height=height+'px';canvas.width=Math.round(pixelWidth*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(canvas.width/viewWidth,0,0,canvas.height/580,0,0);camera=cameraTarget();E.validateView(game,actualViewRect());clearInput();
  }
  function syncSound(){return sound.setPaused(!playing||menuOpen()||document.hidden);}
  window.addEventListener('pagehide',saveRun);
  function updateSoundSettings(){
    $('run-status').textContent=expedition.persistent&&metaStore.persistent?'Найденные факты и точки возврата сохраняются.':'Прогресс — до закрытия страницы';
    const journal=$('journal-content');journal.replaceChildren();const scheme=window.OrbitPuzzleUI.scheme(game);if(scheme){const state=document.createElement('p');state.textContent=scheme.title+'. '+scheme.state+'. '+scheme.action+' Сойди с переводника и вернись, чтобы сменить положение.';journal.append(state);for(const clue of game.level.clues||[])if(clue.text&&Math.abs(clue.x-game.player.x)<500){const line=document.createElement('p');line.textContent=clue.text;journal.append(line);}}
    for(const id of [...Object.keys(metaStore.value.abilities).filter(id=>metaStore.value.abilities[id]),...metaStore.value.dataIds,...metaStore.value.keyIds,...metaStore.value.traceIds]){if(E.levels.some(level=>level.story?.[id]&&expedition.facts(level.id)[id]))continue;const item=document.createElement('p');item.textContent=window.OrbitProgression.names[id]+(id==='resonator'?': '+window.OrbitProgressionCopy.progress.resonatorJournal:id==='magboots'?': '+window.OrbitProgressionCopy.progress.magbootsJournal:': '+(window.OrbitProgression.descriptions[id]||''));journal.append(item);}
    for(const level of E.levels)for(const [id,fact]of Object.entries(level.story||{}))if(expedition.facts(level.id)[id]){const title=document.createElement('h3'),text=document.createElement('p');title.textContent=fact.title;text.textContent=fact.text;journal.append(title,text);}
    if(!journal.children.length)journal.textContent='Найденные сообщения и следы Ады появятся здесь.';

    $('music-enabled').checked=sound.settings.music;$('effects-enabled').checked=sound.settings.effects;$('music-state').textContent=sound.settings.music?C.settings.on:C.settings.off;$('effects-state').textContent=sound.settings.effects?C.settings.on:C.settings.off;$('audio-enable').hidden=sound.status.available||!(window.AudioContext||window.webkitAudioContext);
    const help=$('help-content');help.replaceChildren();for(const text of [C.controls.keyboard,...Object.values(C.help)]){const p=document.createElement('p');p.textContent=text;help.append(p);}
    $('sound-status').textContent=!sound.status.available?'Звук недоступен в этом браузере.':sound.status.persistent?'Настройки сохраняются на этом устройстве.':'Настройки действуют до закрытия страницы.';
  }
  $('restart').setAttribute('aria-label',C.hud.restartAria);buttonText('restart','restart',C.hud.restart);buttonText('map-open','map',C.hud.map);$('next').textContent=C.win.next;$('win-map').textContent=C.win.map;$('home-map').textContent=C.home.map;$('map-title').textContent=C.map.title;$('map-close').textContent=C.map.close;document.querySelector('.map-help').textContent=C.map.help;$('sound-close').textContent=C.settings.close;
  $('audio-enable').addEventListener('click',()=>sound.activate().then(updateSoundSettings));
  $('sound-open').addEventListener('click',()=>{saveRun();clearInput();updateSoundSettings();soundDialog.showModal();syncSound();});
  buttonText('fullscreen','fullscreen',document.documentElement.requestFullscreen?C.settings.fullscreen:C.settings.window);
  $('sound-close').addEventListener('click',()=>soundDialog.close());
  soundDialog.addEventListener('close',()=>{syncSound();canvas.focus({preventScroll:true});});
  for(const [id,key] of [['music-enabled','music'],['effects-enabled','effects']])$(id).addEventListener('change',()=>{sound.setEnabled(key,$(id).checked);sound.activate().then(updateSoundSettings);});
  document.addEventListener('visibilitychange',syncSound);
  let fullWindow=false;
  function fullscreenChanged(){
    const expanded=!!document.fullscreenElement||fullWindow;
    document.documentElement.classList.toggle('full-window',expanded);
    buttonText('fullscreen',expanded?'exit-fullscreen':'fullscreen',expanded?(fullWindow?C.settings.exitWindow:C.settings.exitFullscreen):C.settings.fullscreen);$('fullscreen').setAttribute('aria-label',expanded?'Выйти из полного экрана':'На весь экран');
    $('fullscreen').title=expanded?'Выйти из полного экрана (Esc)':'На весь экран';resize();
  }
  async function leaveFullscreen(){fullWindow=false;if(document.fullscreenElement)try{await document.exitFullscreen();}catch{}fullscreenChanged();}
  $('fullscreen').addEventListener('click',async()=>{
    clearInput();
    if(document.fullscreenElement||fullWindow){await leaveFullscreen();return;}
    try{if(!document.documentElement.requestFullscreen)throw Error();await document.documentElement.requestFullscreen();}
    catch{fullWindow=true;showNotice(C.settings.fullscreenUnavailable,true);}
    fullscreenChanged();canvas.focus({preventScroll:true});
  });
  document.addEventListener('fullscreenchange',fullscreenChanged);
  window.addEventListener('keydown',event=>{if(event.code==='Escape'&&(fullWindow||document.fullscreenElement)&&!menuOpen()&&!win.open)leaveFullscreen();});
  window.addEventListener('resize',resize);resize();prepareLevel();requestAnimationFrame(frame);
})();
