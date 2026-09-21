(function(root){
  'use strict';
  const KEY='orbit.expedition.meta.v1';
  const names={resonator:'Индукционная катушка',magboots:'Магнитные накладки','ada-fragment':'Фрагмент Ады','isolation-protocol':'Протокол изоляции','ada-service':'Сервисный допуск Ады','bypass-trace':'Западная трасса','ada-bypass':'След Ады','ada-repair-niche':'Ремонтная запись Ады','ada-roof-route':'Верхний путь Ады'};
  const descriptions={'ada-fragment':'Ада: «Не включай всё сразу. Сохрани обход».','isolation-protocol':'Станцию отключили вручную. После изоляции приёмник слышит резервную линию.','ada-service':'Нерасходуемый допуск Ады к сервисному переводнику и выходу восьмой главы.','bypass-trace':'Западная линия обходит разрыв. Восточная нужна только для сверки.','ada-bypass':'Верхний след Ады у приёмника теплицы.','ada-repair-niche':'Необязательная запись в верхней ремонтной нише станции.','ada-roof-route':'След Ады отмечает запасной путь над сервисным маршрутом.'};
  Object.assign(names,{"greenhouse-care": "Забота о саде", "reserve-berth": "Резервный причал", "manual-bypass": "Ручной обход", "local-reserves": "Местные резервы", "obsolete-order": "Устаревший приказ", "defensive-ring": "Защитное кольцо", "fault-cause": "Причина аварии", "ada-answer": "Ответ Ады"});
  Object.assign(descriptions,{"greenhouse-care": "Ада проверяла не только связь. Здесь она сохраняла жизнь, пока станции молчали.", "reserve-berth": "Груз и эвакуированные жители направлялись к резервному берегу.", "manual-bypass": "Под настилом сохранился ручной сервисный обход Ады.", "local-reserves": "Жилые станции работают на местных резервах, отдельно от повреждённой сети.", "obsolete-order": "Ремонтники повторяют старую аварийную команду. Нужна изоляция, а не общее включение.", "defensive-ring": "Тёмные секции защищают поселения от перегрузки центрального регулятора.", "fault-cause": "Измерения двух входов показали неисправность общего канала. Ада жива и находится у резервного узла.", "ada-answer": "Ада: «Рин? Слышу тебя. Мы дома». Независимый обход вернул связь и сохранил защиту."});
  const blank=()=>({schema:1,abilities:{resonator:false,magboots:false},dataIds:[],keyIds:[],traceIds:[],seenTutorials:[],foundPickupIds:[]});
  function normalize(raw,levels){
    const m=blank(),pickups=levels.flatMap(l=>l.pickups||[]);if(raw?.schema!==1)return m;
    const known={dataIds:['ada-fragment',...pickups.map(p=>p.dataId).filter(Boolean)],keyIds:pickups.map(p=>p.keyId).filter(Boolean),traceIds:['ada-bypass',...pickups.map(p=>p.traceId).filter(Boolean)],seenTutorials:['resonator','magboots'],foundPickupIds:pickups.map(p=>p.id)};
    for(const [key,ids]of Object.entries(known))if(Array.isArray(raw[key]))m[key]=[...new Set(raw[key].filter(id=>ids.includes(id)))];
    for(const id of ['resonator','magboots'])m.abilities[id]=raw.abilities?.[id]===true;
    // Запись целиком: повреждённый список предметов не оставляет пустой обязательный шкаф.
    for(const p of pickups)if(m.foundPickupIds.includes(p.id))grant(m,p);
    return m;
  }
  function grant(m,p){
    if(m.foundPickupIds.includes(p.id)&&((p.ability&&m.abilities[p.ability])||m.dataIds.includes(p.dataId)||m.keyIds.includes(p.keyId)||m.traceIds.includes(p.traceId)))return false;
    if(p.ability)m.abilities[p.ability]=true;
    for(const [field,id]of [['dataIds',p.dataId],['keyIds',p.keyId],['traceIds',p.traceId]])if(id&&!m[field].includes(id))m[field].push(id);
    if(!m.foundPickupIds.includes(p.id))m.foundPickupIds.push(p.id);return true;
  }
  function allowed(g,item){const m=g.meta||blank();return (item.requires||[]).every(id=>g.groups[id])&&Object.entries(item.requiresRouter||{}).every(([id,bit])=>g.routerBits[id]===bit)&&(item.requiresCircuits||[]).every(id=>g.circuits?.[id]?.ready)&&(item.requiresKeys||[]).every(id=>m.keyIds.includes(id))&&(item.requiresData||[]).every(id=>m.dataIds.includes(id))&&(item.requiresAbilities||[]).every(id=>m.abilities[id]);}
  function createStore(storage,levels){let persistent=true,raw;try{raw=JSON.parse(storage.getItem(KEY));}catch{try{storage.getItem(KEY);}catch{persistent=false;}}let value=normalize(raw,levels);function save(){try{storage.setItem(KEY,JSON.stringify(value));}catch{persistent=false;}}return {get value(){return value;},get persistent(){return persistent;},save,reset(){value=blank();save();}};}
  const api={KEY,blank,normalize,grant,allowed,createStore,names,descriptions};if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitProgression=api;
})(typeof window==='undefined'?globalThis:window);
