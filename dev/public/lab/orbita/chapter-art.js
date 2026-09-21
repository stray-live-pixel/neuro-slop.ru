(function(root){
  'use strict';
  root.drawOrbitChapter=function(ctx,g,world){
    if(!g.level.routers)return;
    const bits=g.routerBits;
    function label(text,x,y,color='#f6e7c8'){ctx.font='bold 13px Arial';ctx.fillStyle='#0a1826e8';ctx.fillRect(x-4,y-14,ctx.measureText(text).width+8,19);ctx.fillStyle=color;ctx.fillText(text,x,y);}
    function wire(points,on,broken=false){ctx.strokeStyle=on?'#bff7c7':'#7c9ba8';ctx.lineWidth=on?4:2;ctx.setLineDash(on?[]:[5,5]);ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);if(broken){const [x,y]=points.at(-1);ctx.strokeStyle='#edb853';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-8,y-6);ctx.lineTo(x-2,y+4);ctx.moveTo(x+7,y-7);ctx.lineTo(x+13,y+3);ctx.stroke();}}
    function mark(x,y,leaf){ctx.save();ctx.translate(x,y);ctx.strokeStyle='#f6e7c8';ctx.lineWidth=2;ctx.beginPath();if(leaf){ctx.moveTo(-6,5);ctx.quadraticCurveTo(-12,-9,8,-8);ctx.quadraticCurveTo(11,7,-6,5);ctx.moveTo(-6,5);ctx.lineTo(5,-5);}else{ctx.moveTo(0,9);ctx.lineTo(0,-5);ctx.moveTo(-6,9);ctx.lineTo(6,9);ctx.moveTo(-7,-9);ctx.quadraticCurveTo(0,-2,7,-9);}ctx.stroke();ctx.restore();}
    function node(x,y,text,on){ctx.fillStyle=on?'#c7f9c9':'#5d7886';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();label(text,x+12,y+4);}
    // Линии повторяют граф контракта; тупики видны до первого переключения.
    wire([[1980,330],[2030,330],[2030,270],[2095,270]],true);node(1980,330,'ИСТОЧНИК',true);
    wire([[2095,270],[2160,210]],bits.lesson===0,true);label('ОБРЫВ',2140,185);
    wire([[2095,270],[2150,335],[2200,335],[2688,335]],bits.lesson===1||g.groups.DEMO);node(2200,335,'ПРИВОД',g.groups.DEMO);
    const a=[4575,265],b=[5105,265],c=[5455,345];
    wire([[4260,410],[4380,410],[4380,265],a],true);node(4260,410,'ПИТАНИЕ САДА',true);
    wire([a,[4670,190]],bits.A===0,true);label('КАБЕЛЬ ПОВРЕЖДЁН',4510,163);
    wire([a,[4820,245],[4990,245],b],bits.A===1);
    world.sprite('mechanisms','gate-closed',5150,125,22,40,[0,0,1,.45]);world.sprite('mechanisms','gate-closed',5164,172,22,25,[0,.55,1,.45]);
    wire([b,[5160,190]],bits.A===1&&bits.B===1,true);label('СЛОМАННАЯ БАШНЯ',5050,165);
    wire([b,[5230,350],c],bits.A===1&&bits.B===0);
    wire([c,[5370,420]],bits.A===1&&bits.B===0&&bits.C===0,true);label('НЕЗАМКНУТЫЙ ВОЗВРАТ',5220,451);
    wire([c,[5480,275]],bits.A===1&&bits.B===0&&bits.C===1);node(5480,275,'САД',g.groups.GARDEN);
    wire([[5480,275],[5552,275],[5552,450]],g.groups.GARDEN);
    // У X круг, у Y квадрат; четыре входа разведены по высоте и ширине.
    for(const [id,x,y,lane]of [['X',8795,335,9100],['Y',9020,255,9130]]){
      ctx.strokeStyle='#fff0cb';ctx.lineWidth=3;ctx.beginPath();if(id==='X')ctx.arc(x,y,18,0,Math.PI*2);else ctx.rect(x-18,y-18,36,36);ctx.stroke();
      const input=id==='X'?0:1;
      wire([[x,y],[lane,y],[lane,300+input*28],[9190,300+input*28]],bits[id]===0);
      wire([[x,y+12],[lane-15,y+12],[lane-15,380+input*28],[9190,380+input*28]],bits[id]===1);
      ctx.font='bold 26px Arial';ctx.fillStyle='#fff0cb';ctx.textAlign='center';ctx.fillText(id,x,y+9);ctx.textAlign='left';
    }
    node(9210,314,'',bits.X===0||bits.Y===0);node(9210,394,'',bits.X===1||bits.Y===1);mark(9240,314,true);mark(9240,394,false);mark(5460,275,true);
    wire([[9210,355],[9360,355],[9360,430],[9650,430]],g.groups.UPLINK);
    for(const r of g.level.routers.filter(r=>r.id!=="water"&&r.id!=="air")){
      const bit=bits[r.id];if(!world.sprite('mechanisms',bit?'relay-active':'relay-idle',r.x,r.y-50,50,50)){ctx.fillStyle='#7db8bd';ctx.fillRect(r.x,r.y-8,50,8);}
      const destinations={lesson:bit?[2200,335]:[2160,210],A:bit?[4990,245]:[4670,190],B:bit?[5160,190]:[5230,350],C:bit?[5480,275]:[5370,420],X:[9190,bit?395:315],Y:[9190,bit?395:315]};
      ctx.font='bold 26px Arial';ctx.fillStyle='#fff0ca';ctx.fillText(r.id==='lesson'?'↗':r.id,r.x+5,r.y-70);if(['X','Y'].includes(r.id)){ctx.strokeStyle='#fff0ca';ctx.lineWidth=3;ctx.beginPath();if(r.id==='X')ctx.arc(r.x+14,r.y-80,21,0,Math.PI*2);else ctx.rect(r.x-7,r.y-101,42,42);ctx.stroke();}
      if(['X','Y'].includes(r.id))mark(r.x-12,r.y-30,!bit);
      const [tx,ty]=destinations[r.id];ctx.save();ctx.translate(r.x+25,r.y-51);ctx.rotate(Math.atan2(ty-(r.y-51),tx-(r.x+25)));ctx.strokeStyle='#fff3cf';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(9,0);ctx.moveTo(3,-6);ctx.lineTo(9,0);ctx.lineTo(3,6);ctx.stroke();ctx.restore();
    }
    if(g.groups.UPLINK){ctx.strokeStyle='#bff7c7';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(9600,195,16+i*12,-2.5,-.65);ctx.stroke();}}
    const trace=g.level.optionalTrace;if(trace){label('МЕТКА АДЫ',trace.x-35,trace.y-80);}
  };
})(window);
