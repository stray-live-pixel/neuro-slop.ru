// Decoration only: leaves the actual grounded contact at x3410,y205,w50 unchanged.
window.drawOrbitEastContact=function(ctx,mechanismImage,art,on,cssScale=.5){
 const f=art.atlases.mechanisms.frames[on?'relay-active':'relay-idle'];
 ctx.save();
 // Thin floor inlay, below the bearing edge. No vertical emblem in the patrol band.
 ctx.fillStyle=on?'#b5ecd4':'#849ca8';ctx.fillRect(3410,209,50,3);
 ctx.strokeStyle=on?'#a1c9b7':'#68828c';ctx.lineWidth=2;ctx.setLineDash(on?[]:[5,7]);ctx.beginPath();ctx.moveTo(3435,212);ctx.lineTo(3435,228);ctx.moveTo(3435,278);ctx.lineTo(3435,296);ctx.lineTo(4302,296);ctx.stroke();ctx.setLineDash([]);
 ctx.drawImage(mechanismImage,...f.sourceRect,3410,228,50,50);
 // Constant CSS text, clamped panel width handled by integration, behind actors.
 const label=on?'Восточная ветка включена':'Восточная ветка';ctx.font=`bold ${13/cssScale}px Arial`;const tw=ctx.measureText(label).width;ctx.fillStyle='#102839ee';ctx.fillRect(3435-tw/2-8,307,tw+16,20/cssScale);ctx.fillStyle='#f6e7c8';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(label,3435,310);ctx.restore();
};
