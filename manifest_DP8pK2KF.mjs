import '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import 'piccolore';
import { N as NOOP_MIDDLEWARE_HEADER, k as decodeKey } from './chunks/astro/server_C2bAvA3I.mjs';
import 'clsx';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/","cacheDir":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/node_modules/.astro/","outDir":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/","srcDir":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/","publicDir":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/public/","buildClientDir":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/client/","buildServerDir":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/server/","adapterName":"","routes":[{"file":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/chats/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_category_.OjqPBMy9.css"}],"routeData":{"route":"/chats","isIndex":true,"type":"page","pattern":"^\\/chats\\/?$","segments":[[{"content":"chats","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/chats/index.astro","pathname":"/chats","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/posts/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_category_.OjqPBMy9.css"}],"routeData":{"route":"/posts","isIndex":true,"type":"page","pattern":"^\\/posts\\/?$","segments":[[{"content":"posts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/posts/index.astro","pathname":"/posts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/transcripts/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_category_.OjqPBMy9.css"},{"type":"inline","content":".tag-chip[data-astro-cid-6fumfxjs].is-active{background:var(--primary);border-color:var(--primary);color:var(--primary-foreground)}\n"}],"routeData":{"route":"/transcripts","isIndex":true,"type":"page","pattern":"^\\/transcripts\\/?$","segments":[[{"content":"transcripts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/transcripts/index.astro","pathname":"/transcripts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_category_.OjqPBMy9.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://neuro-slop.ru","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/category/[category].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/category/[category]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/chats/[id].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/chats/[id]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/chats/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/chats/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/posts/[id].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/posts/[id]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/posts/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/posts/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/transcripts/[id].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/transcripts/[id]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/transcripts/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/transcripts/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astro-page:src/pages/category/[category]@_@astro":"pages/category/_category_.astro.mjs","\u0000@astro-page:src/pages/chats/[id]@_@astro":"pages/chats/_id_.astro.mjs","\u0000@astro-page:src/pages/chats/index@_@astro":"pages/chats.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:src/pages/posts/[id]@_@astro":"pages/posts/_id_.astro.mjs","\u0000@astro-page:src/pages/posts/index@_@astro":"pages/posts.astro.mjs","\u0000@astro-page:src/pages/transcripts/[id]@_@astro":"pages/transcripts/_id_.astro.mjs","\u0000@astro-page:src/pages/transcripts/index@_@astro":"pages/transcripts.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astrojs-manifest":"manifest_DP8pK2KF.mjs","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/.astro/content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/.astro/content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_ZOCK61Zo.mjs","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_CwGF44zD.mjs","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/Background.astro?astro&type=script&index=0&lang.ts":"_astro/Background.astro_astro_type_script_index_0_lang.DSTfDRRv.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/chat/ChatQuota.astro?astro&type=script&index=0&lang.ts":"_astro/ChatQuota.astro_astro_type_script_index_0_lang.B740XjAB.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/chat/ChatRoom.astro?astro&type=script&index=0&lang.ts":"_astro/ChatRoom.astro_astro_type_script_index_0_lang.CDIItvmV.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/AudioDigest.astro?astro&type=script&index=0&lang.ts":"_astro/AudioDigest.astro_astro_type_script_index_0_lang.D_29VBzF.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/Plan.astro?astro&type=script&index=0&lang.ts":"_astro/Plan.astro_astro_type_script_index_0_lang.w7jm58QQ.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/Quiz.astro?astro&type=script&index=0&lang.ts":"_astro/Quiz.astro_astro_type_script_index_0_lang.DluWZ_AS.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/TranscriptNav.astro?astro&type=script&index=0&lang.ts":"_astro/TranscriptNav.astro_astro_type_script_index_0_lang.B0Nh2rV-.js","/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/transcripts/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.DH9GotFM.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/Background.astro?astro&type=script&index=0&lang.ts","const i=document.querySelector(\"[data-cursor-glow]\"),c=window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches;if(i&&!c&&window.matchMedia(\"(pointer: fine)\").matches){let n=0,r=0,e=0,t=0,a=0;const s=()=>{e+=(n-e)*.06,t+=(r-t)*.06,i.style.transform=`translate3d(${e}px, ${t}px, 0)`,Math.abs(n-e)>.5||Math.abs(r-t)>.5?a=requestAnimationFrame(s):a=0};window.addEventListener(\"pointermove\",o=>{n=o.clientX,r=o.clientY,i.classList.add(\"is-active\"),a||(a=requestAnimationFrame(s))}),document.documentElement.addEventListener(\"pointerleave\",()=>{i.classList.remove(\"is-active\")})}"],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/chat/ChatQuota.astro?astro&type=script&index=0&lang.ts","const e=document.querySelector(\"[data-quota-bar]\");if(e){const l=(e.dataset.api||\"\").replace(/\\/$/,\"\"),a=e.querySelector(\"[data-quota-remaining]\"),n=e.querySelector(\"[data-quota-limit]\"),i=e.querySelector(\"[data-quota-fill]\");async function o(){try{const r=await fetch(l+\"/api/quota\");if(!r.ok)return;const t=await r.json();if(typeof t.remaining!=\"number\"||typeof t.limit!=\"number\"||t.limit<=0)return;a&&(a.textContent=t.remaining.toLocaleString(\"ru-RU\")),n&&(n.textContent=t.limit.toLocaleString(\"ru-RU\"));const c=Math.max(0,Math.min(100,t.remaining/t.limit*100));i&&(i.style.width=c+\"%\",i.classList.toggle(\"is-low\",c<15)),e.removeAttribute(\"hidden\")}catch{}}o(),window.addEventListener(\"chat:answered\",o)}"],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/AudioDigest.astro?astro&type=script&index=0&lang.ts","function p(e){(!isFinite(e)||e<0)&&(e=0);const t=Math.floor(e/60),a=Math.floor(e%60);return`${t}:${a.toString().padStart(2,\"0\")}`}document.querySelectorAll(\"[data-audio-digest]\").forEach(e=>{const t=e.querySelector(\"[data-audio]\"),a=e.querySelector(\"[data-play]\"),c=e.querySelector(\"[data-icon-play]\"),s=e.querySelector(\"[data-icon-pause]\"),d=e.querySelector(\"[data-track]\"),l=e.querySelector(\"[data-fill]\"),o=e.querySelector(\"[data-current]\"),u=e.querySelector(\"[data-total]\");if(!t||!a||!c||!s||!d||!l||!o||!u)return;const r=()=>{const n=!t.paused&&!t.ended;c.classList.toggle(\"hidden\",n),s.classList.toggle(\"hidden\",!n),a.setAttribute(\"aria-label\",n?\"Пауза\":\"Слушать выжимку\")};a.addEventListener(\"click\",()=>{t.paused?t.play():t.pause()}),t.addEventListener(\"play\",r),t.addEventListener(\"pause\",r),t.addEventListener(\"ended\",r),t.addEventListener(\"loadedmetadata\",()=>{isFinite(t.duration)&&(u.textContent=p(t.duration))}),t.addEventListener(\"timeupdate\",()=>{const n=t.duration,i=isFinite(n)&&n>0?t.currentTime/n*100:0;l.style.width=`${i}%`,o.textContent=p(t.currentTime)}),d.addEventListener(\"click\",n=>{const i=t.duration;if(!isFinite(i)||i<=0)return;const y=d.getBoundingClientRect(),f=Math.min(1,Math.max(0,(n.clientX-y.left)/y.width));t.currentTime=f*i})});"],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/Plan.astro?astro&type=script&index=0&lang.ts","function S(t){const r=t.dataset.key,c=Array.from(t.querySelectorAll(\".plan-check\")),s=t.querySelector(\".plan-bar\"),h=t.querySelector(\"[data-done]\"),o=c.length;let n=[];try{n=JSON.parse(localStorage.getItem(r)??\"[]\")}catch{n=[]}function d(){const e=c.filter(a=>a.checked).length;h.textContent=String(e),s.style.width=o?`${e/o*100}%`:\"0%\"}c.forEach((e,a)=>{e.checked=n.includes(a),e.addEventListener(\"change\",()=>{const i=c.map((l,y)=>l.checked?y:-1).filter(l=>l>=0);try{localStorage.setItem(r,JSON.stringify(i))}catch{}d()})}),d()}document.querySelectorAll(\"[data-plan]\").forEach(S);"],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/Quiz.astro?astro&type=script&index=0&lang.ts","function x(s){const d=Array.from(s.querySelectorAll(\".quiz-q\")),f=s.querySelector(\"[data-answered]\"),q=s.querySelector(\"[data-score]\"),n=s.querySelector(\".quiz-result\"),m=s.querySelector(\"[data-final]\"),L=s.querySelector(\".quiz-result-msg\"),h=s.querySelector(\".quiz-retry\"),l=d.length;let c=0,a=0;function E(e,r){const t=e/r;return t===1?\"Идеально! Материал усвоен на отлично.\":t>=.6?\"Хороший результат — основное ты ухватил.\":t>=.3?\"Неплохо для старта. Стоит пробежаться по статье ещё раз.\":\"Самое время перечитать разбор — и попробовать снова.\"}function b(){c=0,a=0,f.textContent=\"0\",q.textContent=\"0\",n.classList.add(\"hidden\"),n.classList.remove(\"quiz-pass\",\"quiz-fail\"),d.forEach(e=>{e.dataset.done=\"\";const r=e.querySelector(\".quiz-feedback\");r.classList.add(\"hidden\"),r.classList.remove(\"quiz-fb-ok\",\"quiz-fb-bad\"),e.querySelectorAll(\".quiz-opt\").forEach(t=>{t.disabled=!1,t.classList.remove(\"quiz-ok\",\"quiz-bad\",\"quiz-muted\")})})}d.forEach(e=>{const r=Number(e.dataset.answer),t=Array.from(e.querySelectorAll(\".quiz-opt\")),i=e.querySelector(\".quiz-feedback\");t.forEach(z=>{z.addEventListener(\"click\",()=>{if(e.dataset.done)return;e.dataset.done=\"1\";const y=Number(z.dataset.index),u=y===r;t.forEach((o,S)=>{o.disabled=!0,S===r?o.classList.add(\"quiz-ok\"):S===y?o.classList.add(\"quiz-bad\"):o.classList.add(\"quiz-muted\")}),i.textContent=u?i.dataset.correct??\"\":i.dataset.wrong??\"\",i.classList.remove(\"hidden\"),i.classList.add(u?\"quiz-fb-ok\":\"quiz-fb-bad\"),c+=1,u&&(a+=1),f.textContent=String(c),q.textContent=String(a),c===l&&(m.textContent=String(a),L.textContent=E(a,l),n.classList.remove(\"hidden\"),n.classList.add(a/l>=.6?\"quiz-pass\":\"quiz-fail\"))})})}),h.addEventListener(\"click\",b)}document.querySelectorAll(\"[data-quiz]\").forEach(x);"],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/components/transcript/TranscriptNav.astro?astro&type=script&index=0&lang.ts","const r=document.querySelector(\"[data-reading-progress]\");let i=!1;function s(){if(i=!1,!r)return;const e=document.documentElement.scrollHeight-window.innerHeight,t=e>0?Math.min(1,Math.max(0,window.scrollY/e)):0;r.style.transform=`scaleX(${t})`}const d=Array.from(document.querySelectorAll(\"[data-toc-link]\")),c=d.map(e=>e.dataset.tocLink).filter((e,t,f)=>e&&f.indexOf(e)===t).map(e=>document.getElementById(e)).filter(e=>!!e);function l(){let e=c[0]?.id??\"\";for(const t of c)if(t.getBoundingClientRect().top<=140)e=t.id;else break;d.forEach(t=>t.classList.toggle(\"is-active\",t.dataset.tocLink===e))}function u(){i||(i=!0,requestAnimationFrame(()=>{s(),l()}))}window.addEventListener(\"scroll\",u,{passive:!0});window.addEventListener(\"resize\",u,{passive:!0});s();l();const o=document.querySelector(\"[data-toc-toggle]\"),n=document.querySelector(\"[data-toc-panel]\");function a(e){!n||!o||(n.hidden=!e,o.setAttribute(\"aria-expanded\",String(e)))}o?.addEventListener(\"click\",e=>{e.stopPropagation(),a(n?.hidden??!1)});n?.addEventListener(\"click\",e=>{e.target?.closest(\"a\")&&a(!1)});document.addEventListener(\"click\",e=>{n&&!n.hidden&&!e.target?.closest(\"[data-toc]\")&&a(!1)});"],["/Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/src/pages/transcripts/index.astro?astro&type=script&index=0&lang.ts","const h=document.querySelector(\"[data-tag-filter]\"),k=document.querySelector(\"[data-kind-filter]\"),S=Array.from(document.querySelectorAll(\"[data-grid] [data-tags]\")),q=document.querySelector(\"[data-empty]\");if(h||k){let r=function(){let t=0;S.forEach(i=>{const c=s===\"*\"||(i.dataset.tags??\"\").split(\" \").includes(s),a=n===\"*\"||i.dataset.kind===n,e=c&&a;i.classList.toggle(\"hidden\",!e),e&&(t+=1)}),q?.classList.toggle(\"hidden\",t>0)},m=function(){const t=new URL(location.href);s===\"*\"?t.searchParams.delete(\"tag\"):t.searchParams.set(\"tag\",s),n===\"*\"?t.searchParams.delete(\"kind\"):t.searchParams.set(\"kind\",n),history.replaceState(null,\"\",t)},o=function(t,i,c){if(!t)return null;const a=Array.from(t.querySelectorAll(\".tag-chip\"));return a.forEach(e=>e.addEventListener(\"click\",()=>{const L=e.dataset[i];a.forEach(u=>u.classList.toggle(\"is-active\",u===e)),c(L),r(),m()})),a},s=\"*\",n=\"*\";const y=o(h,\"tag\",t=>s=t),p=o(k,\"kind\",t=>n=t),l=new URLSearchParams(location.search),d=l.get(\"tag\"),g=l.get(\"kind\"),f=(t,i,c)=>{if(!t||!c)return!1;const a=t.find(e=>e.dataset[i]===c);return a?(t.forEach(e=>e.classList.toggle(\"is-active\",e===a)),!0):!1};f(y,\"tag\",d)&&(s=d),f(p,\"kind\",g)&&(n=g),(s!==\"*\"||n!==\"*\")&&r()}"]],"assets":["/file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/chats/index.html","/file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/posts/index.html","/file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/transcripts/index.html","/file:///Users/kirilleremin/Documents/dev/neuro-slop.ru/dev/dist/index.html"],"buildFormat":"directory","checkOrigin":false,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"kS6vJfosRqWMPhsTxxNUcuTnR9CCD4zuni/0uO3LXBM="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
