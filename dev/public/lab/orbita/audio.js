/* Автономная партитура «За горизонтом»: синтез без записей и сетевых запросов. */
(function(root){
  'use strict';
  const STORAGE_KEY='orbit.audio.v1', BEAT=60/96, BAR=BEAT*4;
  const frequency=midi=>440*Math.pow(2,(midi-69)/12);
  const note=(pitch,at,duration,gain=.12,type='triangle',endPitch=pitch)=>({pitch,at,duration,gain,type,endPitch});
  // Четыре фразы: вступление → пульс → ответ → развязка. Возврат к первой плавный.
  const melodies=[
    [76,null,79,83,null,81,79,null], [74,null,76,79,null,76,74,null],
    [71,74,null,79,78,null,74,null], [74,null,78,81,79,78,74,null],
    [76,79,83,null,86,83,81,79], [79,null,83,86,84,83,79,null],
    [78,79,83,79,78,null,74,71], [74,78,81,83,81,78,74,null]
  ];
  function musicEvents(bar){
    const b=((bar%16)+16)%16,phrase=Math.floor(b/4),root=[40,36,43,38][b%4],events=[];
    for(const pitch of [root+12,root+19,root+26])events.push(note(pitch,0,BAR*.93,.035,'sine'));
    events.push(note(root,0,BEAT*1.5,.16,'sine'));
    if(phrase)events.push(note(root+12,BEAT*2,BEAT*.8,.09,'triangle'));
    const melody=melodies[(b%4)+(phrase>=2?4:0)];
    melody.forEach((pitch,i)=>{if(pitch!==null)events.push(note(pitch,i*BEAT/2,BEAT*(i%2?.38:.7),.075,'triangle'));});
    if(phrase===1||phrase===2){
      for(let i=0;i<8;i++)events.push(note(root+24+[0,7,12,7][i%4],i*BEAT/2,BEAT*.18,.025,'sine'));
      for(let i=0;i<4;i++)events.push(note(35,i*BEAT,.1,.12,'sine',22));
    }
    // В последнем такте оставляем воздух перед новым кругом.
    return b===15?events.filter(e=>e.at<BEAT*2.5):events;
  }
  function effectEvents(name){
    switch(name){
      case 'jump':return [note(57,0,.12,.2,'sine',76)];
      case 'boost':return [note(45,0,.22,.22,'triangle',81),note(69,.08,.25,.12,'sine',93)];
      case 'coin':return [note(88,0,.1,.15,'sine'),note(95,.065,.17,.12,'sine')];
      case 'land':return [note(43,0,.07,.12,'sine',31)];
      case 'fall':return [note(64,0,.18,.16,'triangle',52),note(47,.16,.25,.12,'sine',35)];
      case 'checkpoint':return [note(72,0,.2),note(79,.11,.25),note(84,.22,.38,.13,'sine')];
      case 'enemy-turn':return [note(66,0,.08,.025,'sine')];
      case 'module-found':return [note(64,0,.14,.09,'triangle'),note(71,.13,.16,.09,'sine'),note(83,.29,.3,.09,'sine')];
      case 'resonance-pulse':return [note(59,0,.18,.10,'sine',83),note(78,.1,.2,.07,'triangle')];
      case 'resonance-expire':return [note(71,0,.16,.055,'sine',59)];
      case 'wall-jump':return [note(50,0,.08,.10,'triangle'),note(74,.04,.16,.09,'sine')];
      case 'charger-warn':return [note(42,0,.18,.08,'square'),note(49,.25,.20,.08,'square')];
      case 'charger-dash':return [note(43,0,.16,.10,'sawtooth',31)];
      case 'charger-rest':return [note(55,0,.16,.08,'triangle',43)];
      case 'duplicate-relay':
      case 'router':return [note(48,0,.055,.10,'triangle'),note(55,.06,.07,.08,'triangle')];
      case 'discovery':return [note(76,0,.12,.09,'sine'),note(83,.14,.22,.08,'sine')];
      case 'relay':return [note(60,0,.09,.14,'square'),note(72,.1,.16,.12,'triangle')];
      case 'crack':return [note(46,0,.07,.08,'sawtooth')];
      case 'crumble':return [note(42,0,.08,.08,'sawtooth'),note(38,.1,.09,.08,'sawtooth')];
      case 'enemy-warn':
      case 'enemy':return [note(52,0,.09,.1,'square'),note(59,.13,.11,.09,'square')];
      case 'enemy-pulse':return [note(36,0,.18,.24,'triangle',28),note(64,0,.12,.12,'square')];
      case 'enemy-stomp':
      case 'stomp':return [note(40,0,.09,.2,'triangle',65)];
      case 'win':return [note(72,0,.25),note(76,.13,.25),note(79,.26,.25),note(84,.4,.65,.14,'sine')];
      default:return [];
    }
  }
  function synthesize(context,bus,event,start,onEnd=()=>{}){
    const source=context.createOscillator(),gain=context.createGain(),t=start+event.at;
    source.type=event.type;source.frequency.setValueAtTime(frequency(event.pitch),t);
    if(event.endPitch!==event.pitch)source.frequency.exponentialRampToValueAtTime(frequency(event.endPitch),t+event.duration);
    // Короткий вход и мягкий выход убирают щелчки на границах нот.
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(event.gain,t+.008);
    gain.gain.exponentialRampToValueAtTime(.0001,t+event.duration);gain.gain.setValueAtTime(0,t+event.duration+.005);
    source.connect(gain);gain.connect(bus);
    source.onended=()=>{source.disconnect();gain.disconnect();onEnd(source);};
    source.start(t);source.stop(t+event.duration+.01);return source;
  }
  function createAudio(options={}){
    const doc=options.document===undefined?root.document:options.document;
    const Context=options.AudioContext||root.AudioContext||root.webkitAudioContext;
    let storage,persistent=true,settings={music:true,effects:true};
    try{storage=options.storage===undefined?root.localStorage:options.storage;
      const saved=JSON.parse(storage?.getItem(STORAGE_KEY)||'null');
      if(saved?.version===1)for(const key of ['music','effects'])if(typeof saved[key]==='boolean')settings[key]=saved[key];
      if(!storage)persistent=false;
    }catch{persistent=false;}
    let context=null,musicBus,effectBus,timer=null,activated=false,paused=true,disposed=false,failed=false;
    let nextBar=0,bar=0,queue=Promise.resolve(),active=false;
    const voices=new Map(),lastEffects=new Map();
    const setTimer=options.setInterval||root.setInterval.bind(root),clearTimer=options.clearInterval||root.clearInterval.bind(root);
    const wanted=()=>activated&&!paused&&!doc?.hidden&&!disposed&&(settings.music||settings.effects);
    function stopVoices(kind){
      for(const [source,type] of voices)if(!kind||kind===type){try{source.stop();}catch{}voices.delete(source);}
    }
    function stop(){
      active=false;if(timer!==null){clearTimer(timer);timer=null;}stopVoices();lastEffects.clear();
    }
    function emit(events,bus,time,kind){
      for(const event of events){
        if(voices.size>=96)break;
        const source=synthesize(context,bus,event,time,source=>voices.delete(source));voices.set(source,kind);
      }
    }
    function tick(){
      if(!active||!wanted()||!settings.music)return;
      // После задержки вкладки не воспроизводим накопившиеся такты одновременно.
      if(nextBar<context.currentTime-.2)nextBar=context.currentTime+.04;
      if(nextBar<context.currentTime+.15){emit(musicEvents(bar++),musicBus,nextBar,'music');nextBar+=BAR;}
    }
    function start(){
      if(active)return;active=true;nextBar=context.currentTime+.04;tick();timer=setTimer(tick,40);
    }
    function reconcile(){
      if(!wanted())stop();
      // Последовательность защищает от быстрого pause/resume во время разрешения autoplay.
      queue=queue.then(async()=>{
        if(!context||disposed)return;
        if(wanted()){
          try{await context.resume();failed=false;if(wanted())start();else{stop();await context.suspend();}}
          catch{failed=true;stop();}
        }else{try{await context.suspend();}catch{failed=true;}}
      });return queue;
    }
    function activate(){
      if(disposed||!Context){failed=true;return Promise.resolve(false);}
      if(!context){
        try{
          context=new Context();const master=context.createGain();master.gain.value=.48;
          musicBus=context.createGain();musicBus.gain.value=.65;effectBus=context.createGain();effectBus.gain.value=.8;
          musicBus.connect(master);effectBus.connect(master);master.connect(context.destination);
          // resume вызывается внутри жеста, а не после таймера или загрузки файла.
          queue=Promise.resolve(context.resume()).catch(()=>{failed=true;});
        }catch{failed=true;return Promise.resolve(false);}
      }
      activated=true;return reconcile().then(()=>!failed);
    }
    function setEnabled(key,value){
      if(!['music','effects'].includes(key))return;
      settings[key]=!!value;stopVoices(key==='music'?'music':'effect');
      if(key==='music')nextBar=(context?.currentTime||0)+.04;
      try{storage.setItem(STORAGE_KEY,JSON.stringify({version:1,...settings}));persistent=true;}catch{persistent=false;}
      return reconcile();
    }
    function playEffect(name){
      if(!active||!wanted()||!settings.effects||context?.state!=='running')return false;
      const events=effectEvents(name);if(!events.length)return false;
      const now=context.currentTime;
      if(now-(lastEffects.get(name)??-Infinity)<.045)return false;
      lastEffects.set(name,now);emit(events,effectBus,now+.005,'effect');return true;
    }
    function visibility(){reconcile();}
    doc?.addEventListener('visibilitychange',visibility);
    return {
      activate,setEnabled,playEffect,
      setPaused(value){paused=!!value;return reconcile();},
      get settings(){return {...settings};},
      get status(){return {available:!!Context&&!failed,persistent,activated,active,voices:voices.size,state:context?.state||'idle'};},
      async dispose(){disposed=true;stop();doc?.removeEventListener('visibilitychange',visibility);await queue;try{await context?.close();}catch{}}
    };
  }
  const api={createAudio,musicEvents,effectEvents,synthesize,STORAGE_KEY,BAR};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitAudio=api;
})(typeof window==='object'?window:globalThis);
