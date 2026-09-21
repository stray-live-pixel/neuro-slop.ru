(function(root){
 'use strict';
 const labels={SOURCE:'Источник',SURVEY:'Осмотр антенны',DEMO:'Учебный проход',SERVICE:'Сервисный проход',GARDEN:'Питание насоса',ROOT:'Запас теплицы',ARCHIVE:'Приёмник Ады',UPLINK:'Связь с переправой',ACCESS:'Вход станции',P:'Линия P',Q:'Линия Q',ISOLATED:'Изоляция разрыва',MANIFEST:'Манифест',RESERVE:'Резервный маршрут',BERTH:'Резервный причал',SIGNAL:'Линия связи',LOWER:'Нижний обход',DRAIN:'Дренаж',MANUAL:'Ручной проход','WEST-STOP':'Западная остановка','EAST-STOP':'Восточная остановка',LOOP:'Короткий маршрут',RESERVES:'Местные резервы',LOG:'Старый приказ','SAFE-ORDER':'Ручное управление','FAULT-L':'Западный ремонт','FAULT-R':'Восточная продувка','FAULT-ISOLATED':'Изоляция аварии',PUMP:'Насос',VIEW:'Обзор кольца',SHIELD:'Защита','SURVEY-L':'Левая антенна','SURVEY-R':'Правая антенна',WEST:'Западная трасса',EAST:'Восточная сверка',BYPASS:'Обход','SERVICE-EXIT':'Сервисный выход','TEST-A':'Проверка A','TEST-B':'Проверка B','READ-A':'Замер A','READ-B':'Замер B',DIAGNOSIS:'Диагностика',REPAIR:'Ремонт','RESERVE-READY':'Резерв',LIFE:'Жилая линия',COMMISSION:'Питание принято',RING:'Защита кольца'};
 const mark=on=>on?'✓':'○',change='Сойди с контакта и вернись для переключения.';
 function scheme(g){
  const x=g.player.x,b=g.routerBits,a=g.groups,copy=root.OrbitChapterSignalsCopy;
  const out=(title,state,action)=>({title,state,action,compact:state+'\n'+action});
  if(g.level.id===1){
   if(x>=4140&&x<5620)return out('Питание теплицы',`A${b.A} · B${b.B} · C${b.C} · насос ${mark(a.GARDEN)}`,a.GARDEN?'Насос питается от целой ветки':'Проследи целый провод к саду');
   if(x>=7020&&x<8400&&g.circuits?.['ROOT-FLOW']){const c=g.circuits['ROOT-FLOW'];return out('Поток теплицы',`Корни ${b.water} · воздух ${b.air} · запрос ${c.requested}/3`,a.ROOT?'Запас сохранён · подача саду 2/1':c.overload?'Избыток: давление обеих веток 0':c.ready?'Встань на контакт заполнения':'Две капли корням · лопасть воздуху');}
   if(x>=8400&&x<9720)return out('Два независимых источника',`◯ X → ${b.X?'связь':'сад'} · □ Y → ${b.Y?'связь':'сад'}`,a.UPLINK?'Сад и связь получают питание':b.X===b.Y?'Оба источника питают одну нагрузку':'Две нагрузки · два отдельных входа');
  }
  if(g.level.id===4){
   if(x>4100&&x<5900){const v=root.OrbitPlaytestSignals.q({source:a.SOURCE,bus:b.bus,q:a.Q});return out('Питание станции',`Источник ${mark(a.SOURCE)} · ${b.bus?'Рейки':'Дверь P'} · Q ${mark(a.Q)}`,!a.SOURCE?'Источник выключен':v.rails?(a.Q?'Q заряжен. Верни питание двери':'Рейки включены. Накопитель Q наверху'):a.Q?'Дверь открыта · заряд Q сохранён':'P включён · рейки погашены');}
   if(x>6400&&x<6680)return out('Приёмник Ады',`Протокол · ${g.meta.dataIds.includes('isolation-protocol')?'Получен':'В гнезде'}`,`Допуск Ады · ${g.meta.keyIds.includes('ada-service')?'Получен':'В гнезде'}`);
   if(x>6200&&x<7500)return out('Изоляция и приёмник',`Разрыв ${a.ISOLATED?'отсоединён':'подключён'}`,a.ISOLATED?'Протокол и допуск — в приёмнике слева':'Переведи питание с повреждённой ветки');
  }
  if(g.level.id===8){
   if(x>1400&&x<3120)return out(copy.T.title,`T → ${b.T?'правая':'левая'} · ${+!!a['SURVEY-L']+(+!!a['SURVEY-R'])}/2 осмотрены`,a.SURVEY?'Путь открыт. Вторая антенна необязательна':'Проверь любую антенну');
   if(x>5060&&x<7150){const v=uState(g);return out(v.title,`${v.title} · З ${mark(a.WEST)} · В ${mark(a.EAST)}`,v.text);}
  }
  if(g.level.id===9&&x>1800&&x<4200)return out('Один измеритель — два опыта',`Вход ${b.probe?'Б':'А'} · замер А ${mark(a['READ-A'])} · Б ${mark(a['READ-B'])}`,a.DIAGNOSIS?'Причина найдена. Канал изолирован':Math.abs(x-3050)<180?(b.probe?'Б: ровный свет резерва':'А: игла срывается у разрыва'):a['READ-A']&&a['READ-B']?'Сравни результаты и изолируй общий канал':'Сними показание в измерителе справа');
  if(g.level.id===10&&x>1700&&x<3900)return out('Независимое питание',`Резерв ${mark(a['RESERVE-READY'])} · жизнь ${mark(a.LIFE)} · связь ${mark(a.SIGNAL)}`,a.COMMISSION?'Питание принято. Защита сохранится':Math.abs(x-2230)<220?'0: разрыв · 1: местный резерв':Math.abs(x-2910)<220?'0: сад · 1: повреждённая линия':Math.abs(x-3610)<220?'0: разрыв · 1: внешняя антенна':a.LIFE&&a.SIGNAL?'Встань на контакт приёмки':'Следуй целым линиям к двум нагрузкам');
  const r=(g.level.routers||[]).find(r=>Math.abs(r.x-x)<220);
  if(r){const names={lesson:'Учебный путь',destination:'Маршрут причала',drain:'Дренаж',loop:'Короткий маршрут',order:'Ручное управление',fault:'Ветка ремонта',shield:'Защитная линия','beacon-feed':'Питание антенны','repair-route':'Обход ремонта','final-isolation':'Изоляция кольца'};const choices={destination:['Груз △','Резерв ○'],drain:['Верхний слив','Сервисный низ'],loop:['Длинный рейс','Короткий мост'],order:['Старый приказ','Ручной режим'],fault:['Ремонт слева','Продувка справа'],shield:['Центральный разрыв','Изоляция'], 'beacon-feed':['Резерв','Разрыв'], 'repair-route':['Старая линия','Обход'], 'final-isolation':['Общая линия','Изоляция']};return out(names[r.id]||'Переводник',`${names[r.id]||r.id} → ${choices[r.id]?.[b[r.id]]||b[r.id]}`,change);}
  const clue=(g.level.clues||[]).filter(c=>c.text&&Math.abs(c.x-x)<200).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];if(clue){const short={hollow:'Под настилом — целая балка. Спуск безопасен.',prediction:'Сравни два входа одним измерителем.',plan:'Резерв отдельно. Жизнь и связь — по целым линиям.','sentry-path':'Смотритель идёт по тросу. Внизу безопасно.','repair-warning':'Ремонтник готовит рывок. Сверху есть обход.'};return out('Наблюдение',short[clue.id]||clue.text,'');}
  return null;
 }
 function uState(g){const platforms=g.routePlatforms.filter(s=>s.requiresRouter?.U!==undefined);return root.OrbitPlaytestSignals.u({key:g.meta.keyIds.includes('ada-service'),bit:g.routerBits.U,west:g.groups.WEST,east:g.groups.EAST,bypass:g.groups.BYPASS,pending:platforms.some(s=>s.state==='pending'),held:platforms.some(s=>s.state==='held')});}
 function chargerHelp(g,e){const c=root.OrbitPlaytestSignals.copy;if(e.dead)return c.off;if(e.contactGrace)return c.rest;if(e.state!=='idle')return c[e.state];const p=g.player;return p.grounded&&p.supportId&&p.y+p.h<e.floorY-80?c.highIdle:p.grounded?c.lowIdle:'Рывок начнётся, когда приблизишься по земле.';}
 function abilityHelp(g,touch){
  const m=g.meta,p=g.player,c=root.OrbitProgressionCopy,v=root.OrbitPlaytestSignals.copy;
  if(m.abilities.magboots&&!m.seenTutorials.includes('magboots')&&(g.level.rails||[]).some(r=>Math.abs(g.level.platforms.find(s=>s.id===r.wallId).x-p.x)<400))return g.grip?(touch?v.gripTouch:v.gripKeyboard):p.grounded?'Прыгни к рейке заранее. На спуске держи направление к ней.':c.magboots.learnGrip;
  if(m.abilities.resonator&&!m.seenTutorials.includes('resonator')&&(g.level.resonators||[]).some(r=>Math.abs(r.x-p.x)<450))return g.resonantPlatforms.some(s=>s.state==='active'||s.state==='held')?c.resonator.learnLanding:c.resonator.learnContact;
  return '';
 }
 const api={scheme,labels,uState,chargerHelp,abilityHelp};if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitPuzzleUI=api;
})(typeof window==='undefined'?globalThis:window);
