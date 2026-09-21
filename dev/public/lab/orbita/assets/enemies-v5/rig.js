// Isotropic sprite animation reference. The same sentry chassis is used in every state.
window.OrbitEnemyRig={
 image:'assets/enemies-v5/enemies.png',
 sentry:{body:{sourceRect:[115,632,177,114],position:[2,0],scale:36/177},rotor:{sourceRect:[32,632,91,20],scale:10/91,pivot:[45.5,10]},fin:{sourceRect:[181,733,48,13],scale:17/48,pivot:[24,1]},darkLens:{sourceRect:[1310,914,49,44]},physicalSize:[40,28],pivot:[20,14]},
 charger:{scale:.125,physicalSize:[36,28],pivot:'feet',sourcePivotX:[102,111,112,157,172,106,107,165]}
};
window.drawOrbitSentry=function(ctx,image,x,y,state='fly',time=0,facing=1,reduced=false){
 const r=OrbitEnemyRig.sentry;ctx.save();ctx.translate(x+20,y+14);ctx.scale(facing,1);ctx.translate(-20,-14);
 const part=(p,dx,dy)=>ctx.drawImage(image,...p.sourceRect,dx,dy,p.sourceRect[2]*p.scale,p.sourceRect[3]*p.scale);
 // Fixed chassis: no per-frame fitting, skew, stretch or bobbing.
 part(r.body,...r.body.position);
 const phase=state==='fly'?(reduced?0:Math.sin(time*Math.PI*2/0.18)):0;
 for(const cx of [5,35]){ctx.save();ctx.translate(cx,2);ctx.rotate((state==='off'?.45:phase*.22)*(cx<20?-1:1));part(r.rotor,-r.rotor.pivot[0]*r.rotor.scale,-r.rotor.pivot[1]*r.rotor.scale);ctx.restore();}
 ctx.save();ctx.translate(19,23);ctx.rotate(state==='brake'?-.3:state==='turn'?.3:state==='off'?.55:reduced?0:Math.sin(time*8)*.08);part(r.fin,-r.fin.pivot[0]*r.fin.scale,-r.fin.pivot[1]*r.fin.scale);ctx.restore();
 if(state==='off'){ctx.save();ctx.beginPath();ctx.arc(23.5,17,3.6,0,Math.PI*2);ctx.clip();ctx.drawImage(image,...r.darkLens.sourceRect,19.9,13.4,7.2,7.2);ctx.restore();}ctx.restore();
};
window.drawOrbitCharger=function(ctx,image,frame,x,floorY,facing=1){ctx.save();ctx.translate(x+18,floorY);ctx.scale(facing,1);ctx.drawImage(image,...frame.sourceRect,-frame.pivot[0]*frame.scale,-frame.pivot[1]*frame.scale,...frame.drawSize);ctx.restore();};
