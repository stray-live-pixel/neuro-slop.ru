(function(root){
  'use strict';
  root.createOrbitWorldRenderer=function(ctx){
    const catalog=root.OrbitWorldArt?.atlases||{},images={};
    for(const [id,a]of Object.entries(catalog)){const img=new Image();img.src=a.image;images[id]=img;}
    function available(id){return images[id]?.complete&&images[id].naturalWidth>0;}
    function sprite(id,name,x,y,w,h,part){
      const f=catalog[id]?.frames[name];if(!f||!available(id))return false;
      const [sx,sy,sw,sh]=f.sourceRect,p=part||[0,0,1,1];ctx.drawImage(images[id],sx+sw*p[0],sy+sh*p[1],sw*p[2],sh*p[3],x,y,w,h);return true;
    }
    function platform(s,biome,state){
      const id='terrain-'+biome;if(!available(id))return false;
      ctx.save();ctx.beginPath();ctx.rect(s.x,s.y,s.w,s.h+3);ctx.clip();
      if(state){
        const name=state==='cracking'?'bridge-cracked':'bridge-intact';
        sprite(id,name,s.x,s.y,s.w,s.h*.5,[0,0,1,.5]);
        sprite(id,name,s.x,s.y+s.h*.5+(state==='cracking'&&s.remaining<.35?2:0),s.w,s.h*.5,[0,.5,1,.5]);
      }else if(s.oneWay){
        const cap=Math.min(16,s.w/2);sprite(id,'ledge-left',s.x,s.y,cap,s.h,[0,0,cap/128,1]);
        for(let x=s.x+cap;x<s.x+s.w-cap;x+=128){const w=Math.min(128,s.x+s.w-cap-x);sprite(id,'ledge-center',x,s.y,w,s.h,[0,0,w/128,1]);}
        sprite(id,'ledge-right',s.x+s.w-cap,s.y,cap,s.h,[1-cap/128,0,cap/128,1]);
      }else{
        for(let y=s.y;y<s.y+s.h;y+=y===s.y?85:96)for(let x=s.x;x<s.x+s.w;x+=128){
          const h=Math.min(y===s.y?85:96,s.y+s.h-y),w=Math.min(128,s.x+s.w-x);
          const name=y>s.y?'wall-fill':x===s.x?'ground-left':x+128>=s.x+s.w?'ground-right':'ground-center';
          sprite(id,name,x,y,w+.25,h+.25,[0,0,w/128,h/(y===s.y?85:96)]);
        }
      }
      ctx.restore();return true;
    }
    function pad(p,ready){const f=catalog.mechanisms?.frames[ready?'pad-ready':'pad-idle'];if(!f||!available('mechanisms'))return false;root.drawOrbitPad(ctx,images.mechanisms,f,p.x,p.y,p.w,ready);return true;}
    function gate(g){
      if(!available('mechanisms'))return false;const cap=Math.min(14,g.h/2);
      sprite('mechanisms','gate-closed',g.x,g.y,g.w,cap,[0,0,1,.2]);
      for(let y=g.y+cap;y<g.y+g.h-cap;y+=40){const h=Math.min(40,g.y+g.h-cap-y);sprite('mechanisms','gate-closed',g.x,y,g.w,h,[0,.2,1,.6*h/40]);}
      sprite('mechanisms','gate-closed',g.x,g.y+g.h-cap,g.w,cap,[0,.8,1,.2]);return true;
    }
    function enemy(e,clock,reduced){
      if(!available('enemies'))return false;
      if(e.kind==='walker'){
        if(e.dead&&e.deadTime>=.37)return true;
        const name=e.dead?(e.deadTime<.12?'scarab-hit':'scarab-off'):e.direction===0?'scarab-turn':'scarab-walk-'+['a','b','c','d'][reduced?0:Math.floor(clock/.09)%4];
        const h=catalog.enemies.frames[name].drawHeight||26;
        ctx.save();ctx.translate(e.x+16,e.floorY);ctx.scale(e.facing,1);if(e.dead)ctx.globalAlpha=Math.max(0,1-e.deadTime/.37);sprite('enemies',name,-16,-h,32,h);ctx.restore();
      }else sprite('enemies','pulsar-'+(e.state==='warn'?(e.cycle<e.warn-.25?'charge':'open'):e.state),e.x+e.w/2-24,e.floorY-214,48,48);
      return true;
    }
    function eastContact(on,scale,gate){
      if(available('mechanisms'))root.drawOrbitEastContact(ctx,images.mechanisms,root.OrbitWorldArt,on,scale);
      else{ctx.fillStyle=on?'#b5ecd4':'#849ca8';ctx.fillRect(3410,209,50,3);ctx.strokeRect(3410,228,50,50);}
      if(gate){ctx.strokeStyle=on?'#a1c9b7':'#68828c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4302,296);ctx.lineTo(gate.x+gate.w/2,296);ctx.lineTo(gate.x+gate.w/2,gate.h);ctx.stroke();}
    }
    return {sprite,platform,pad,gate,enemy,available,eastContact};
  };
})(window);
