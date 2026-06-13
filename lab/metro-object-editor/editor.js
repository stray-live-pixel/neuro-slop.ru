/* СГЕНЕРИРОВАНО из src/editor/ — не редактировать руками. Сборка: npm run build:editor */
"use strict";
(() => {
  // src/gfx/context.ts
  var canvas = document.getElementById("c");
  var glOrNull = canvas.getContext("webgl", { antialias: false });
  if (!glOrNull) {
    document.getElementById("startScreen").innerHTML = "<h1>WebGL не поддерживается</h1>";
    throw new Error("WebGL не поддерживается");
  }
  var gl = glOrNull;
  var RENDER_DPR = 0.5;
  var sceneSize = { w: 1, h: 1 };
  var onResize = [];
  function resize() {
    canvas.width = Math.max(1, Math.round(innerWidth));
    canvas.height = Math.max(1, Math.round(innerHeight));
    sceneSize.w = Math.max(1, Math.round(innerWidth * RENDER_DPR));
    sceneSize.h = Math.max(1, Math.round(innerHeight * RENDER_DPR));
    for (const f of onResize) f();
  }
  addEventListener("resize", resize);
  resize();

  // src/gfx/shaders.ts
  var ATTR = { aPos: 0, aNorm: 1, aCol: 2, aM0: 3, aM1: 4, aM2: 5, aM3: 6, aTintEm: 7 };
  var VSH = `
attribute vec3 aPos; attribute vec3 aNorm; attribute vec4 aCol;
uniform mat4 uProj, uView, uModel;
uniform vec3 uTint; uniform float uEmissive;
varying vec3 vWorld, vNorm; varying vec4 vCol; varying vec4 vTintEm;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorld = wp.xyz;
  vNorm = (uModel * vec4(aNorm, 0.0)).xyz;
  vCol = aCol;
  vTintEm = vec4(uTint, uEmissive);
  gl_Position = uProj * uView * wp;
}`;
  var FSH = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vWorld, vNorm; varying vec4 vCol; varying vec4 vTintEm;
uniform vec3 uLightPos[16];
uniform vec3 uLightCol[16];
uniform int  uLightCount;
uniform vec3 uCamPos;
uniform float uProc; // 1 = статичная карта (процедурные материалы)
uniform vec3 uAmbient;  // фоновый свет (метро тёмное / улица — луна)
uniform float uFogDen;  // плотность тумана
uniform vec3 uFogCol;   // цвет тумана (= clearColor кадра)
uniform vec3 uSunDir;   // направление НА солнце/луну (нормированное)
uniform vec3 uSunCol;   // цвет направленного света; renderer гасит его в метро
uniform vec3 uFlashPos; // фонарик игрока: позиция (глаз),
uniform vec3 uFlashDir; // направление взгляда,
uniform float uFlashI;  // интенсивность (0 = выключен)

// Хеш и value-noise — вся «текстура» считается из мировых координат
float hash(vec3 p){
  p = fract(p*0.3183 + vec3(0.11,0.27,0.39));
  p *= 17.0;
  return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}
float noise(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f*f*(3.0-2.0*f);
  return mix(
    mix(mix(hash(i),               hash(i+vec3(1.,0.,0.)), f.x),
        mix(hash(i+vec3(0.,1.,0.)),hash(i+vec3(1.,1.,0.)), f.x), f.y),
    mix(mix(hash(i+vec3(0.,0.,1.)),hash(i+vec3(1.,0.,1.)), f.x),
        mix(hash(i+vec3(0.,1.,1.)),hash(i+vec3(1.,1.,1.)), f.x), f.y), f.z);
}

void main(){
  vec3 n = normalize(vNorm);
  float matId = vCol.a;
  vec3 albedo = vCol.rgb * vTintEm.rgb;
  float gloss = 0.0, shin = 24.0;

  if(uProc > 0.5 && vTintEm.a < 0.5){
    // плоскостные координаты поверхности (для плитки и швов)
    vec2 suv = abs(n.y) > 0.5 ? vWorld.xz : (abs(n.x) > 0.5 ? vWorld.zy : vWorld.xy);
    float grime = noise(vWorld*0.33);            // крупные подтёки
    float grain = noise(vWorld*9.0);             // мелкое зерно
    if(matId < 0.5){
      // === бетон ===
      albedo *= 0.78 + 0.30*noise(vWorld*1.9);
      albedo *= 0.90 + 0.18*grain;
      albedo *= 1.0 - 0.38*smoothstep(0.52,0.80,grime);
      gloss = 0.07;
      if(n.y > 0.7){ // лужи на горизонтальных поверхностях
        float pud = smoothstep(0.60,0.74, noise(vWorld*0.5 + 7.0));
        gloss += pud*0.6; shin = mix(shin, 90.0, pud);
        albedo *= 1.0 - pud*0.3;
      }
    } else if(matId < 1.5){
      // === кафель со швами ===
      vec2 tc = fract(suv*1.6);
      float bx = smoothstep(0.0,0.05,tc.x)*(1.0-smoothstep(0.95,1.0,tc.x));
      float by = smoothstep(0.0,0.05,tc.y)*(1.0-smoothstep(0.95,1.0,tc.y));
      float inner = bx*by;
      albedo *= 0.50 + 0.50*inner;
      albedo *= 0.84 + 0.22*noise(vec3(floor(suv*1.6)*3.7, 2.0)); // вариация плиток
      albedo *= 1.0 - 0.42*smoothstep(0.5,0.85,grime);
      gloss = 0.5*inner; shin = 60.0;
    } else if(matId < 2.5){
      // === металл с ржавчиной ===
      float rust = smoothstep(0.42,0.72, noise(vWorld*2.3));
      albedo = mix(albedo, vec3(0.27,0.13,0.07)*(0.8+0.4*grain), rust);
      gloss = mix(0.65, 0.04, rust); shin = 36.0;
    }
  }

  vec3 V = normalize(uCamPos - vWorld);
  vec3 light = uAmbient*(0.7+0.3*max(n.y,0.0));
  // направленный свет неба: солнце днём / луна ночью (без теней — дёшево)
  light += uSunCol * (0.25 + 0.75*max(dot(n, uSunDir), 0.0));
  vec3 spec = vec3(0.0);
  // фонарик: спот-конус из глаза вдоль взгляда + слабый широкий ореол
  if(uFlashI > 0.001){
    vec3 fv = vWorld - uFlashPos;
    float fdist = max(length(fv), 0.001);
    vec3 FL = fv / fdist;
    float fc = dot(FL, uFlashDir);
    float cone = smoothstep(0.913, 0.978, fc) + 0.18*smoothstep(0.70, 0.913, fc);
    float fatt = uFlashI * cone / (1.0 + 0.045*fdist + 0.018*fdist*fdist);
    vec3 fcol = vec3(1.0, 0.94, 0.80) * fatt;
    light += fcol * (0.2 + 0.8*max(dot(n, -FL), 0.0));
    if(gloss > 0.01){
      vec3 fh = normalize(V - FL);
      spec += fcol * pow(max(dot(n,fh),0.0), shin) * gloss;
    }
  }
  for(int i=0;i<16;i++){
    if(i < uLightCount){
      vec3 d = uLightPos[i] - vWorld;
      float dist = max(length(d), 0.001);
      vec3 L = d/dist;
      float att = 1.0 / (1.0 + 0.10*dist + 0.05*dist*dist);
      float ndl = max(dot(n, L), 0.0);
      light += uLightCol[i] * att * (0.20 + 0.80*ndl);
      if(gloss > 0.01){
        vec3 h = normalize(L + V);
        spec += uLightCol[i] * att * pow(max(dot(n,h),0.0), shin) * gloss;
      }
    }
  }
  vec3 col = albedo*light + spec;
  col = mix(col, albedo, vTintEm.a);
  col = pow(1.0 - exp(-col*1.35), vec3(0.88));     // мягкий тонмаппинг
  float fog = 1.0 - exp(-uFogDen * length(uCamPos - vWorld));
  col = mix(col, uFogCol, fog);  // дымка; также прячет границу подгрузки чанков
  gl_FragColor = vec4(col, 1.0);
}`;
  function makeShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    return s;
  }
  function makeProgram(vsh, fsh) {
    const p = gl.createProgram();
    gl.attachShader(p, makeShader(gl.VERTEX_SHADER, vsh));
    gl.attachShader(p, makeShader(gl.FRAGMENT_SHADER, fsh));
    for (const name in ATTR) gl.bindAttribLocation(p, ATTR[name], name);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "program link failed");
    return p;
  }
  var prog = makeProgram(VSH, FSH);
  gl.useProgram(prog);
  var loc = {
    aPos: ATTR.aPos,
    aNorm: ATTR.aNorm,
    aCol: ATTR.aCol,
    uProj: gl.getUniformLocation(prog, "uProj"),
    uView: gl.getUniformLocation(prog, "uView"),
    uModel: gl.getUniformLocation(prog, "uModel"),
    uLightPos: gl.getUniformLocation(prog, "uLightPos"),
    uLightCol: gl.getUniformLocation(prog, "uLightCol"),
    uLightCount: gl.getUniformLocation(prog, "uLightCount"),
    uCamPos: gl.getUniformLocation(prog, "uCamPos"),
    uTint: gl.getUniformLocation(prog, "uTint"),
    uEmissive: gl.getUniformLocation(prog, "uEmissive"),
    uProc: gl.getUniformLocation(prog, "uProc"),
    uAmbient: gl.getUniformLocation(prog, "uAmbient"),
    uFogDen: gl.getUniformLocation(prog, "uFogDen"),
    uFogCol: gl.getUniformLocation(prog, "uFogCol"),
    uSunDir: gl.getUniformLocation(prog, "uSunDir"),
    uSunCol: gl.getUniformLocation(prog, "uSunCol"),
    uFlashPos: gl.getUniformLocation(prog, "uFlashPos"),
    uFlashDir: gl.getUniformLocation(prog, "uFlashDir"),
    uFlashI: gl.getUniformLocation(prog, "uFlashI")
  };
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(8e-3, 0.01, 0.018, 1);

  // src/gfx/mesh.ts
  var FACES = [
    [[0, 1, 0], [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]], 1],
    [[0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], 0.4],
    [[1, 0, 0], [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]], 0.8],
    [[-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], 0.72],
    [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], 0.88],
    [[0, 0, -1], [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]], 0.66]
  ];
  function pushBox(arr, cx, cy, cz, sx, sy, sz, col, mat, g) {
    for (const [n, corners, shade] of FACES) {
      const idx = [0, 1, 2, 0, 2, 3];
      for (const i of idx) {
        const v = corners[i];
        arr.push(
          cx + v[0] * sx / 2,
          cy + v[1] * sy / 2,
          cz + v[2] * sz / 2,
          n[0],
          n[1],
          n[2],
          col[0] * shade * g,
          col[1] * shade * g,
          col[2] * shade * g,
          mat || 0
        );
      }
    }
  }
  var STRIDE = 40;
  function makeMesh(arr) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    return { buf, count: arr.length / 10 };
  }
  function bindMesh(mesh) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
    gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, STRIDE, 0);
    gl.vertexAttribPointer(loc.aNorm, 3, gl.FLOAT, false, STRIDE, 12);
    gl.vertexAttribPointer(loc.aCol, 4, gl.FLOAT, false, STRIDE, 24);
    gl.enableVertexAttribArray(loc.aPos);
    gl.enableVertexAttribArray(loc.aNorm);
    gl.enableVertexAttribArray(loc.aCol);
  }
  var cubeArr = [];
  pushBox(cubeArr, 0, 0, 0, 1, 1, 1, [1, 1, 1], 0, 1);
  var cubeMesh = makeMesh(cubeArr);

  // src/core/math.ts
  var POOL = [];
  var poolIdx = 0;
  function alloc() {
    let m = POOL[poolIdx];
    if (m === void 0) {
      m = new Float32Array(16);
      POOL.push(m);
    }
    poolIdx++;
    return m;
  }
  function resetMatrixPool() {
    poolIdx = 0;
  }
  function m4Ident() {
    const m = alloc();
    m.fill(0);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
  }
  function m4Mul(a, b) {
    const o2 = alloc();
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o2[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o2;
  }
  function m4Persp(fovy, aspect, n, f) {
    const t = 1 / Math.tan(fovy / 2), m = alloc();
    m.fill(0);
    m[0] = t / aspect;
    m[5] = t;
    m[10] = (f + n) / (n - f);
    m[11] = -1;
    m[14] = 2 * f * n / (n - f);
    return m;
  }
  function m4Trans(x, y, z) {
    const m = m4Ident();
    m[12] = x;
    m[13] = y;
    m[14] = z;
    return m;
  }
  function m4Scale(x, y, z) {
    const m = m4Ident();
    m[0] = x;
    m[5] = y;
    m[10] = z;
    return m;
  }

  // src/core/ray.ts
  function rayBox(ox, oy, oz, dx, dy, dz, b, info) {
    let tmin = 0, tmax = 1e9, axis = -1, sign = 0;
    let t1, t2, s, tmp;
    if (Math.abs(dx) < 1e-9) {
      if (ox < b.x0 || ox > b.x1) return Infinity;
    } else {
      t1 = (b.x0 - ox) / dx;
      t2 = (b.x1 - ox) / dx;
      s = dx > 0 ? -1 : 1;
      if (t1 > t2) {
        tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = 0;
        sign = s;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
    if (Math.abs(dy) < 1e-9) {
      if (oy < b.y0 || oy > b.y1) return Infinity;
    } else {
      t1 = (b.y0 - oy) / dy;
      t2 = (b.y1 - oy) / dy;
      s = dy > 0 ? -1 : 1;
      if (t1 > t2) {
        tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = 1;
        sign = s;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
    if (Math.abs(dz) < 1e-9) {
      if (oz < b.z0 || oz > b.z1) return Infinity;
    } else {
      t1 = (b.z0 - oz) / dz;
      t2 = (b.z1 - oz) / dz;
      s = dz > 0 ? -1 : 1;
      if (t1 > t2) {
        tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = 2;
        sign = s;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
    if (info) {
      info.axis = axis;
      info.sign = sign;
    }
    return tmin;
  }

  // src/editor-common/camera.ts
  var FOV = 1.05;
  var cam = { tx: 0, ty: 0, tz: 0, yaw: 0.8, pitch: 0.55, dist: 34 };
  var eye = [0, 0, 0];
  var fwd = [0, 0, 0];
  var right = [0, 0, 0];
  var up = [0, 0, 0];
  function updCam() {
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    eye[0] = cam.tx + cam.dist * cp * sy;
    eye[1] = cam.ty + cam.dist * sp;
    eye[2] = cam.tz + cam.dist * cp * cy;
    fwd[0] = -cp * sy;
    fwd[1] = -sp;
    fwd[2] = -cp * cy;
    right[0] = cy;
    right[1] = 0;
    right[2] = -sy;
    up[0] = -sp * sy;
    up[1] = cp;
    up[2] = -sp * cy;
  }
  function viewMatrix() {
    const m = m4Ident();
    m[0] = right[0];
    m[4] = right[1];
    m[8] = right[2];
    m[1] = up[0];
    m[5] = up[1];
    m[9] = up[2];
    m[2] = -fwd[0];
    m[6] = -fwd[1];
    m[10] = -fwd[2];
    m[12] = -(right[0] * eye[0] + right[1] * eye[1] + right[2] * eye[2]);
    m[13] = -(up[0] * eye[0] + up[1] * eye[1] + up[2] * eye[2]);
    m[14] = fwd[0] * eye[0] + fwd[1] * eye[1] + fwd[2] * eye[2];
    return m;
  }
  var R = { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 0 };
  function mouseRay(mx, my) {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const ndcX = mx / w * 2 - 1, ndcY = 1 - my / h * 2;
    const ty = Math.tan(FOV / 2), tx = ty * w / h;
    const dx = fwd[0] + right[0] * ndcX * tx + up[0] * ndcY * ty;
    const dy = fwd[1] + right[1] * ndcX * tx + up[1] * ndcY * ty;
    const dz = fwd[2] + right[2] * ndcX * tx + up[2] * ndcY * ty;
    const il = 1 / Math.hypot(dx, dy, dz);
    R.ox = eye[0];
    R.oy = eye[1];
    R.oz = eye[2];
    R.dx = dx * il;
    R.dy = dy * il;
    R.dz = dz * il;
  }
  var slabHit = { axis: -1, sign: 0 };
  function raySlab(x0, y0, z0, x1, y1, z1) {
    let tmin = 0, tmax = 1e9, axis = -1, sign = 0;
    let t1, t2, tmp;
    if (Math.abs(R.dx) < 1e-9) {
      if (R.ox < x0 || R.ox > x1) return Infinity;
    } else {
      t1 = (x0 - R.ox) / R.dx;
      t2 = (x1 - R.ox) / R.dx;
      if (t1 > t2) {
        tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = 0;
        sign = R.dx > 0 ? -1 : 1;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
    if (Math.abs(R.dy) < 1e-9) {
      if (R.oy < y0 || R.oy > y1) return Infinity;
    } else {
      t1 = (y0 - R.oy) / R.dy;
      t2 = (y1 - R.oy) / R.dy;
      if (t1 > t2) {
        tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = 1;
        sign = R.dy > 0 ? -1 : 1;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
    if (Math.abs(R.dz) < 1e-9) {
      if (R.oz < z0 || R.oz > z1) return Infinity;
    } else {
      t1 = (z0 - R.oz) / R.dz;
      t2 = (z1 - R.oz) / R.dz;
      if (t1 > t2) {
        tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = 2;
        sign = R.dz > 0 ? -1 : 1;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
    slabHit.axis = axis;
    slabHit.sign = sign;
    return tmin;
  }

  // src/editor-common/controls.ts
  var pointer = { mx: 0, my: 0, on: false, pickDirty: true };
  var drag = { btn: -1, x0: 0, y0: 0, moved: false, pan: false };
  var keys = /* @__PURE__ */ new Set();
  var o;
  function dragActive() {
    return drag.btn >= 0;
  }
  function needPick() {
    return pointer.pickDirty && pointer.on && drag.btn < 0;
  }
  function pickDone() {
    pointer.pickDirty = false;
  }
  function viewChanged() {
    var _a;
    pointer.pickDirty = true;
    (_a = o.onViewChange) == null ? void 0 : _a.call(o);
  }
  function initControls(opts) {
    o = opts;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("mousedown", (e) => {
      pointer.mx = e.clientX;
      pointer.my = e.clientY;
      pointer.on = true;
      if (e.button === 0) o.onLeftDown(pointer.mx, pointer.my);
      else if (e.button === 2 || e.button === 1) {
        drag.btn = e.button;
        drag.x0 = pointer.mx;
        drag.y0 = pointer.my;
        drag.moved = false;
        drag.pan = e.button === 1 || e.shiftKey;
        if (e.button === 1) e.preventDefault();
      }
    });
    document.addEventListener("mousemove", (e) => {
      var _a;
      if (drag.btn >= 0) {
        const dx = e.clientX - pointer.mx, dy = e.clientY - pointer.my;
        if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 4) drag.moved = true;
        if (drag.pan) {
          const k = cam.dist * 16e-4;
          const fl = Math.hypot(fwd[0], fwd[2]) || 1;
          cam.tx += (-right[0] * dx + fwd[0] / fl * dy) * k;
          cam.tz += (-right[2] * dx + fwd[2] / fl * dy) * k;
          (_a = o.clampTarget) == null ? void 0 : _a.call(o);
        } else {
          cam.yaw -= dx * 6e-3;
          cam.pitch = Math.min(1.5, Math.max(o.pitchMin, cam.pitch + dy * 6e-3));
        }
        viewChanged();
      }
      pointer.mx = e.clientX;
      pointer.my = e.clientY;
      pointer.on = e.target === canvas || drag.btn >= 0 || o.isPainting();
      if (o.isPainting()) o.onLeftMove(pointer.mx, pointer.my);
      else pointer.pickDirty = true;
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button === 0) o.onLeftUp();
      else if (e.button === drag.btn) {
        if (e.button === 2 && !drag.moved && e.target === canvas) o.onRightErase(e.clientX, e.clientY);
        drag.btn = -1;
        drag.moved = false;
      }
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      cam.dist = Math.min(o.zoomMax, Math.max(o.zoomMin, cam.dist * Math.exp(e.deltaY * 1e-3)));
      viewChanged();
    }, { passive: false });
    document.addEventListener("keydown", (e) => {
      if (document.activeElement instanceof HTMLInputElement) return;
      if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        o.onUndo();
      } else if (o.onKeyDown && o.onKeyDown(e)) {
      } else keys.add(e.code);
    });
    document.addEventListener("keyup", (e) => keys.delete(e.code));
  }
  function wasdPan(dt) {
    var _a;
    if (keys.size === 0) return;
    const sp = o.wasdSpeed(cam.dist) * dt;
    const fl = Math.hypot(fwd[0], fwd[2]) || 1;
    const fx = fwd[0] / fl, fz = fwd[2] / fl;
    let moved = false;
    if (keys.has("KeyW")) {
      cam.tx += fx * sp;
      cam.tz += fz * sp;
      moved = true;
    }
    if (keys.has("KeyS")) {
      cam.tx -= fx * sp;
      cam.tz -= fz * sp;
      moved = true;
    }
    if (keys.has("KeyA")) {
      cam.tx -= right[0] * sp;
      cam.tz -= right[2] * sp;
      moved = true;
    }
    if (keys.has("KeyD")) {
      cam.tx += right[0] * sp;
      cam.tz += right[2] * sp;
      moved = true;
    }
    if (!moved) return;
    (_a = o.clampTarget) == null ? void 0 : _a.call(o);
    viewChanged();
  }

  // src/editor-common/draw.ts
  var WHITE = [1, 1, 1];
  function setupAtmosphere(fogCol, ambient, fogDen) {
    gl.clearColor(fogCol[0], fogCol[1], fogCol[2], 1);
    gl.uniform1i(loc.uLightCount, 0);
    gl.uniform1f(loc.uFlashI, 0);
    gl.uniform3f(loc.uAmbient, ambient[0], ambient[1], ambient[2]);
    const sl = Math.hypot(0.45, 0.8, 0.35);
    gl.uniform3f(loc.uSunDir, 0.45 / sl, 0.8 / sl, 0.35 / sl);
    gl.uniform3f(loc.uSunCol, 0.62, 0.58, 0.5);
    gl.uniform1f(loc.uFogDen, fogDen);
    gl.uniform3f(loc.uFogCol, fogCol[0], fogCol[1], fogCol[2]);
  }
  function beginView(near, far) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(loc.uProj, false, m4Persp(FOV, canvas.width / Math.max(1, canvas.height), near, far));
    gl.uniformMatrix4fv(loc.uView, false, viewMatrix());
    gl.uniform3f(loc.uCamPos, eye[0], eye[1], eye[2]);
  }
  function drawMesh(mesh, model, proc, tint, em) {
    gl.uniformMatrix4fv(loc.uModel, false, model);
    gl.uniform1f(loc.uProc, proc);
    gl.uniform3f(loc.uTint, tint[0], tint[1], tint[2]);
    gl.uniform1f(loc.uEmissive, em);
    bindMesh(mesh);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  // src/editor-common/ui.ts
  function cssCol(c) {
    const f = (v) => Math.round(255 * Math.min(1, Math.pow(v, 0.45)));
    return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`;
  }
  function addRow(parent, color, label, onSel) {
    const d = document.createElement("div");
    d.className = "row";
    d.innerHTML = `<span class="chip" style="background:${color}"></span>${label}`;
    d.addEventListener("click", onSel);
    parent.appendChild(d);
    return d;
  }
  var statusEl = document.getElementById("status");
  var statusCache = "";
  function setStatus(s) {
    if (s !== statusCache) {
      statusCache = s;
      statusEl.textContent = s;
    }
  }
  function lsSet(key, v) {
    try {
      localStorage.setItem(key, v);
    } catch {
    }
  }
  function lsGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function downloadText(filename, text, mime) {
    const a = document.createElement("a");
    a.href = `data:${mime};charset=utf-8,` + encodeURIComponent(text);
    a.download = filename;
    a.click();
  }
  function bindOpenButton(onText) {
    const fileInput = document.getElementById("fileInput");
    document.getElementById("openBtn").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      f.text().then((text) => {
        try {
          onText(text);
        } catch (err) {
          alert("Не удалось открыть файл: " + err);
        }
        fileInput.value = "";
      });
    });
  }

  // assets/blocks.json
  var blocks_default = {
    format: "metro-blocks",
    version: 1,
    types: [
      { id: "concrete", name: "Бетон", col: [0.45, 0.46, 0.48], surface: 0 },
      { id: "concrete_dark", name: "Бетон тёмный", col: [0.26, 0.27, 0.3], surface: 0 },
      { id: "panel", name: "Панель", col: [0.42, 0.44, 0.47], surface: 0 },
      { id: "brick_red", name: "Кирпич", col: [0.38, 0.2, 0.14], surface: 0 },
      { id: "brick_white", name: "Кирпич белый", col: [0.55, 0.52, 0.46], surface: 0 },
      { id: "asphalt", name: "Асфальт", col: [0.21, 0.215, 0.225], surface: 0 },
      { id: "road", name: "Дорога", col: [0.125, 0.125, 0.135], surface: 0 },
      { id: "marking", name: "Разметка", col: [0.55, 0.55, 0.48], surface: 0 },
      { id: "tile_white", name: "Кафель белый", col: [0.62, 0.64, 0.66], surface: 1 },
      { id: "tile_green", name: "Кафель зелёный", col: [0.3, 0.52, 0.42], surface: 1 },
      { id: "tile_blue", name: "Кафель синий", col: [0.25, 0.38, 0.6], surface: 1 },
      { id: "metal", name: "Металл", col: [0.45, 0.47, 0.52], surface: 2 },
      { id: "metal_dark", name: "Металл тёмный", col: [0.2, 0.22, 0.26], surface: 2 },
      { id: "wood", name: "Дерево", col: [0.4, 0.28, 0.16], surface: 0 },
      { id: "wood_dark", name: "Дерево тёмное", col: [0.25, 0.17, 0.1], surface: 0 },
      { id: "glass", name: "Стекло", col: [0.045, 0.055, 0.085], surface: 0 },
      { id: "roof", name: "Крыша", col: [0.18, 0.18, 0.19], surface: 0 },
      { id: "grass", name: "Трава", col: [0.1, 0.2, 0.08], surface: 0 },
      { id: "dirt", name: "Земля", col: [0.22, 0.16, 0.1], surface: 0 },
      { id: "sand", name: "Песок", col: [0.42, 0.38, 0.27], surface: 0 },
      { id: "wall_shop", name: "Стена магазина", col: [0.46, 0.45, 0.42], surface: 0 },
      { id: "wall_shelter", name: "Стена убежища", col: [0.33, 0.35, 0.33], surface: 0 },
      { id: "wall_lobby", name: "Стена вестибюля", col: [0.36, 0.44, 0.4], surface: 0 },
      { id: "window", name: "Окно (панель)", col: [0.42, 0.44, 0.47], surface: 0, shape: "window" },
      { id: "window_brick", name: "Окно (кирпич)", col: [0.38, 0.2, 0.14], surface: 0, shape: "window" },
      { id: "window_shop", name: "Окно (магазин)", col: [0.46, 0.45, 0.42], surface: 0, shape: "window" },
      { id: "window_shelter", name: "Окно (убежище)", col: [0.33, 0.35, 0.33], surface: 0, shape: "window" },
      { id: "window_lobby", name: "Окно (вестибюль)", col: [0.36, 0.44, 0.4], surface: 0, shape: "window" },
      { id: "door", name: "Дверь", col: [0.42, 0.44, 0.47], surface: 0, shape: "door", solid: false },
      { id: "storefront", name: "Витрина", col: [0.46, 0.45, 0.42], surface: 0, shape: "storefront" },
      { id: "stairs", name: "Лестница", col: [0.36, 0.38, 0.43], surface: 0, shape: "stairs" },
      { id: "floor_slab", name: "Перекрытие", col: [0.3, 0.28, 0.25], surface: 0, shape: "slab" },
      { id: "roof_slab", name: "Крыша (плита)", col: [0.18, 0.18, 0.19], surface: 0, shape: "slab" }
    ]
  };

  // assets/props.json
  var props_default = {
    format: "metro-props",
    version: 1,
    _note: "Пропс — декор из боксов: p=центр от опоры, s=размер, col=альбедо, surface=материал (0 бетон/1 кафель/2 металл). light (опц.) → лампа-маркер при запекании. Порядок типов = индексы; менять осторожно (на них ссылаются палитра редактора и тесты).",
    types: [
      { id: "car_red", name: "Машина красная", boxes: [
        { p: [0, 0.62, 0], s: [4.3, 0.75, 1.85], col: [0.45, 0.12, 0.1], surface: 2 },
        { p: [-0.35, 1.3, 0], s: [2, 0.62, 1.6], col: [0.225, 0.06, 0.055], surface: 2 },
        { p: [-0.35, 1.32, 0], s: [1.7, 0.46, 1.66], col: [0.045, 0.055, 0.085] },
        { p: [-1.4, 0.3, -0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [-1.4, 0.3, 0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [1.4, 0.3, -0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [1.4, 0.3, 0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] }
      ] },
      { id: "car_blue", name: "Машина синяя", boxes: [
        { p: [0, 0.62, 0], s: [4.3, 0.75, 1.85], col: [0.14, 0.22, 0.38], surface: 2 },
        { p: [-0.35, 1.3, 0], s: [2, 0.62, 1.6], col: [0.07, 0.11, 0.209], surface: 2 },
        { p: [-0.35, 1.32, 0], s: [1.7, 0.46, 1.66], col: [0.045, 0.055, 0.085] },
        { p: [-1.4, 0.3, -0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [-1.4, 0.3, 0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [1.4, 0.3, -0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [1.4, 0.3, 0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] }
      ] },
      { id: "car_gray", name: "Машина серая", boxes: [
        { p: [0, 0.62, 0], s: [4.3, 0.75, 1.85], col: [0.4, 0.4, 0.42], surface: 2 },
        { p: [-0.35, 1.3, 0], s: [2, 0.62, 1.6], col: [0.2, 0.2, 0.231], surface: 2 },
        { p: [-0.35, 1.32, 0], s: [1.7, 0.46, 1.66], col: [0.045, 0.055, 0.085] },
        { p: [-1.4, 0.3, -0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [-1.4, 0.3, 0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [1.4, 0.3, -0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] },
        { p: [1.4, 0.3, 0.8], s: [0.62, 0.6, 0.3], col: [0.06, 0.06, 0.07] }
      ] },
      { id: "tree", name: "Дерево", boxes: [
        { p: [0, 1.3, 0], s: [0.28, 2.6, 0.28], col: [0.23, 0.16, 0.1] },
        { p: [0, 3.3, 0], s: [2, 1.7, 2], col: [0.07, 0.14, 0.06] },
        { p: [0, 4.3, 0], s: [1.2, 1.1, 1.2], col: [0.1, 0.18, 0.08] }
      ] },
      { id: "spruce", name: "Ель", boxes: [
        { p: [0, 0.5, 0], s: [0.22, 1, 0.22], col: [0.23, 0.16, 0.1] },
        { p: [0, 1.4, 0], s: [1.9, 1, 1.9], col: [0.07, 0.14, 0.06] },
        { p: [0, 2.3, 0], s: [1.4, 0.9, 1.4], col: [0.07, 0.14, 0.06] },
        { p: [0, 3.1, 0], s: [0.9, 0.8, 0.9], col: [0.1, 0.18, 0.08] },
        { p: [0, 3.75, 0], s: [0.4, 0.5, 0.4], col: [0.1, 0.18, 0.08] }
      ] },
      { id: "bush", name: "Куст", boxes: [
        { p: [0, 0.35, 0], s: [0.9, 0.7, 0.9], col: [0.07, 0.14, 0.06] },
        { p: [0.2, 0.75, 0.15], s: [0.5, 0.4, 0.5], col: [0.1, 0.18, 0.08] }
      ] },
      { id: "bench", name: "Лавочка", boxes: [
        { p: [0, 0.42, 0], s: [1.8, 0.07, 0.55], col: [0.38, 0.26, 0.14] },
        { p: [0, 0.75, -0.24], s: [1.8, 0.45, 0.06], col: [0.38, 0.26, 0.14] },
        { p: [-0.75, 0.19, 0], s: [0.07, 0.38, 0.5], col: [0.2, 0.22, 0.26], surface: 2 },
        { p: [0.75, 0.19, 0], s: [0.07, 0.38, 0.5], col: [0.2, 0.22, 0.26], surface: 2 }
      ] },
      { id: "fence_wood", name: "Забор деревянный", boxes: [
        { p: [-0.5, 0.4, 0], s: [0.09, 0.8, 0.09], col: [0.38, 0.26, 0.14] },
        { p: [0, 0.32, 0], s: [1, 0.07, 0.05], col: [0.38, 0.26, 0.14] },
        { p: [0, 0.62, 0], s: [1, 0.07, 0.05], col: [0.38, 0.26, 0.14] },
        { p: [-0.25, 0.45, 0.05], s: [0.11, 0.62, 0.03], col: [0.38, 0.26, 0.14] },
        { p: [0, 0.45, 0.05], s: [0.11, 0.62, 0.03], col: [0.38, 0.26, 0.14] },
        { p: [0.25, 0.45, 0.05], s: [0.11, 0.62, 0.03], col: [0.38, 0.26, 0.14] }
      ] },
      { id: "fence_metal", name: "Забор металлический", boxes: [
        { p: [-0.5, 1.1, 0], s: [0.1, 2.2, 0.1], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [0, 0.25, 0], s: [1, 0.06, 0.04], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [0, 2.05, 0], s: [1, 0.06, 0.04], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [-0.375, 1.15, 0], s: [0.045, 1.9, 0.045], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [-0.125, 1.15, 0], s: [0.045, 1.9, 0.045], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [0.125, 1.15, 0], s: [0.045, 1.9, 0.045], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [0.375, 1.15, 0], s: [0.045, 1.9, 0.045], col: [0.3, 0.32, 0.36], surface: 2 }
      ] },
      { id: "lamp", name: "Фонарь", boxes: [
        { p: [0, 2.3, 0], s: [0.16, 4.6, 0.16], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [0.35, 4.55, 0], s: [0.9, 0.1, 0.14], col: [0.3, 0.32, 0.36], surface: 2 },
        { p: [0.7, 4.4, 0], s: [0.34, 0.2, 0.26], col: [1.1, 0.78, 0.42] }
      ], light: { col: [1.1, 0.78, 0.42], y: 4.4, fl: 0, lampKind: 1 } },
      { id: "bin", name: "Мусорный бак", boxes: [
        { p: [0, 0.45, 0], s: [0.55, 0.9, 0.55], col: [0.2, 0.3, 0.24], surface: 2 },
        { p: [0, 0.93, 0], s: [0.62, 0.08, 0.62], col: [0.15, 0.22, 0.18], surface: 2 }
      ] },
      { id: "sandbags", name: "Мешки песка", boxes: [
        { p: [0, 0.38, 0], s: [0.96, 0.76, 0.96], col: [0.42, 0.38, 0.27] },
        { p: [0, 0.93, 0], s: [0.7, 0.34, 0.7], col: [0.42, 0.38, 0.27] }
      ] },
      { id: "barrier", name: "Блок бетонный", boxes: [
        { p: [0, 0.15, 0], s: [1.7, 0.3, 0.6], col: [0.4, 0.41, 0.43] },
        { p: [0, 0.55, 0], s: [1.6, 0.5, 0.42], col: [0.45, 0.46, 0.48] }
      ] }
    ]
  };

  // src/world/objcat.ts
  var BLOCKS = blocks_default.types.map((t) => {
    var _a, _b, _c;
    return {
      id: t.id,
      label: t.name,
      col: t.col,
      mat: (_a = t.surface) != null ? _a : 0,
      shape: (_b = t.shape) != null ? _b : "cube",
      solid: (_c = t.solid) != null ? _c : true
    };
  });
  var PROPS = props_default.types.map((t) => ({
    id: t.id,
    label: t.name,
    boxes: t.boxes.map((b) => {
      var _a;
      return {
        p: [b.p[0], b.p[1], b.p[2]],
        s: [b.s[0], b.s[1], b.s[2]],
        col: b.col,
        mat: (_a = b.surface) != null ? _a : 0
      };
    }),
    light: t.light
  }));

  // src/world/shapes.ts
  var C_GLASS = [0.045, 0.055, 0.085];
  function rotXZ(x, z, rot2) {
    if (rot2 === 1) return [-z, x];
    if (rot2 === 2) return [-x, -z];
    if (rot2 === 3) return [z, -x];
    return [x, z];
  }
  function box(emit, rot2, cx, cy, cz, bx, by, bz, sx, sy, sz, col, mat, g, isBlock) {
    const [rbx, rbz] = rotXZ(bx, bz, rot2);
    const [rsx, rsz] = rot2 & 1 ? [sz, sx] : [sx, sz];
    emit(cx + rbx, cy + by, cz + rbz, rsx, sy, rsz, col, mat, g, isBlock);
  }
  var isShaped = (shape) => shape !== void 0 && shape !== "cube";
  function emitShape(shape, rot2, cx, cy, cz, col, mat, g, solid, emit) {
    switch (shape) {
      case void 0:
      case "cube":
        emit(cx, cy, cz, 1, 1, 1, col, mat, g, solid);
        return;
      case "slab":
        box(emit, rot2, cx, cy, cz, 0, -0.4, 0, 1, 0.2, 1, col, mat, g, true);
        return;
      case "window":
        emit(cx, cy, cz, 1, 1, 1, col, mat, g, true);
        box(emit, rot2, cx, cy, cz, 0, 0, 0, 0.78, 0.62, 1.06, C_GLASS, 0, 1, false);
        return;
      case "storefront":
        box(emit, rot2, cx, cy, cz, 0, -0.06, 0, 0.96, 0.86, 0.3, C_GLASS, 0, 1, true);
        box(emit, rot2, cx, cy, cz, 0, 0.44, 0, 1, 0.12, 1, col, mat, g, true);
        return;
      case "door":
        box(emit, rot2, cx, cy, cz, -0.43, 0, 0, 0.14, 1, 1, col, mat, g, false);
        box(emit, rot2, cx, cy, cz, 0.43, 0, 0, 0.14, 1, 1, col, mat, g, false);
        return;
      case "stairs":
        box(emit, rot2, cx, cy, cz, 0, -0.25, 0, 1, 0.5, 1, col, mat, g, true);
        box(emit, rot2, cx, cy, cz, 0.25, 0.25, 0, 0.5, 0.5, 1, col, mat, g, true);
        return;
      default:
        emit(cx, cy, cz, 1, 1, 1, col, mat, g, solid);
    }
  }

  // src/world/object.ts
  var GRID_N = 48;
  var GRID_H = 24;
  var HALF = GRID_N / 2;
  var propG = (gx, gz, t) => 0.85 + (gx * 13 + gz * 29 + t * 7) % 11 / 11 * 0.24;
  function rotXZ2(x, z, rot2) {
    if (rot2 === 1) return [-z, x];
    if (rot2 === 2) return [-x, -z];
    if (rot2 === 3) return [z, -x];
    return [x, z];
  }
  function emitProp(propIdx, rot2, ax, ay, az, g, emit) {
    const p = PROPS[propIdx];
    if (!p) return;
    for (const b of p.boxes) {
      const [rcx, rcz] = rotXZ2(b.p[0], b.p[2], rot2);
      const [rsx, rsz] = rot2 & 1 ? [b.s[2], b.s[0]] : [b.s[0], b.s[2]];
      emit(ax + rcx, ay + b.p[1], az + rcz, rsx, b.s[1], rsz, b.col, b.mat, g, false);
    }
  }
  function serializeObjectData(name, d) {
    const bts = [], btIdx = /* @__PURE__ */ new Map();
    const anyRot = d.blocks.some((b) => (b[4] | 0) !== 0);
    const blk = d.blocks.map(([gx, gy, gz, t, rot2]) => {
      let ti = btIdx.get(t);
      if (ti === void 0) {
        ti = bts.length;
        bts.push(BLOCKS[t].id);
        btIdx.set(t, ti);
      }
      return anyRot ? [gx, gy, gz, ti, rot2 | 0] : [gx, gy, gz, ti];
    });
    const pts = [], ptIdx = /* @__PURE__ */ new Map();
    const prp = d.props.map(([gx, gz, y, rot2, t]) => {
      let pi = ptIdx.get(t);
      if (pi === void 0) {
        pi = pts.length;
        pts.push(PROPS[t].id);
        ptIdx.set(t, pi);
      }
      return [gx, gz, y, rot2, pi];
    });
    return JSON.stringify({
      format: "metro-object",
      version: 2,
      name,
      size: [GRID_N, GRID_H, GRID_N],
      blockTypes: bts,
      blocks: blk,
      propTypes: pts,
      props: prp,
      ...d.markers && d.markers.length ? { markers: d.markers } : {}
    });
  }
  function parseObjectData(text) {
    return parseObjectValue(JSON.parse(text));
  }
  function parseObjectValue(j) {
    if (!j || j.format !== "metro-object") throw new Error("не формат metro-object");
    const btMap = (j.blockTypes || []).map((id) => BLOCKS.findIndex((b) => b.id === id));
    const ptMap = (j.propTypes || []).map((id) => PROPS.findIndex((p) => p.id === id));
    const blocks2 = [];
    const props2 = [];
    let skipped = 0;
    for (const [gx, gy, gz, ti, rot2] of j.blocks || []) {
      const t = btMap[ti];
      if (t === void 0 || t < 0) {
        skipped++;
        continue;
      }
      blocks2.push([gx, gy, gz, t, (rot2 | 0) & 3]);
    }
    for (const [gx, gz, y, rot2, pi] of j.props || []) {
      const t = ptMap[pi];
      if (t === void 0 || t < 0) {
        skipped++;
        continue;
      }
      props2.push([gx, gz, y, rot2 & 3, t]);
    }
    const markers = Array.isArray(j.markers) ? j.markers : [];
    return {
      name: typeof j.name === "string" ? j.name : "",
      data: { blocks: blocks2, props: props2, ...markers.length ? { markers } : {} },
      skipped
    };
  }

  // src/editor/store.ts
  var blocks = /* @__PURE__ */ new Map();
  var blockRot = /* @__PURE__ */ new Map();
  var props = [];
  var cellKey = (gx, gy, gz) => (gy * GRID_N + gz) * GRID_N + gx;
  var inBounds = (gx, gy, gz) => gx >= 0 && gx < GRID_N && gz >= 0 && gz < GRID_N && gy >= 0 && gy < GRID_H;
  function setBlock(gx, gy, gz, t, rot2 = 0) {
    if (!inBounds(gx, gy, gz) || t < 0 || t >= BLOCKS.length) return false;
    const k = cellKey(gx, gy, gz);
    if (blocks.get(k) === t && (blockRot.get(k) || 0) === (rot2 & 3)) return false;
    blocks.set(k, t);
    if (rot2 & 3) blockRot.set(k, rot2 & 3);
    else blockRot.delete(k);
    return true;
  }
  function delBlock(gx, gy, gz) {
    const k = cellKey(gx, gy, gz);
    blockRot.delete(k);
    return blocks.delete(k);
  }
  function addProp(t, gx, gz, y, rot2) {
    if (t < 0 || t >= PROPS.length || !inBounds(gx, 0, gz)) return false;
    props.push({ t, gx, gz, y, rot: rot2 & 3 });
    return true;
  }
  function clearAll() {
    blocks.clear();
    blockRot.clear();
    props.length = 0;
  }
  function toData() {
    const blk = [];
    for (const [k, t] of blocks) {
      const gx = k % GRID_N, gz = Math.floor(k / GRID_N) % GRID_N, gy = Math.floor(k / (GRID_N * GRID_N));
      blk.push([gx, gy, gz, t, blockRot.get(k) || 0]);
    }
    const prp = props.map((p) => [p.gx, p.gz, p.y, p.rot, p.t]);
    return { blocks: blk, props: prp };
  }
  function serialize(name) {
    return serializeObjectData(name, toData());
  }
  function deserialize(text) {
    const { name, data, skipped } = parseObjectData(text);
    clearAll();
    let dropped = skipped;
    for (const [gx, gy, gz, t, rot2] of data.blocks) if (!setBlock(gx, gy, gz, t, rot2)) dropped++;
    for (const [gx, gz, y, rot2, t] of data.props) if (!addProp(t, gx, gz, y, rot2)) dropped++;
    if (dropped > 0) console.warn(`редактор: пропущено элементов при загрузке: ${dropped}`);
    return name;
  }
  var undoStack = [];
  var UNDO_MAX = 100;
  function snapshot() {
    return serialize("");
  }
  function pushUndoSnap(s) {
    undoStack.push(s);
    if (undoStack.length > UNDO_MAX) undoStack.shift();
  }
  function undo() {
    const s = undoStack.pop();
    if (s === void 0) return false;
    deserialize(s);
    return true;
  }

  // src/editor/main.ts
  var IDX = [0, 1, 2, 0, 2, 3];
  var LSKEY = "metro-editor-autosave";
  Object.assign(cam, { tx: 0, ty: 1, tz: 0, yaw: 0.8, pitch: 0.55, dist: 34 });
  function buildBase() {
    const arr = [];
    pushBox(arr, 0, -0.12, 0, GRID_N, 0.22, GRID_N, [0.3, 0.31, 0.33], 0, 1);
    for (let i = 0; i <= GRID_N; i++) {
      const major = i % 8 === 0;
      const c = major ? [0.6, 0.64, 0.72] : [0.42, 0.44, 0.5];
      const w = major ? 0.04 : 0.022;
      pushBox(arr, i - HALF, 0, 0, w, 0.022, GRID_N, c, 0, 1);
      pushBox(arr, 0, 0, i - HALF, GRID_N, 0.022, w, c, 0, 1);
    }
    pushBox(arr, -HALF + 1, 0.06, -HALF, 2, 0.1, 0.1, [0.8, 0.15, 0.1], 0, 1);
    pushBox(arr, -HALF, 0.06, -HALF + 1, 0.1, 0.1, 2, [0.15, 0.3, 0.8], 0, 1);
    return makeMesh(arr);
  }
  var baseMesh = buildBase();
  var objMesh = null;
  var propAabbs = [];
  function buildPropInto(arr, p, origin) {
    const px = origin ? 0 : p.gx - HALF + 0.5;
    const pz = origin ? 0 : p.gz - HALF + 0.5;
    const py = origin ? 0 : p.y;
    const g = origin ? 1 : propG(p.gx, p.gz, p.t);
    const bb = { x0: 1e9, y0: 1e9, z0: 1e9, x1: -1e9, y1: -1e9, z1: -1e9 };
    emitProp(p.t, p.rot, px, py, pz, g, (wx, wy, wz, rsx, sy, rsz, col, mat, gg) => {
      pushBox(arr, wx, wy, wz, rsx, sy, rsz, col, mat, gg);
      bb.x0 = Math.min(bb.x0, wx - rsx / 2);
      bb.x1 = Math.max(bb.x1, wx + rsx / 2);
      bb.y0 = Math.min(bb.y0, wy - sy / 2);
      bb.y1 = Math.max(bb.y1, wy + sy / 2);
      bb.z0 = Math.min(bb.z0, wz - rsz / 2);
      bb.z1 = Math.max(bb.z1, wz + rsz / 2);
    });
    return bb;
  }
  function rebuild() {
    if (objMesh) {
      gl.deleteBuffer(objMesh.buf);
      objMesh = null;
    }
    const arr = [];
    for (const [k, t] of blocks) {
      const gx = k % GRID_N, gz = Math.floor(k / GRID_N) % GRID_N, gy = Math.floor(k / (GRID_N * GRID_N));
      const b = BLOCKS[t];
      const g = 0.86 + (gx * 31 + gy * 17 + gz * 7) % 13 / 13 * 0.22;
      const cx = gx - HALF + 0.5, cyc = gy + 0.5, cz = gz - HALF + 0.5;
      if (isShaped(b.shape)) {
        emitShape(
          b.shape,
          blockRot.get(k) || 0,
          cx,
          cyc,
          cz,
          b.col,
          b.mat,
          g,
          b.solid,
          (wx, wy, wz, sx, sy, sz, col, mat, gg) => pushBox(arr, wx, wy, wz, sx, sy, sz, col, mat, gg)
        );
        continue;
      }
      for (const [n, corners, shade] of FACES) {
        const nx = gx + n[0], ny = gy + n[1], nz = gz + n[2];
        const nb = blocks.get(cellKey(nx, ny, nz));
        if (inBounds(nx, ny, nz) && nb !== void 0 && !isShaped(BLOCKS[nb].shape)) continue;
        for (const i of IDX) {
          const v = corners[i];
          arr.push(
            cx + v[0] * 0.5,
            cyc + v[1] * 0.5,
            cz + v[2] * 0.5,
            n[0],
            n[1],
            n[2],
            b.col[0] * shade * g,
            b.col[1] * shade * g,
            b.col[2] * shade * g,
            b.mat
          );
        }
      }
    }
    propAabbs.length = 0;
    for (const p of props) propAabbs.push(buildPropInto(arr, p, false));
    if (arr.length > 0) objMesh = makeMesh(arr);
    pointer.pickDirty = true;
    updateStatus();
  }
  var previewMesh = null;
  function rebuildPreview() {
    if (previewMesh) {
      gl.deleteBuffer(previewMesh.buf);
      previewMesh = null;
    }
    if (selKind !== "prop") return;
    const arr = [];
    buildPropInto(arr, { t: selProp, gx: 0, gz: 0, y: 0, rot }, true);
    previewMesh = makeMesh(arr);
  }
  var selKind = "block";
  var selBlock = 0;
  var selProp = 0;
  var rot = 0;
  var erase = false;
  var hit = { kind: "ground", t: 0, gx: 0, gy: 0, gz: 0, axis: 1, sign: 1, px: 0, py: 0, pz: 0, propIdx: -1 };
  var hitValid = false;
  function pick(mx, my) {
    updCam();
    mouseRay(mx, my);
    let best = Infinity;
    hitValid = false;
    if (R.dy < -1e-6) {
      const t = -R.oy / R.dy;
      const px = R.ox + R.dx * t, pz = R.oz + R.dz * t;
      if (t > 0 && Math.abs(px) <= HALF && Math.abs(pz) <= HALF) {
        best = t;
        hitValid = true;
        hit.kind = "ground";
        hit.t = t;
        hit.axis = 1;
        hit.sign = 1;
        hit.px = px;
        hit.py = 0;
        hit.pz = pz;
        hit.propIdx = -1;
      }
    }
    for (const k of blocks.keys()) {
      const gx = k % GRID_N, gz = Math.floor(k / GRID_N) % GRID_N, gy = Math.floor(k / (GRID_N * GRID_N));
      const x0 = gx - HALF, z0 = gz - HALF;
      const t = raySlab(x0, gy, z0, x0 + 1, gy + 1, z0 + 1);
      if (t < best) {
        best = t;
        hitValid = true;
        hit.kind = "block";
        hit.t = t;
        hit.gx = gx;
        hit.gy = gy;
        hit.gz = gz;
        hit.axis = slabHit.axis;
        hit.sign = slabHit.sign;
        hit.px = R.ox + R.dx * t;
        hit.py = R.oy + R.dy * t;
        hit.pz = R.oz + R.dz * t;
        hit.propIdx = -1;
      }
    }
    for (let i = 0; i < propAabbs.length; i++) {
      const t = rayBox(R.ox, R.oy, R.oz, R.dx, R.dy, R.dz, propAabbs[i]);
      if (t < best) {
        best = t;
        hitValid = true;
        hit.kind = "prop";
        hit.t = t;
        hit.propIdx = i;
        hit.px = R.ox + R.dx * t;
        hit.py = R.oy + R.dy * t;
        hit.pz = R.oz + R.dz * t;
      }
    }
    return hitValid;
  }
  var target = { ok: false, gx: 0, gy: 0, gz: 0, y: 0 };
  function computeTarget() {
    target.ok = false;
    if (!hitValid || hit.kind === "prop") return;
    if (selKind === "block" && !erase) {
      let gx, gy, gz;
      if (hit.kind === "ground") {
        gx = Math.floor(hit.px + HALF);
        gy = 0;
        gz = Math.floor(hit.pz + HALF);
      } else {
        gx = hit.gx + (hit.axis === 0 ? hit.sign : 0);
        gy = hit.gy + (hit.axis === 1 ? hit.sign : 0);
        gz = hit.gz + (hit.axis === 2 ? hit.sign : 0);
      }
      if (!inBounds(gx, gy, gz) || blocks.has(cellKey(gx, gy, gz))) return;
      target.ok = true;
      target.gx = gx;
      target.gy = gy;
      target.gz = gz;
      target.y = gy;
    } else if (selKind === "prop" && !erase) {
      if (hit.kind === "block" && !(hit.axis === 1 && hit.sign > 0)) return;
      const gx = Math.floor(hit.px + HALF), gz = Math.floor(hit.pz + HALF);
      if (!inBounds(gx, 0, gz)) return;
      target.ok = true;
      target.gx = gx;
      target.gz = gz;
      target.gy = 0;
      target.y = hit.kind === "block" ? hit.gy + 1 : 0;
    }
  }
  var nameInput = document.getElementById("objName");
  function autosave() {
    lsSet(LSKEY, serialize(nameInput.value));
  }
  function updateStatus() {
    const sel = erase ? "ластик" : selKind === "block" ? `${BLOCKS[selBlock].label}${isShaped(BLOCKS[selBlock].shape) ? ` (${rot * 90}°)` : ""}` : `${PROPS[selProp].label} (${rot * 90}°)`;
    setStatus(`Блоков: ${blocks.size} · Объектов: ${props.length} · Инструмент: ${sel}`);
  }
  function commit() {
    rebuild();
    autosave();
  }
  var paint = { on: false, axis: 1, planeW: 0, ga: 0, lastKey: -1, snap: "", changed: false };
  function placeAtTarget() {
    if (!target.ok) return false;
    if (selKind === "block") {
      if (!setBlock(target.gx, target.gy, target.gz, selBlock, rot)) return false;
    } else {
      addProp(selProp, target.gx, target.gz, target.y, rot);
    }
    return true;
  }
  function beginPaint() {
    if (!hitValid || !target.ok) return;
    paint.snap = snapshot();
    paint.changed = false;
    if (hit.kind === "ground") {
      paint.axis = 1;
      paint.planeW = 0;
      paint.ga = 0;
    } else {
      paint.axis = hit.axis;
      const cell = hit.axis === 0 ? hit.gx : hit.axis === 1 ? hit.gy : hit.gz;
      const wg = cell + (hit.sign > 0 ? 1 : 0);
      paint.ga = hit.sign > 0 ? wg : wg - 1;
      paint.planeW = hit.axis === 1 ? wg : wg - HALF;
    }
    if (placeAtTarget()) {
      paint.changed = true;
      paint.lastKey = cellKey(target.gx, target.gy, target.gz);
      commit();
    }
    paint.on = true;
  }
  function movePaint(mx, my) {
    if (!paint.on) return;
    if (selKind === "prop" && paint.axis !== 1) return;
    updCam();
    mouseRay(mx, my);
    const o2 = [R.ox, R.oy, R.oz][paint.axis], d = [R.dx, R.dy, R.dz][paint.axis];
    if (Math.abs(d) < 1e-6) return;
    const t = (paint.planeW - o2) / d;
    if (t < 0.01) return;
    const px = R.ox + R.dx * t, py = R.oy + R.dy * t, pz = R.oz + R.dz * t;
    const gx = paint.axis === 0 ? paint.ga : Math.floor(px + HALF);
    const gy = paint.axis === 1 ? paint.ga : Math.floor(py);
    const gz = paint.axis === 2 ? paint.ga : Math.floor(pz + HALF);
    if (!inBounds(gx, gy, gz)) return;
    const k = cellKey(gx, gy, gz);
    if (k === paint.lastKey) return;
    let placed = false;
    if (selKind === "block") placed = setBlock(gx, gy, gz, selBlock, rot);
    else if (!blocks.has(k)) placed = addProp(selProp, gx, gz, paint.planeW, rot);
    if (placed) {
      paint.lastKey = k;
      paint.changed = true;
      commit();
    }
  }
  function endPaint() {
    if (paint.on && paint.changed) pushUndoSnap(paint.snap);
    paint.on = false;
  }
  function eraseAtCursor(mx, my) {
    if (!pick(mx, my) || hit.kind === "ground") return;
    const snap = snapshot();
    if (hit.kind === "block") delBlock(hit.gx, hit.gy, hit.gz);
    else props.splice(hit.propIdx, 1);
    pushUndoSnap(snap);
    commit();
  }
  var PAN_LIM = HALF + 10;
  initControls({
    zoomMin: 5,
    zoomMax: 140,
    pitchMin: 0.08,
    wasdSpeed: (dist) => Math.max(8, dist * 0.55),
    clampTarget: () => {
      cam.tx = Math.min(PAN_LIM, Math.max(-PAN_LIM, cam.tx));
      cam.tz = Math.min(PAN_LIM, Math.max(-PAN_LIM, cam.tz));
    },
    isPainting: () => paint.on,
    onLeftDown: (mx, my) => {
      pick(mx, my);
      computeTarget();
      if (erase) eraseAtCursor(mx, my);
      else beginPaint();
    },
    onLeftMove: (mx, my) => movePaint(mx, my),
    onLeftUp: () => endPaint(),
    onRightErase: (mx, my) => eraseAtCursor(mx, my),
    onUndo: () => {
      if (undo()) commit();
    },
    onKeyDown: (e) => {
      if (e.code === "KeyR") {
        rot = rot + 1 & 3;
        rebuildPreview();
        pointer.pickDirty = true;
        updateStatus();
        return true;
      }
      if (e.code === "KeyX") {
        setErase(!erase);
        return true;
      }
      return false;
    }
  });
  var rows = [];
  function markSel() {
    for (const r of rows) r.classList.remove("sel");
    if (!erase) rows[selKind === "block" ? selBlock : BLOCKS.length + selProp].classList.add("sel");
    document.getElementById("toolErase").classList.toggle("sel", erase);
    updateStatus();
  }
  function setErase(on) {
    erase = on;
    pointer.pickDirty = true;
    markSel();
  }
  var blockPal = document.getElementById("blockPal");
  BLOCKS.forEach((b, i) => rows.push(addRow(
    blockPal,
    cssCol(b.col),
    b.label,
    () => {
      selKind = "block";
      selBlock = i;
      rebuildPreview();
      setErase(false);
    }
  )));
  var propPal = document.getElementById("propPal");
  PROPS.forEach((p, i) => {
    var _a, _b;
    const c = (_b = (_a = p.boxes[0]) == null ? void 0 : _a.col) != null ? _b : [0.4, 0.4, 0.4];
    rows.push(addRow(
      propPal,
      cssCol(c),
      p.label,
      () => {
        selKind = "prop";
        selProp = i;
        rebuildPreview();
        setErase(false);
      }
    ));
  });
  document.getElementById("toolErase").addEventListener("click", () => setErase(!erase));
  document.getElementById("saveBtn").addEventListener("click", () => {
    const name = nameInput.value.trim() || "объект";
    downloadText(name + ".json", serialize(name), "application/json");
  });
  function objectTextFromFile(text) {
    let j;
    try {
      j = JSON.parse(text);
    } catch {
      return text;
    }
    if (j && j.format === "metro-map") {
      const ids = Object.keys(j.library || {});
      if (!ids.length) {
        alert("В карте нет объектов в библиотеке (импортируйте их в редакторе карты).");
        return null;
      }
      let id = ids[0];
      if (ids.length > 1) {
        const ans = prompt(`Какой объект открыть? id: ${ids.join(", ")}`, id);
        if (ans === null) return null;
        if (j.library[ans]) id = ans;
        else {
          alert("Нет объекта с таким id.");
          return null;
        }
      }
      return JSON.stringify(j.library[id]);
    }
    return text;
  }
  bindOpenButton((text) => {
    const objText = objectTextFromFile(text);
    if (objText === null) return;
    const snap = snapshot();
    let name;
    try {
      name = deserialize(objText);
    } catch {
      alert("Не удалось прочитать файл: ожидается объект (metro-object) или карта (map.json).");
      return;
    }
    if (name) nameInput.value = name;
    pushUndoSnap(snap);
    commit();
  });
  document.getElementById("newBtn").addEventListener("click", () => {
    if (blocks.size + props.length > 0 && !confirm("Очистить всю сцену?")) return;
    pushUndoSnap(snapshot());
    clearAll();
    commit();
  });
  setupAtmosphere([0.57, 0.66, 0.79], [0.4, 0.42, 0.46], 22e-4);
  var lastT = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const t = now / 1e3;
    const dt = Math.min(0.05, t - lastT || 0.016);
    lastT = t;
    wasdPan(dt);
    resetMatrixPool();
    updCam();
    if (needPick()) {
      pick(pointer.mx, pointer.my);
      computeTarget();
      pickDone();
    }
    beginView(0.1, 500);
    const ident = m4Ident();
    drawMesh(baseMesh, ident, 1, WHITE, 0);
    if (objMesh) drawMesh(objMesh, ident, 1, WHITE, 0);
    if (pointer.on && hitValid && !dragActive()) {
      const pulse = 0.4 + 0.15 * Math.sin(t * 6);
      if (erase && hit.kind !== "ground") {
        let m;
        if (hit.kind === "block") {
          m = m4Mul(m4Trans(hit.gx - HALF + 0.5, hit.gy + 0.5, hit.gz - HALF + 0.5), m4Scale(1.06, 1.06, 1.06));
        } else {
          const b = propAabbs[hit.propIdx];
          m = m4Mul(
            m4Trans((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2),
            m4Scale(b.x1 - b.x0 + 0.08, b.y1 - b.y0 + 0.08, b.z1 - b.z0 + 0.08)
          );
        }
        drawMesh(cubeMesh, m, 0, [1, 0.15, 0.1], 0.65);
      } else if (!erase && target.ok) {
        if (selKind === "block") {
          const m = m4Mul(m4Trans(target.gx - HALF + 0.5, target.gy + 0.5, target.gz - HALF + 0.5), m4Scale(1.002, 1.002, 1.002));
          drawMesh(cubeMesh, m, 0, BLOCKS[selBlock].col, pulse);
        } else if (previewMesh) {
          const m = m4Trans(target.gx - HALF + 0.5, target.y, target.gz - HALF + 0.5);
          drawMesh(previewMesh, m, 0, [1.15, 1.15, 1.15], 0.3);
        }
      }
    }
  }
  var saved = lsGet(LSKEY);
  if (saved) {
    try {
      nameInput.value = deserialize(saved) || nameInput.value;
    } catch {
    }
  }
  rebuildPreview();
  rebuild();
  markSel();
  requestAnimationFrame(frame);
  window.__editor = {
    blockCount: () => blocks.size,
    propCount: () => props.length,
    place(gx, gy, gz, t) {
      const ok = setBlock(gx, gy, gz, t === void 0 ? selBlock : t);
      if (ok) commit();
      return ok;
    },
    erase(gx, gy, gz) {
      const ok = delBlock(gx, gy, gz);
      if (ok) commit();
      return ok;
    },
    placeProp(t, gx, gz, rot2 = 0, y = 0) {
      const ok = addProp(t, gx, gz, y, rot2);
      if (ok) commit();
      return ok;
    },
    selectBlockType(i) {
      selKind = "block";
      selBlock = i;
      setErase(false);
    },
    selectPropType(i) {
      selKind = "prop";
      selProp = i;
      rebuildPreview();
      setErase(false);
    },
    serialize: () => serialize(nameInput.value),
    load(text) {
      nameInput.value = deserialize(text) || nameInput.value;
      commit();
    },
    // как кнопка «Открыть»: принимает metro-object или map.json (объект из библиотеки)
    openFile(text) {
      const objText = objectTextFromFile(text);
      if (objText === null) return false;
      nameInput.value = deserialize(objText) || nameInput.value;
      commit();
      return true;
    },
    clear() {
      clearAll();
      commit();
    },
    undo() {
      const ok = undo();
      if (ok) commit();
      return ok;
    },
    setCam(yaw, pitch, dist, tx = 0, ty = 0, tz = 0) {
      cam.yaw = yaw;
      cam.pitch = pitch;
      cam.dist = dist;
      cam.tx = tx;
      cam.ty = ty;
      cam.tz = tz;
      pointer.pickDirty = true;
    }
  };
})();
