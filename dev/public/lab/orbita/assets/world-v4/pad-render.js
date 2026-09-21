// Reference renderer. x/y is the unchanged contact surface; decoration hangs below it.
window.drawOrbitPad=function(ctx,image,frame,x,y,w,ready){
 ctx.drawImage(image,...frame.sourceRect,x,y,w,16);
 ctx.save();ctx.strokeStyle=ready?'#fff3cf':'#edb853';ctx.lineWidth=ready?3:2;ctx.lineJoin='round';
 // Signals flank the standing astronaut instead of hiding behind its helmet.
 for(const cx of [x+12,x+w-12]){ctx.beginPath();ctx.moveTo(cx-7,y-7);ctx.lineTo(cx,y-14);ctx.lineTo(cx+7,y-7);ctx.stroke();if(ready){ctx.beginPath();ctx.moveTo(cx-7,y-14);ctx.lineTo(cx,y-21);ctx.lineTo(cx+7,y-14);ctx.stroke();}}
 if(ready){ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+3,y);ctx.lineTo(x+w-3,y);ctx.stroke();}ctx.restore();
};
