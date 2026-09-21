// Display-only selector. Inputs must come from the engine; no state is persisted here.
(function(root){
root.OrbitRootFlowView=function({water=0,air=0,garden=false,rootFilled=false},copy){
 if(!Number.isInteger(water)||!Number.isInteger(air)||water<0||water>2||air<0||air>2)throw Error('Invalid valve state');
 const requested=water+air,overload=requested>3,ready=water===2&&air===1;
 return {water,air,requested,capacity:3,overload,ready,currentWaterFlow:overload?0:water,currentAirFlow:overload?0:air,waterFlow:rootFilled?2:overload?0:water,airFlow:rootFilled?1:overload?0:air,garden,rootFilled,
 greenhouse:rootFilled?'restored':garden?'powered':'dark',
 notice:rootFilled?copy.latched:!garden?copy.powerOff:overload?copy.overload:ready?copy.ready:copy['water'+water]+' '+copy['air'+air],
 contact:rootFilled?'filled':ready?'ready':'blocked',
 pressureNotice:rootFilled?(overload?copy.currentOverload:'Настройки насоса показаны отдельно. Сад питается от запаса.'):overload?copy.overload:copy['water'+water]+' '+copy['air'+air]};
};})(window);
