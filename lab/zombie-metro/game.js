/* СГЕНЕРИРОВАНО из src/ — не редактировать руками. Сборка: npm run build */
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

  // src/game/map.ts
  var colliders = [];
  var dmgRecs = [];
  var mapArr = [];
  function B(cx, cy, cz, sx, sy, sz, col, opts) {
    opts = opts || {};
    const g = opts.grime !== false ? 0.9 + Math.random() * 0.2 : 1;
    const vertStart = mapArr.length / 10;
    pushBox(mapArr, cx, cy, cz, sx, sy, sz, col, opts.mat || 0, g);
    if (opts.collide !== false) {
      const dmg = { vertStart, col, mat: opts.mat || 0, g };
      dmgRecs.push(dmg);
      colliders.push({
        x0: cx - sx / 2,
        x1: cx + sx / 2,
        y0: cy - sy / 2,
        y1: cy + sy / 2,
        z0: cz - sz / 2,
        z1: cz + sz / 2,
        col,
        dmg
      });
    }
  }
  var C_FLOOR = [0.34, 0.36, 0.4];
  var C_WALL = [0.3, 0.34, 0.42];
  var C_TILE = [0.52, 0.56, 0.6];
  var C_DARK = [0.15, 0.16, 0.19];
  var C_RUST = [0.4, 0.36, 0.34];
  var C_COL = [0.4, 0.44, 0.51];
  var C_CEIL = [0.22, 0.24, 0.28];
  var C_WOOD = [0.3, 0.21, 0.13];
  var C_STAIR = [0.36, 0.38, 0.43];
  var C_BLACK = [0.012, 0.012, 0.022];
  var C_METAL = [0.45, 0.47, 0.52];
  (function buildMap() {
    B(0, -1, -4, 66, 2, 24, C_FLOOR);
    B(0, 0.012, 7.35, 66, 0.024, 0.35, [0.62, 0.56, 0.3], { collide: false });
    B(0, -2.1, 10.75, 66, 1, 5.5, C_DARK);
    B(0, -1.52, 9.7, 64, 0.16, 0.26, C_METAL, { mat: 2 });
    B(0, -1.52, 11.3, 64, 0.16, 0.26, C_METAL, { mat: 2 });
    for (let x = -30; x <= 30; x += 2.4) B(x, -1.56, 10.5, 0.45, 0.09, 2.6, [0.13, 0.11, 0.09], { collide: false });
    B(0, 2.75, -16.5, 67, 9.5, 1, C_WALL);
    B(0, 2.75, 14.25, 67, 9.5, 1.5, C_WALL);
    B(-32.5, 2.75, 0, 1, 9.5, 64, C_WALL);
    B(32.5, 2.75, 0, 1, 9.5, 64, C_WALL);
    B(-11.5, 7.5, 0, 57, 1, 48, C_CEIL);
    B(32.5, 7.5, 0, 15, 1, 48, C_CEIL);
    B(21, 7.5, -19, 8, 1, 10, C_CEIL);
    B(21, 7.5, 7, 8, 1, 34, C_CEIL);
    for (let i = 0; i < 12; i++) {
      B(17.2 + 0.68 * i + 0.34, 3.6 + 0.4 * i - 0.25, -12, 0.68, 0.5, 3.6, C_STAIR);
    }
    B(17.1, 8.5, -12, 0.14, 1, 4, C_RUST, { mat: 2 });
    B(21, 8.5, -14.05, 8, 1, 0.14, C_RUST, { mat: 2 });
    B(21, 8.5, -9.95, 8, 1, 0.14, C_RUST, { mat: 2 });
    for (const [px, pz] of [[24, 3.5], [-10, 2], [2, 12]]) {
      B(px, 10.3, pz, 0.16, 4.6, 0.16, C_METAL, { mat: 2, collide: false });
    }
    B(0, 1.6, -15.9, 64, 2.4, 0.14, C_TILE, { collide: false, mat: 1 });
    B(0, 1.8, 13.44, 64, 2.6, 0.14, C_TILE, { collide: false, mat: 1 });
    B(-32, 1.6, 0, 0.14, 2.4, 62, C_TILE, { collide: false, mat: 1 });
    B(32, 1.6, 0, 0.14, 2.4, 62, C_TILE, { collide: false, mat: 1 });
    B(0, 3.1, -15.9, 64, 0.36, 0.12, [0.1, 0.18, 0.42], { collide: false });
    for (let x = -28; x <= 28; x += 8) B(x, 2.6, 13.3, 1.2, 5.2, 0.5, C_WALL, { collide: false });
    B(-31.7, 0.4, 10.75, 0.8, 4.2, 4.8, C_BLACK);
    B(31.7, 0.4, 10.75, 0.8, 4.2, 4.8, C_BLACK);
    B(-31.3, 2.7, 10.75, 0.5, 0.5, 5.4, C_RUST, { collide: false, mat: 2 });
    B(31.3, 2.7, 10.75, 0.5, 0.5, 5.4, C_RUST, { collide: false, mat: 2 });
    for (let x = -28; x <= 28; x += 8) if (x !== 20) B(x, 6.65, -1, 0.55, 0.7, 30, C_RUST, { collide: false, mat: 2 });
    B(0, 5.85, -15.55, 64, 0.2, 0.2, C_METAL, { collide: false, mat: 2 });
    B(0, 5.45, -15.55, 64, 0.14, 0.14, C_METAL, { collide: false, mat: 2 });
    B(-9, 2.8, -15.62, 0.16, 5.6, 0.16, C_METAL, { collide: false, mat: 2 });
    B(17, 2.8, -15.62, 0.16, 5.6, 0.16, C_METAL, { collide: false, mat: 2 });
    for (let x = -28; x <= 28; x += 8) {
      B(x, 3.5, -2, 1.3, 7, 1.3, C_COL);
      B(x, 0.25, -2, 1.7, 0.5, 1.7, C_STAIR, { collide: false });
      B(x, 6.7, -2, 1.7, 0.6, 1.7, C_STAIR, { collide: false });
    }
    B(0, 2.95, -14, 64, 0.5, 4, C_FLOOR);
    B(-29.5, 2.95, -7, 5, 0.5, 18, C_FLOOR);
    B(29.5, 2.95, -7, 5, 0.5, 18, C_FLOOR);
    const rail = (cx, cz, sx, sz) => B(cx, 3.7, cz, sx, 1, sz, C_RUST, { mat: 2 });
    rail(-25.15, -12.07, 3.7, 0.14);
    rail(-1.85, -12.07, 37.7, 0.14);
    rail(25.15, -12.07, 3.7, 0.14);
    rail(-27.07, -5, 0.14, 14);
    rail(27.07, -5, 0.14, 14);
    rail(-29.5, 2.07, 5, 0.14);
    rail(29.5, 2.07, 5, 0.14);
    for (let i = 0; i < 8; i++) {
      const top = 0.4 * (i + 1);
      B(-22, top / 2, -4.5 - i, 2.4, top, 1, C_STAIR);
      B(22, top / 2, -4.5 - i, 2.4, top, 1, C_STAIR);
    }
    B(-30.5, -1.075, 8.4, 2, 1.05, 0.8, C_STAIR);
    B(-30.5, -1.35, 9.2, 2, 0.5, 0.8, C_STAIR);
    B(30.5, -1.075, 8.4, 2, 1.05, 0.8, C_STAIR);
    B(30.5, -1.35, 9.2, 2, 0.5, 0.8, C_STAIR);
    for (const [bx, bz] of [[-14, 5], [6, 5], [-10, -13.4], [10, -13.4]]) {
      B(bx, 0.42, bz, 3, 0.1, 0.95, C_WOOD);
      B(bx - 1.3, 0.18, bz, 0.12, 0.36, 0.8, C_METAL, { collide: false, mat: 2 });
      B(bx + 1.3, 0.18, bz, 0.12, 0.36, 0.8, C_METAL, { collide: false, mat: 2 });
      B(bx, 0.85, bz - 0.42, 3, 0.55, 0.09, C_WOOD, { collide: false });
    }
    for (let i = 0; i < 26; i++) {
      const rx = (Math.random() * 2 - 1) * 30, rz = -15 + Math.random() * 21;
      const s = 0.08 + Math.random() * 0.35;
      const cc = Math.random() < 0.5 ? [0.2, 0.19, 0.17] : [0.33, 0.24, 0.16];
      B(rx, s / 2 * 0.4, rz, s, s * 0.4, s * 0.8, cc, { collide: false });
    }
    for (const [px, pz] of [[-30, -14.5], [29, -15], [12, -15.2], [-20, 13], [24, 12.8]]) {
      for (let i = 0; i < 5; i++) {
        const s = 0.25 + Math.random() * 0.5;
        B(px + (Math.random() - 0.5) * 1.6, s * 0.25, pz + (Math.random() - 0.5) * 1.2, s, s * 0.5, s, C_DARK, { collide: false });
      }
    }
  })();
  var mapMesh = makeMesh(mapArr);
  for (const r of dmgRecs) r.buf = mapMesh.buf;
  var lamps = [
    { x: -24, y: 6.2, z: -2, c: [1.05, 1.15, 1.45], fl: 0 },
    { x: -12, y: 6.2, z: -2, c: [1.05, 1.15, 1.45], fl: 1 },
    { x: 0, y: 6.2, z: -2, c: [1.05, 1.15, 1.45], fl: 2 },
    { x: 12, y: 6.2, z: -2, c: [1.05, 1.15, 1.45], fl: 0 },
    { x: 24, y: 6.2, z: -2, c: [1.05, 1.15, 1.45], fl: 1 },
    { x: 0, y: 5.2, z: 10.5, c: [1, 0.62, 0.34], fl: 1 },
    { x: -14, y: 5.6, z: -14, c: [0.42, 0.78, 0.62], fl: 2 },
    { x: 14, y: 5.6, z: -14, c: [0.42, 0.78, 0.62], fl: 1 },
    { x: -22, y: 4.6, z: -10, c: [0.85, 0.72, 0.5], fl: 0 },
    { x: 22, y: 4.6, z: -10, c: [0.85, 0.72, 0.5], fl: 0 }
  ];
  var plazaLamps = [
    { x: 24, y: 12.4, z: 3.5, c: [1.1, 0.78, 0.42], fl: 0 },
    { x: -10, y: 12.4, z: 2, c: [1.1, 0.78, 0.42], fl: 1 },
    { x: 2, y: 12.4, z: 12, c: [1.1, 0.78, 0.42], fl: 0 }
  ];
  function lampIntensity(l, t) {
    let i = 1 + 0.06 * Math.sin(t * 41 + l.x);
    if (l.fl === 1) i *= 0.82 + 0.18 * Math.sin(t * 13 + l.z) * Math.sin(t * 7.7);
    if (l.fl === 2) i *= Math.sin(t * 9.1 + l.x) + Math.sin(t * 15.7) > 1.15 ? 0.12 : 0.75 + 0.25 * Math.sin(t * 31);
    return Math.max(i, 0.05);
  }
  var motes = [];
  for (let i = 0; i < 46; i++) {
    motes.push({
      l: Math.floor(Math.random() * lamps.length),
      a: Math.random() * 6.28,
      b: Math.random() * 6.28,
      c: Math.random() * 6.28,
      s: 0.4 + Math.random() * 0.9
    });
  }
  var spawnPoints = [
    { x: -29, y: 0, z: -14 },
    { x: 29, y: 0, z: -14 },
    { x: 0, y: 0, z: -14.5 },
    { x: 14, y: 0, z: -14.5 },
    { x: -14, y: 0, z: -14.5 },
    { x: -30, y: -1.6, z: 10.5 },
    { x: 30, y: -1.6, z: 10.5 },
    { x: -30, y: 3.2, z: -14 },
    { x: 30, y: 3.2, z: -14 }
  ];
  var navRoutes = [
    { bottom: { x: -22, y: 0, z: -3 }, top: { x: -22, y: 3.2, z: -13 }, box: { x0: -24, x1: -20, z0: -13, z1: -2 } },
    { bottom: { x: 22, y: 0, z: -3 }, top: { x: 22, y: 3.2, z: -13 }, box: { x0: 20, x1: 24, z0: -13, z1: -2 } },
    { bottom: { x: -30.5, y: -1.6, z: 10.3 }, top: { x: -30.5, y: 0, z: 7.2 }, box: { x0: -32, x1: -28.5, z0: 7, z1: 11 } },
    { bottom: { x: 30.5, y: -1.6, z: 10.3 }, top: { x: 30.5, y: 0, z: 7.2 }, box: { x0: 28.5, x1: 32, z0: 7, z1: 11 } }
  ];
  var pickupSlots = [
    { x: -26, y: 0, z: 2 },
    { x: -8, y: 0, z: 5.5 },
    { x: 18, y: 0, z: 5.5 },
    { x: 0, y: 0, z: -7 },
    { x: -18, y: 0, z: -13.5 },
    { x: 26, y: 0, z: -7 },
    { x: -10, y: 3.2, z: -14 },
    { x: 10, y: 3.2, z: -14 },
    { x: 29.5, y: 3.2, z: -4 },
    { x: -29.5, y: 3.2, z: -4 },
    { x: 0, y: -1.6, z: 10.5 }
  ].map((p, i) => ({ ...p, type: i % 2 === 0 ? "ammo" : "med", active: true, timer: 0, phase: Math.random() * 6.28 }));

  // src/game/damage.ts
  var VOX = 0.12;
  var REGION_VOX = 12;
  var MAX_DEPTH = 4;
  var CARVE_R = 0.17;
  var MAX_OBJECTS = 48;
  var MAX_REGIONS = 4;
  var EPS = 1e-4;
  var objs = /* @__PURE__ */ new Map();
  var objOrder = [];
  var mapVoxelsRemoved = 0;
  var ZERO_BOX = new Float32Array(36 * 10);
  function hideOriginal(rec) {
    gl.bindBuffer(gl.ARRAY_BUFFER, rec.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, rec.vertStart * STRIDE, ZERO_BOX);
  }
  function restoreOriginal(rec, b) {
    const arr = [];
    pushBox(arr, (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2, b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0, rec.col, rec.mat, rec.g);
    gl.bindBuffer(gl.ARRAY_BUFFER, rec.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, rec.vertStart * STRIDE, new Float32Array(arr));
  }
  function inBox(b, x, y, z) {
    return x > b.x0 - EPS && x < b.x1 + EPS && y > b.y0 - EPS && y < b.y1 + EPS && z > b.z0 - EPS && z < b.z1 + EPS;
  }
  function inBoxStrict(b, x, y, z) {
    return x > b.x0 + EPS && x < b.x1 - EPS && y > b.y0 + EPS && y < b.y1 - EPS && z > b.z0 + EPS && z < b.z1 - EPS;
  }
  function cellIdx(r, i, j, k) {
    return (i * r.ny + j) * r.nz + k;
  }
  function cellOf(r, x, y, z) {
    const i = Math.min(r.nx - 1, Math.max(0, Math.floor((x - r.x0) / r.sx)));
    const j = Math.min(r.ny - 1, Math.max(0, Math.floor((y - r.y0) / r.sy)));
    const k = Math.min(r.nz - 1, Math.max(0, Math.floor((z - r.z0) / r.sz)));
    return cellIdx(r, i, j, k);
  }
  function solidAt(o, x, y, z) {
    if (!inBox(o.bounds, x, y, z)) return false;
    for (const r of o.remainders) if (inBoxStrict(r, x, y, z)) return true;
    for (const r of o.regions) if (inBoxStrict(r, x, y, z)) return r.cells[cellOf(r, x, y, z)] === 0;
    return false;
  }
  function carveRegion(o, R, px, py, pz) {
    const half = REGION_VOX * VOX / 2;
    const x0 = Math.max(R.x0, px - half), x1 = Math.min(R.x1, px + half);
    const y0 = Math.max(R.y0, py - half), y1 = Math.min(R.y1, py + half);
    const z0 = Math.max(R.z0, pz - half), z1 = Math.min(R.z1, pz + half);
    const nx = Math.max(1, Math.round((x1 - x0) / VOX));
    const ny = Math.max(1, Math.round((y1 - y0) / VOX));
    const nz = Math.max(1, Math.round((z1 - z0) / VOX));
    const region = {
      x0,
      x1,
      y0,
      y1,
      z0,
      z1,
      nx,
      ny,
      nz,
      sx: (x1 - x0) / nx,
      sy: (y1 - y0) / ny,
      sz: (z1 - z0) / nz,
      cells: new Uint8Array(nx * ny * nz)
    };
    const rem = [];
    if (y0 > R.y0 + EPS) rem.push({ x0: R.x0, x1: R.x1, y0: R.y0, y1: y0, z0: R.z0, z1: R.z1 });
    if (y1 < R.y1 - EPS) rem.push({ x0: R.x0, x1: R.x1, y0: y1, y1: R.y1, z0: R.z0, z1: R.z1 });
    if (z0 > R.z0 + EPS) rem.push({ x0: R.x0, x1: R.x1, y0, y1, z0: R.z0, z1: z0 });
    if (z1 < R.z1 - EPS) rem.push({ x0: R.x0, x1: R.x1, y0, y1, z0: z1, z1: R.z1 });
    if (x0 > R.x0 + EPS) rem.push({ x0: R.x0, x1: x0, y0, y1, z0, z1 });
    if (x1 < R.x1 - EPS) rem.push({ x0: x1, x1: R.x1, y0, y1, z0, z1 });
    o.remainders.splice(o.remainders.indexOf(R), 1, ...rem);
    o.regions.push(region);
    return region;
  }
  function carveSphere(o, r, cx, cy, cz, axis, sign) {
    const b = o.bounds;
    const entry = axis === 0 ? sign > 0 ? b.x1 : b.x0 : axis === 1 ? sign > 0 ? b.y1 : b.y0 : sign > 0 ? b.z1 : b.z0;
    let removed = 0;
    const i0 = Math.max(0, Math.floor((cx - CARVE_R - r.x0) / r.sx)), i1 = Math.min(r.nx - 1, Math.floor((cx + CARVE_R - r.x0) / r.sx));
    const j0 = Math.max(0, Math.floor((cy - CARVE_R - r.y0) / r.sy)), j1 = Math.min(r.ny - 1, Math.floor((cy + CARVE_R - r.y0) / r.sy));
    const k0 = Math.max(0, Math.floor((cz - CARVE_R - r.z0) / r.sz)), k1 = Math.min(r.nz - 1, Math.floor((cz + CARVE_R - r.z0) / r.sz));
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) for (let k = k0; k <= k1; k++) {
      const x = r.x0 + (i + 0.5) * r.sx, y = r.y0 + (j + 0.5) * r.sy, z = r.z0 + (k + 0.5) * r.sz;
      const dxx = x - cx, dyy = y - cy, dzz = z - cz;
      if (dxx * dxx + dyy * dyy + dzz * dzz > CARVE_R * CARVE_R) continue;
      const coord = axis === 0 ? x : axis === 1 ? y : z;
      if (Math.abs(entry - coord) > MAX_DEPTH * VOX) continue;
      const bx = x - (axis === 0 ? sign * r.sx : 0);
      const by = y - (axis === 1 ? sign * r.sy : 0);
      const bz = z - (axis === 2 ? sign * r.sz : 0);
      if (!inBox(o.bounds, bx, by, bz)) continue;
      const idx = cellIdx(r, i, j, k);
      if (r.cells[idx] === 0) {
        r.cells[idx] = 1;
        removed++;
      }
    }
    mapVoxelsRemoved += removed;
    return removed;
  }
  function pushFace(arr, x0, y0, z0, x1, y1, z1, dir, cr, cg, cb, mat) {
    const [n, corners, shade] = FACES[dir];
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
    const sx = (x1 - x0) / 2, sy = (y1 - y0) / 2, sz = (z1 - z0) / 2;
    const idx = [0, 1, 2, 0, 2, 3];
    for (const i of idx) {
      const v = corners[i];
      arr.push(
        cx + v[0] * sx,
        cy + v[1] * sy,
        cz + v[2] * sz,
        n[0],
        n[1],
        n[2],
        cr * shade,
        cg * shade,
        cb * shade,
        mat
      );
    }
  }
  var DIRS = [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
  function remesh(o) {
    const arr = [];
    for (const r of o.remainders) {
      pushBox(arr, (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2, (r.z0 + r.z1) / 2, r.x1 - r.x0, r.y1 - r.y0, r.z1 - r.z0, o.col, o.mat, o.g);
    }
    for (const r of o.regions) {
      for (let i = 0; i < r.nx; i++) for (let j = 0; j < r.ny; j++) for (let k = 0; k < r.nz; k++) {
        if (r.cells[cellIdx(r, i, j, k)]) continue;
        const x0 = r.x0 + i * r.sx, y0 = r.y0 + j * r.sy, z0 = r.z0 + k * r.sz;
        const x1 = x0 + r.sx, y1 = y0 + r.sy, z1 = z0 + r.sz;
        const depth = Math.min(
          (x0 - o.bounds.x0) / VOX,
          (o.bounds.x1 - x1) / VOX,
          (y0 - o.bounds.y0) / VOX,
          (o.bounds.y1 - y1) / VOX,
          (z0 - o.bounds.z0) / VOX,
          (o.bounds.z1 - z1) / VOX
        );
        for (let d = 0; d < 6; d++) {
          const nb = DIRS[d];
          const px = x0 + r.sx / 2 + nb[0] * r.sx, py = y0 + r.sy / 2 + nb[1] * r.sy, pz = z0 + r.sz / 2 + nb[2] * r.sz;
          let air, surface;
          if (!inBox(o.bounds, px, py, pz)) {
            air = true;
            surface = true;
          } else {
            air = !solidAt(o, px, py, pz);
            surface = false;
          }
          if (!air) continue;
          const dark = surface ? 1 : Math.max(0.3, 0.82 - 0.16 * Math.max(0, Math.round(depth)));
          pushFace(arr, x0, y0, z0, x1, y1, z1, d, o.col[0] * o.g * dark, o.col[1] * o.g * dark, o.col[2] * o.g * dark, o.mat);
        }
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, o.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW);
    o.count = arr.length / 10;
  }
  function applyMapHit(c, hx, hy, hz, dx, dy, dz, axis, sign) {
    const rec = c.dmg;
    if (!rec || !rec.buf || axis < 0) return false;
    let o = objs.get(rec);
    if (!o) {
      if (objs.size >= MAX_OBJECTS) {
        const oldRec = objOrder.shift();
        const old = objs.get(oldRec);
        restoreOriginal(oldRec, old.bounds);
        gl.deleteBuffer(old.buf);
        objs.delete(oldRec);
      }
      o = {
        rec,
        bounds: { x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1, z0: c.z0, z1: c.z1 },
        col: rec.col,
        mat: rec.mat,
        g: rec.g,
        remainders: [{ x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1, z0: c.z0, z1: c.z1 }],
        regions: [],
        buf: gl.createBuffer(),
        count: 0
      };
      hideOriginal(rec);
      objs.set(rec, o);
      objOrder.push(rec);
    }
    const maxDist = (MAX_DEPTH + 2) * VOX;
    let px = 0, py = 0, pz = 0, found = false;
    for (let s = VOX * 0.25; s < maxDist; s += VOX * 0.35) {
      px = hx + dx * s;
      py = hy + dy * s;
      pz = hz + dz * s;
      if (!inBox(o.bounds, px, py, pz)) break;
      if (solidAt(o, px, py, pz)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
    let region = null;
    for (const r of o.regions) if (inBox(r, px, py, pz)) {
      region = r;
      break;
    }
    if (!region) {
      if (o.regions.length >= MAX_REGIONS) return false;
      let R = null;
      for (const rb of o.remainders) if (inBoxStrict(rb, px, py, pz)) {
        R = rb;
        break;
      }
      if (!R) return false;
      region = carveRegion(o, R, px, py, pz);
    }
    const removed = carveSphere(o, region, px, py, pz, axis, sign);
    remesh(o);
    return removed > 0;
  }
  function renderDamage() {
    for (const o of objs.values()) {
      if (o.count === 0) continue;
      bindMesh({ buf: o.buf, count: o.count });
      gl.drawArrays(gl.TRIANGLES, 0, o.count);
    }
  }
  function dropDamageForBuffer(buf) {
    for (const [rec, o] of objs) {
      if (rec.buf !== buf) continue;
      gl.deleteBuffer(o.buf);
      objs.delete(rec);
      objOrder.splice(objOrder.indexOf(rec), 1);
    }
  }
  function damageStats() {
    return { mapObjects: objs.size, mapVoxels: mapVoxelsRemoved };
  }

  // assets/city.txt
  var city_default = "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nr........r.c....cZrL.......rA##..A##r........r......ccrA##..A##rcZZ.....rL..L.cL.rA##..A##r...Z....rH#..Z.H#r........r.....cL.r.\nrA##..O#.rA##..O#.rA##..O#.r###..###r....t.ZcrZ.....Z.r###.t###rA##..O#.r......t.r###..###rA##..O#.r##....##r........rA##..O#.r.\nr###.....r###.t...r###t..Z.r...t.Z.Lr......t.r........r........r###Z...Lr........rZ.Z.....r###.....r....t...r...tZ...r###.....r.\nrZ..Z.Z.Zr.t..t...r......tZr......t.rLZ......r........rZttt....r..tt....r.Z.....Zr........r.t.t....r........rZt..Z...r........r.\nr...Zt...r........r.....Z..r...O#.t.r........r........rcZ.O#...r..tt....r.Z....Z.r.t.O#Z..r...t.t..r......t.r........r....ZtZcr.\nr..ZZ.A##r.....A##r..tt.A##rH#....H#r.t......r........rH#....H#r.t...A##r......Z.rH#....H#r.....A##r...Z....r.t......r.....A##r.\nr.....###r..t..###r.....###r##....##rLZt.Z...r........r##t...##rL...Z###rZ.t.....r##....##rZZt.Z###rH#....H#rL.......r.....###r.\nr......c.r..c..c..r........r.ZZ.....rc.Z....cr........r......c.r...Z....r..Z.....r...Z.L..rZ.Z..Z..r##....##r..LZ.c..r...c..c.r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrA##.ZA##rA##..A##r......c.r........r........rA##..A##r........rL.......rH#...cH#r........rA##ZZA##rA##..A##rH#....H#rZ....Z..r.\nr###..###r###Z.###rA##..O#.rA##..O#.rA##..O#.r###..###rA##.ZO#.r........r##..tZ##r........r###t.###r###..###r##.t..##r.t.....cr.\nr......Z.r...t....r###...t.r###.....r###....cr.......Lr###.....r......tLr........r.t......r..t.....r..t....Lrct.t....r.tt.....r.\nrZ...Z...rLZ.Z....r........r...t....r....t...r.t.t...Zr...t....r....ZZ..rL.......r......Z.rc..tttZ.r........r.....t..r.....t..r.\nrct.O#...r.t.O#.Z.rc.......r.......Zr....Z...r.Z.O#...r........r....tZ..r........r..tZ....r...O#...r.ZtO#t..r.tt.....r...ttt..r.\nrH#....H#rH#....H#r..Z..A##r.Zt.tA##r...t.A##rH#....H#r..Z..A##r........r.......Zr.Z......rH#tt..H#rH#Z...H#r....Z.t.r..t.t...r.\nr##..Z.##r##Z...##r.....###rLt...###r.....###r##tZ..##r.....###r.....Z..rH#....H#r...tt...r##.Zt.##r##....##rH#....H#r...t....r.\nr..L.Z...r..L.c...r.Z...Z.cr.......Zr..L.....r.c......r.ZL.....r.cL.....r##c.cL##r.......Zr.....c..r........r##...L##rZ...c...r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nr..Z.c...rH#.cc.H#rA##..A##rA##..A##r..Z.....r....c.c.rH#...cH#r......L.rA##..A##rH#....H#r...Z....rH#Z.Z.H#r....c.L.rA##..A##r.\nrA##Z.O#.r##t..t##r###..###r###.Z###r......t.rA##t.O#cr##t...##rA##t.O#.r###..###r##....##r...t...Zr##....##r........r###..###r.\nr###.t..Lr.Zt.Z...r.t......r........r.Z....t.r###.....r.......Lr###Z..t.r........r..t..t..r.......Zr...Zt...r........r..t..t..r.\nr...t..Z.r........r.Z......r..t..Z..r.....Z..r..t.....rL....t..rL.t..Z..rZtZt....rZ..t....r..Z.....r....t...rc......ZrZ.t.tZ..r.\nr......t.r.t..tZ..r.Z.O#.tcr...O#...r.Z.tZt..r........r....Z...r......Z.r..ZO#...r...Z.t.Zrc.ttZt..r........r...tt...rc..O#.tZr.\nr.....A##r.Z....Z.rH#..ttH#rH#....H#r..ZZ....r.Z..tA##r.......Lr...Z.A##rH#.Z..H#r........r.Z...tZ.r.......Zr..Z.....rH#....H#r.\nr...t.###rH#.t..H#r##...Z##r##.t..##r....t.Z.r....Z###rH#t..tH#rLt.t.###r##.t..##rH#...tH#r......Z.rH#....H#r.t...t..r##....##r.\nr.Z......r##....##r........r........r.....L..r..L.....r##....##rZ.......r....Z.Z.r##....##r..Z.....r##...L##r...cc...r........r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrZ..Z....rA##L.A##rL...c..crA##..A##r...L...ZrA##.ZA##rH#.L..H#rA##c.A##rZ.Z.....rA##..A##rA##..A##rH#...cH#rH#ZL..H#rH#....H#r.\nr......t.r###..###rA##Z.O#.r###tt###rA##..O#.r###..###r##.t..##r###..###r........r###ZZ###r###..###r##t...##r##..tt##r##....##r.\nr.....t..r.....Z..r###.Z...r....t..Lr###.....r......Zcr..t..tt.r....t.tZr...t....r......tLr.Z.t..t.r.Z......rZ...t...r.....t..r.\nr..tt..t.r........rc....t..r.....t..r......Z.r....Z...r........rZ..Z....r........r...Z....r........r........r........r........r.\nrc....Z..r...O#Z..r..Z..Z..r.Z.O#...r.....Z..r...O#...r.......cr..ZO#...r........r...O#Z..r...O#...r..Z....Zr....Z...r.t......r.\nr.Zt.....rH#....H#r...t.A##rH#.Z..H#r.....A##rH#Z..tH#rZt.t....rH#....H#r.Z..Z...rH#t...H#rH#....H#r.......Lr.t..t...r........r.\nr..t.tt..r##....##r.Z...###r##.t..##r.....###r##...Z##rH#.t..H#r##....##r........r##....##r##....##rH#....H#rH#t...H#rH#....H#r.\nr........r...cZ...r..L.....r........r.cc..L..rc...c...r##....##r..c....cr..L.....r........r........r##...L##r##....##r##....##r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrH#..c.H#r......Z.rA##..A##rH#..Z.H#rA##L.A##rH#....H#rH#..Z.H#r........rA##.cA##r........rH#....H#rH#....H#r........rH#..c.H#r.\nr##..Z.##rA##..O#.r###..###r##.Z..##r###..###r##..t.##r##....##rA##..O#Zr###t.###rA##..O#.r##.t..##r##....##r........r##t...##r.\nr........r###.....r........r......Z.r...t...cr.....Z..r.......Zr###.....r.......Lr###ZZ...rc...t...rZ.t.....r..t.Z..Lr........r.\nrc...Zt..r....tZtcr.......cr..t..t..r..t.....rZ...Z...r........r......Z.rZ...t..Zr..Zt....r........r......Z.r.......cr........r.\nr........rc.......r..ZO#...r...t....r..tO#...r.t.Z....r...Z....r...t..t.r...O#...r....t...rc.t.....r..Zt....r...tt...rc..t....r.\nr.ZZ....Lr..t..A##rH#Z.ZtH#r.t...t..rH#..t.H#r.......Lrc......Lr....tA##rH#..t.H#r..tZ.A##r....t..crct......r.......Lr.t.t....r.\nrH#..t.H#r..t..###r##....##rH#....H#r##....##rH#...ZH#rH#..t.H#r.....###r##.Zt.##rc....###rH#.Zt.H#rH#t..tH#r.......crH#....H#r.\nr##.c..##rZ.....c.r.ZL.....r##.c..##r..L.....r##..Z.##r##L...##r........rZ.L.....r........r##L.Z.##r##....##r........r##...L##r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrH#....H#rH#..c.H#rL.......rH#.c..H#rA##..A##r.Zc.....rA##..A##r........r..c...L.r........r........rA##L.A##rH#.L..H#rL.......r.\nr##t...##r##....##rA##..O#.r##Z...##r###..###rA##..O#.r###.Z###r.....t..rA##Z.O#.rA##..O#.r....Zt..r###..###r##..Zt##r.t......r.\nr....tt..r........r###.....r....t.ZLr........r###.....r..t.tZ..r.....t..r###....Zr###.t..cr.......Lr...t....r........r.t.t....r.\nr....t...r........rL.....t.r..Zt....r..ZZ.tZ.r........r...t.Z..r.....t..r.t...Z.cr.Z..t...r.ZtS#...r.Z......r........r....Z...r.\nrZ.t.....r........r...t...Zr.t...t..r...O#.t.r.......Zr...O#...r........r....Z...r........r..t##...r..tO#.t.r........rcZ......r.\nr...t..t.r.t..Z..Lr.....A##r.t.....LrH#....H#rc....A##rH#....H#r.....tt.r.Z.t.A##r....tA##r.......LrH#...ZH#r........r.Z..tt..r.\nrH#..t.H#rH#....H#rZt..Z###rH#....H#r##....##r.....###r##Z...##r..Z.....r.Z..Z###r.....###r.....t..r##....##rH#Z..tH#r..ZZ...Zr.\nr##....##r##c..L##r..c.....r##....##r.....L..r......Z.r...c....r.ZZ.....r..LZ....r...cZL..r........r.....c..r##....##r...Z....r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrH#.Z..H#r........rA##..A##r....Z.Z.r.Zc.cc..rA##..A##rH#.c..H#r........rA##..A##r..Z.....rA##LcA##rLc......rZ..c....rH#.L..H#r.\nr##..ZZ##r.t.t.Z..r###..###rA##..O#.r.....t..r###..###r##....##r.....t..r###..###rA##Z.O#.r###..###r..t..t..r....t.Z.r##t...##r.\nrc.Z.....r...t...Lr....tZ..r###.....r....Z..Zr........r..Z.t...rZ......Zr.....t..r###Z....r...t...Lr..tttt.Lr.t......r......ZLr.\nr.......cr...S#...rLtt..t..r.tZ.....r...S#...r...t.tt.rZ.......r...S#...rZ.Z..t..r.......Zr.......cr.ZtS#.t.r...t.t..r..Z..t..r.\nr.t......r..t##...r...O#...r....Z...r...##...r...O#.Z.r....t.t.r..t##...r.t.O#.t.r....Z...r..tO#...r...##...rc...Z.t.r...Z....r.\nr.tZ.....r.......LrH#...ZH#rZ....A##rZ..t...ZrH#....H#r........r........rH#....H#r.....A##rH#t..tH#r........r...tZ...r.Z.....Lr.\nrH#t...H#rL.......r##.Z..##r.t...###rc..Ztt..r##t...##rH#...............r##....##r.Z..t###r##....##rc.t....Zr...Zt...rH#....H#r.\nr##....##r.....Z..r......Z.r...Z.ZZ.r.cZc...cr..L...Z.r##.........M#....r........r.cL..c..r........r..Z.....r..L.....r##...Z##r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr.......##.rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrc.......rA##..A##r.Z......r....ZZ..r.......ZrH#..Z.H#rA##c...........S#r.......ZrL.......rH#..Z.H#rL.......r.....cc.r........r.\nr.......cr###..###rA##t.O#.rA##..O#.rA##.ZO#.r##Z.Z.##r###............##rA##..O#.rA##ttO#.r##tt.t##rZ.......r........rA##..O#.r.\nr........r....t...r###..t..r###.....r###Z....r........r...............t.r###.Z.Z.r###t.t.Lr..t.....r....ZZ..rZ.Z.....r###.....r.\nr...t....r.......Zr.....t..r....t...r.Z.Z....r.....t..r..Z.....r....t...r...t....r......t.rZ.....t.r.Z....Z.rL.t.....r...t.tZZr.\nr.Z...t..r.ttO#ZZ.r........r........rcZt..t..r..t.....r...O#Zt.r.t......r.Z......r...Z....r.......Zr.....t..r.t.Z....r........r.\nr.t.Z....rH#....H#rc.Z..A##r.tZ..A##r.....A##r.....Z..rH#....H#r........r.t.Z.A##rc...tA##r...t.Z..r........r......t.r..Z..A##r.\nrL.......r##....##rL....###r...t.###r.....###rH#....H#r##t...##r.Z......r.t...###r.tttt###rH#....H#rL..ttt..rc.Z..Z..r..t..###r.\nr......Z.rZ.....Z.rc.c....cr.....L..r..c.Z...r##.cZ.##r.......cr........r........r.....L..r##.c.c##r........r.....L.ZrZcc.c...r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrH#....H#r.....c..rA##Z.A##r...Z....rA##cZA##r......c.rH#..c.H#rL.c.Z...r........r...Z....r...L....r...Z..L.r........rH#.ZZ.H#r.\nr##....##rA##..O#.r###..###r..t.....r###..###r..t...t.r##t...##rA##..O#.rA##..O#.r.tt.t...r.....t..r..t.....r....t...r##Z.Z.##r.\nr........r###.Z..Zr........r.t......r........r......Z.r........r###t...Lr###t....r........r........r..t.....r....Z...r.Z...ZtLr.\nrZ..t....r......t.rZ.......r........r.t......r.......ZrZ.......r....t...rL..t..Z.r........r........r...S#...rc...tZ..r....t...r.\nr.Z...t..r.Zt.....r...O#t..r...Zt.t.r...O#...rZ..t.t..rZ.t.....r.t.tt...r.....t..r........r...t....r...##...rc.t.....r....t...r.\nr.tZ.....r....ZA##rH#Z...H#rZ.....t.rH#....H#r.tZZ..t.r...Z..t.r.....A##r.....A##r.....ZZ.r....tZt.r........r........r.t.t.Z..r.\nrH#....H#r.....###r##..t.##r..t..Z..r##.t.Z##r........rH#....H#r..t..###r....Z###r..t.t...r........r....Z...rc...t..ZrH#t...H#r.\nr##....##r.Z.Z....r..Z.....r........r........r........r##L...##rc.c.Z.c.rc.Z..Z..r........r.Z......r........r..Lc..c.r##...L##r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nr..c.....r...L...crA##c.A##rH#....H#r....c.LZrA##..A##r...Z..L.rZcZc.cc.rH#....H#r....cZL.rA##..A##rH#..c.H#rH#..Z.H#r........r.\nr......ZcrcZ.....Zr###..###r##..t.##rA##.tO#.r###.t###rA##t.O#.r..Zt....r##.t.t##rZZ.t....r###..###r##.tZ.##r##ZZ..##r...tt.Z.r.\nrZ..t....r.....Z..r..Z.....r.....Z..r###.....r...t.t..r###...t.rZ.......r........r........r.t....tcr..t.....r.Z......r..Z.Z...r.\nrZ..tZt..r....Zt.Zr.....Z..r.t......rc.t.t.Z.r........r.....Z..r........r........rZZ....t.r........r...t....r.....t..r...S#...r.\nr........rc.......rcZ.O#...r.Z.t....rc.....t.r...O#...r....tt.ZrZ.......r......tZr........rc..O#..crZ.......r....t...rZ..##..cr.\nr.......Zr...t.t..rH#..Z.H#r.Z.t..ZLr....ZA##rH#....H#r.....A##r........rZ.......r.t......rH#.Z..H#rZ.......r...t....r...t..t.r.\nr........r..t...Z.r##...t##rH#....H#r.....###r##...t##rLZZ..###rLt...Z..rH#....H#r......t.r##....##rH#tZ..H#rH#.t..H#r........r.\nr.cZ.....r........r......ccr##....##r..L.....r........rZ.....Z.rZ.L.....r##....##r......c.r...Z....r##cc..##r##....##r.Z......r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrA##..A##r.c..c.L.rA##..A##r....Z...rA##..A##rH#....H#rH#.L..H#r.c......rA##..A##rA##Z.A##r.c..c...rH#.Lc.H#r.......cr......ZZr.\nr###ZZ###rA##..O#.r###..###r...Z....r###..###r##..Z.##r##Z...##rA##.tO#.r###.Z###r###..###r....t...r##....##r..t.....r....Z...r.\nr...tZ..Zr###..Z..r........r.......Zr.t.t...Zr.t......r..t.t.tZr###...ZLrc..tt...r.....t.Zr....t...r..t.Z...r.t.....Lr.t......r.\nr..Z.....r.Z....Z.r........r...S#...r....t...r..tt....rc..t.t..r.......crZZ..t...r.......cr...S#...rL.......rL..S#...rc..t....r.\nr...O#..Zr....t.t.r...O#...r...##Zt.r.t.O#t..r........r...ZZt..r........r...O#...r..tO#.Z.r...##...r.......Zr...##...r...t.Zt.r.\nrH#t..tH#r.....A##rH#....H#r........rH#..t.H#r....Z...r.t......rZ..Z.A##rH#.Z..H#rH#....H#r.....tt.r........r........r.....t..r.\nr##....##rZ....###r##t...##rL.t.ZZ..r##Z...##rH#....H#rH#.Z.tH#rL....###r##..Z.##r##....##rL.....Z.rH#...tH#r........r........r.\nrZ.....c.r..LZc...r..cc....r........r......Z.r##...L##r##....##r.c......r....Z...r.....Z..r..Z.....r##c...##r.....Z..r........r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrLZ.c.c..rA##..A##rA##c.A##r.......ZrH#.LZ.H#rA##c.A##rA##ZZA##rH#Z..cH#rH#..Z.H#rH#.L..H#rL.....c.rA##L.A##rH#..ZcH#rH#c..cH#r.\nrA##..O#.r###Z.###r###Zt###r....t...r##....##r###..###r###..###r##....##r##....##r##tt..##r........r###.t###r##....##r##....##r.\nr###..t..r.......Lr..t..tt.r..Z...t.r.......Lr......Z.r.....tZ.r..t.....r....Zt..r.....tt.r.t....t.r........r....Z...r........r.\nrct..tt.Zr...tZ...r.t......r........r.....tZ.r........r........r..t....cr...t.t..r........r........rL.t....cr...t.t..r.Z......r.\nr..Z.t...r.t.O#...r...O#...r.Z......r..t.t...r...O#t..r..tO#...r........r..Zt....r...tZt..r...tZ...r...O#...r........rZt.....Zr.\nr.Z...A##rH#t...H#rH#....H#r.......cr...t....rH#..t.H#rH#....H#rZZ..tt..r.t.t...LrZ.Z...t.r...t....rH#..t.H#r.t......r.Zt..t..r.\nr.Z.t.###r##....##r##Z...##r.....t..rH#....H#r##.t..##r##....##rH#....H#rH#tZ..H#rH#Z.t.H#rZ.......r##....##rH#....H#rH#Z.t.H#r.\nr...Z.Lc.r........r.cL..L.ZrZZ..Z...r##...L##rZ.c.Z...r.ZL..c..r##....##r##L...##r##....##r........r........r##....##r##..Z.##r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrc..L..c.rA##..A##r...L....r.c.L....r.Z...ZZZr...L....r........r........rA##LZA##r..c.....r........rH#.L..H#r......L.rc.....Z.r.\nrA##..O#Zr###.t###rA##Z.O#.rA##..O#.rA##..O#.rA##ZZO#.rA##..O#.r.Z...t..r###..###rA##..O#.r......t.r##....##rA##..O#.rA##t.O#.r.\nr###.t.t.r..tt...cr###....cr###.....r###.....r###tZ...r###.....rc.......r..Z.....r###.t.t.r.......Lr.......Lr###t.t.cr###...tZr.\nrc...t...rc.......r.t.t....r...t....r......ZZr.....t..r....t...r...t....r.......cr......t.r...Z....rLt..ZZ..r..tt....rLtt..Z..r.\nr.......Zr...O#...rc.Z.tZZ.r.t......r........r.t......r...t....r....t...r...O#..cr........r....t..cr........r........r.Z...t..r.\nr.t...A##rH#....H#r.....A##r....ZA##r...t.A##r.t...A##r.....A##r..Z.....rH#....H#r.....A##r.Zt.....r........r.....A##r...tZA##r.\nr....Z###r##t.t.##r...Z.###r.....###r..t..###r.....###r.....###r.....Z..r##..t.##r.t.Z.###rZ....t.crH#....H#rLt...###rL.t..###r.\nr........r...c....r........r..LZ.L..r...Z.L..r....Z..Zr........r......Z.r....Z...r..Z.Z...r...c....r##....##r.c......r........r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nrA##..A##r....c...rH#.Z..H#rA##..A##r.c......rA##..A##r.Z....L.rH#....H#rL......ZrL......crZ.Z..Z..rH#.Lc.H#rA##L.A##r...L..Lcr.\nr###.t###r........r##.Z..##r###..###rA##..O#.r###..###r.tZZ....r##..Z.##rA##..O#.r..Z.....r........r##....##r###Z.###rA##..O#.r.\nr..t..t..r........r........rZ..t...Lr###Z.t..r.t......rZ.......r...tZ..Zr###....Lr....t..Lr.....Z..r....Ztt.r........r###..ZZcr.\nr....t...r......Z.r.....t..rL...t.Zcr.....tt.r...Z....r.Z.S#.Z.rZ.......r.t.t....r...Zt...r........r.tt...t.r......Z.r...t....r.\nr...O#...rZZt...t.rZ..t.Z..r...O#...r.....t..r...O#.tZr.Z.##.tcr.t......r...ZZ...r........r...ZZt..r........r...O#Z..rc....t..r.\nrH#..t.H#r..t.....r..t.t..ZrH#....H#rZ.Z..A##rH#Z...H#r....Z..Lr..t.....r.....A##r........r.t......r..Z.t.Z.rH#....H#rc....A##r.\nr##..t.##rL.t....ZrH#..t.H#r##....##r...t.###r##....##r......t.rH#Z.t.H#r.....###r........r.t......rH#....H#r##t...##r.....###r.\nrZ.......r........r##...L##r...Z.cc.r.....c..r........r........r##....##r........r........r........r##...L##rZ.....Z.r........r.\nrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\nr........r........r........r........r........r........r........r........r........r........r........r........r........r........r.\n";

  // assets/tiles/panel.txt
  var panel_default = "name panel\ntiles 3 2\nfloor 0\nwwwwwwwwwwwDDwwwwwwwwwww\nw......................w\nw.SSSSSSSS.............w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nw......................w\nwwwwwwwwwwwDDwwwwwwwwwww\nfloor 1-5\nwowowowowowwwwowowowowow\nw......................w\nw.SSSSSSSS.............w\nw......................w\no......................o\nw......................w\no......................o\nw......................w\nw......................w\no......................o\nw......................w\no......................o\nw......................w\nw......................w\nw......................w\nwowowowowowowowowowowoww\nfloor 6\nwowowowowowwwwowowowowow\nw......................w\nw......................w\nw......................w\no......................o\nw......................w\no......................o\nw......................w\nw......................w\no......................o\nw......................w\no......................o\nw......................w\nw......................w\nw......................w\nwowowowowowowowowowowoww\n";

  // assets/tiles/house.txt
  var house_default = "name house\ntiles 2 2\nfloor 0\nbbbbbbbDDbbbbbbb\nb..............b\nb.SSSSSSSS.....b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nb..............b\nbbbbbbbbbbbbbbbb\nfloor 1-2\nbobobobbbbobobob\nb..............b\nb.SSSSSSSS.....b\nb..............b\no..............o\nb..............b\nb..............b\no..............o\nb..............b\nb..............b\no..............o\nb..............b\nb..............b\no..............o\nb..............b\nbobobobobobobobb\nfloor 3\nbobobobbbbobobob\nb..............b\nb..............b\nb..............b\no..............o\nb..............b\nb..............b\no..............o\nb..............b\nb..............b\no..............o\nb..............b\nb..............b\no..............o\nb..............b\nbobobobobobobobb\n";

  // assets/tiles/shop.txt
  var shop_default = "name shop\ntiles 2 1\nfloor 0\nwggggggDDggggggw\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nwwwwwwwwwwwwwwww\nfloor 1\nwowowowwwowowoww\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nwwwwwwwwwwwwwwww\n";

  // assets/tiles/shelter.txt
  var shelter_default = "name shelter\ntiles 2 2\nfloor 0\nwwwwwwsDDswwwwww\nw..............w\nw..L........L..w\nw..............w\nw..............w\nw......T.......w\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nw..L........L..w\nw..............w\ns..............s\nws............sw\nwwwwws.DD.swwwww\n";

  // assets/tiles/lobby.txt
  var lobby_default = "name lobby\ntiles 2 2\nfloor 0\nwwwwwwwwwwwwwwww\nw..............w\nwxxxxxxxx......w\nwxxxxxxxx..L...w\nwxxxxxxxx......w\nwxxxxxxxx......w\nw..............w\nw...L......L...w\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nw..............w\nwwwwwwDD.DDwwwww\n";

  // src/world/dsl.ts
  var TILE = 8;
  var CITY_N = 128;
  var WORLD_HALF = 512;
  var STREET_Y = 8;
  var FLOOR_H = 3.2;
  var METRO_RES = { tx0: 59, tx1: 68, tz0: 61, tz1: 66 };
  function parseTpl(txt, wall) {
    const lines = txt.trimEnd().split("\n");
    let name = "", tw = 0, td = 0;
    const floors = [];
    let i = 0;
    for (; i < lines.length; i++) {
      const L = lines[i];
      if (L.startsWith("name ")) name = L.slice(5).trim();
      else if (L.startsWith("tiles ")) {
        const p = L.slice(6).split(" ");
        tw = +p[0];
        td = +p[1];
      } else if (L.startsWith("floor ")) break;
    }
    while (i < lines.length) {
      const m = lines[i].match(/^floor (\d+)(?:-(\d+))?$/);
      if (!m) throw new Error("DSL: ожидалась секция floor: " + lines[i]);
      const f0 = +m[1], f1 = m[2] ? +m[2] : f0;
      const rows2 = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("floor ")) {
        rows2.push(lines[i]);
        i++;
      }
      if (rows2.length !== td * 8) throw new Error(`DSL ${name}: этаж ${f0} — ${rows2.length} строк вместо ${td * 8}`);
      for (const r of rows2) if (r.length !== tw * 8) throw new Error(`DSL ${name}: строка длиной ${r.length} вместо ${tw * 8}`);
      for (let f = f0; f <= f1; f++) floors[f] = rows2;
    }
    return { name, wall, tw, td, floors };
  }
  var TPLS = {
    A: parseTpl(panel_default, [0.42, 0.44, 0.47]),
    H: parseTpl(house_default, [0.38, 0.2, 0.14]),
    O: parseTpl(shop_default, [0.46, 0.45, 0.42]),
    S: parseTpl(shelter_default, [0.33, 0.35, 0.33]),
    M: parseTpl(lobby_default, [0.36, 0.44, 0.4])
  };
  var rows = city_default.trimEnd().split("\n");
  if (rows.length !== CITY_N || rows[0].length !== CITY_N) throw new Error("DSL: city.txt не 128×128");
  function tileAt(tx, tz) {
    if (tx < 0 || tz < 0 || tx >= CITY_N || tz >= CITY_N) return " ";
    return rows[tz][tx];
  }
  var cover = new Array(CITY_N * CITY_N).fill(null);
  for (let tz = 0; tz < CITY_N; tz++) for (let tx = 0; tx < CITY_N; tx++) {
    const tpl = TPLS[tileAt(tx, tz)];
    if (!tpl) continue;
    const p = { tpl, tx, tz };
    for (let j = 0; j < tpl.td; j++) for (let i = 0; i < tpl.tw; i++) {
      cover[(tz + j) * CITY_N + (tx + i)] = p;
    }
  }
  function placementAt(tx, tz) {
    if (tx < 0 || tz < 0 || tx >= CITY_N || tz >= CITY_N) return null;
    return cover[tz * CITY_N + tx];
  }
  var inMetroRes = (tx, tz) => tx >= METRO_RES.tx0 && tx <= METRO_RES.tx1 && tz >= METRO_RES.tz0 && tz <= METRO_RES.tz1;

  // src/world/chunks.ts
  var CHUNK_TILES = 4;
  var CHUNK_M = CHUNK_TILES * TILE;
  var NCHUNK = CITY_N / CHUNK_TILES;
  var LOAD_R = 2;
  var UNLOAD_R = 3;
  var chunks = /* @__PURE__ */ new Map();
  var key = (cx, cz) => cx * NCHUNK + cz;
  function chunkAt(cx, cz) {
    return chunks.get(key(cx, cz));
  }
  function loadedChunks() {
    return chunks.values();
  }
  function chunksLoaded() {
    return chunks.size;
  }
  var chunkOf = (w) => Math.floor((w + WORLD_HALF) / CHUNK_M);
  function mulberry(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var C_ASPHALT = [0.21, 0.215, 0.225];
  var C_ROAD = [0.125, 0.125, 0.135];
  var C_MARK = [0.55, 0.55, 0.48];
  var C_GLASS = [0.045, 0.055, 0.085];
  var C_FLOORIN = [0.3, 0.28, 0.25];
  var C_ROOF = [0.18, 0.18, 0.19];
  var C_STAIR2 = [0.36, 0.38, 0.43];
  var C_TRUNK = [0.23, 0.16, 0.1];
  var C_CROWN = [0.07, 0.14, 0.06];
  var C_POLE = [0.3, 0.32, 0.36];
  var C_BAG = [0.42, 0.38, 0.27];
  var CAR_COLS = [[0.45, 0.12, 0.1], [0.14, 0.22, 0.38], [0.4, 0.4, 0.42], [0.5, 0.46, 0.34], [0.16, 0.3, 0.2]];
  function buildChunk(cx, cz) {
    const rnd = mulberry(cx * 73856093 + cz * 19349663 + 7);
    const arr = [];
    const colliders2 = [];
    const recs = [];
    const ch = { cx, cz, mesh: null, colliders: colliders2, lamps: [], spawns: [], traders: [], safes: [] };
    function B2(x, y, z, sx, sy, sz, col, mat, g, collide) {
      const vertStart = arr.length / 10;
      pushBox(arr, x, y, z, sx, sy, sz, col, mat, g);
      if (collide) {
        const dmg = { vertStart, col, mat, g };
        recs.push(dmg);
        colliders2.push({ x0: x - sx / 2, x1: x + sx / 2, y0: y - sy / 2, y1: y + sy / 2, z0: z - sz / 2, z1: z + sz / 2, col, dmg });
      }
    }
    for (let lt = 0; lt < CHUNK_TILES; lt++) for (let kt = 0; kt < CHUNK_TILES; kt++) {
      const tx = cx * CHUNK_TILES + kt, tz = cz * CHUNK_TILES + lt;
      const wx = tx * TILE - WORLD_HALF, wz = tz * TILE - WORLD_HALF;
      const cxm = wx + TILE / 2, czm = wz + TILE / 2;
      const t = tileAt(tx, tz);
      if (!inMetroRes(tx, tz)) {
        const road = t === "r";
        const gcol = road ? C_ROAD : C_ASPHALT;
        B2(cxm, STREET_Y - 0.1, czm, TILE, 0.2, TILE, gcol, 0, 0.92 + rnd() * 0.16, true);
        if (road) {
          if (tz % 9 === 0 && tx % 9 !== 0) {
            B2(wx + 2, STREET_Y + 0.011, czm, 1.7, 0.022, 0.26, C_MARK, 0, 1, false);
            B2(wx + 6, STREET_Y + 0.011, czm, 1.7, 0.022, 0.26, C_MARK, 0, 1, false);
          } else if (tx % 9 === 0 && tz % 9 !== 0) {
            B2(cxm, STREET_Y + 0.011, wz + 2, 0.26, 0.022, 1.7, C_MARK, 0, 1, false);
            B2(cxm, STREET_Y + 0.011, wz + 6, 0.26, 0.022, 1.7, C_MARK, 0, 1, false);
          }
        }
      }
      if (tx === 0 || tz === 0 || tx === CITY_N - 1 || tz === CITY_N - 1) {
        B2(cxm, STREET_Y + 1.75, czm, TILE, 3.5, TILE, [0.26, 0.27, 0.3], 0, 0.95, true);
        continue;
      }
      if (t === "c") buildCar(cxm, czm, tx, tz, rnd);
      else if (t === "L") {
        B2(cxm, STREET_Y + 2.3, czm, 0.16, 4.6, 0.16, C_POLE, 2, 1, false);
        ch.lamps.push({ x: cxm, y: STREET_Y + 4.4, z: czm, c: [1.1, 0.78, 0.42], fl: rnd() < 0.18 ? 1 : 0, kind: 1 });
      } else if (t === "t") {
        const jx = cxm + (rnd() - 0.5) * 3, jz = czm + (rnd() - 0.5) * 3, h = 2.2 + rnd() * 1.2;
        B2(jx, STREET_Y + h / 2, jz, 0.28, h, 0.28, C_TRUNK, 0, 1, true);
        B2(jx, STREET_Y + h + 0.7, jz, 2, 1.7, 2, C_CROWN, 0, 0.85 + rnd() * 0.3, false);
        B2(jx, STREET_Y + h + 1.7, jz, 1.2, 1.1, 1.2, C_CROWN, 0, 0.85 + rnd() * 0.3, false);
      } else if (t === "Z") ch.spawns.push({ x: cxm, z: czm });
      const p = placementAt(tx, tz);
      if (p) buildBuildingTile(p, tx, tz, wx, wz);
    }
    function buildCar(x, z, tx, tz, rnd2) {
      const alongX = tileAt(tx, tz - 1) === "r" || tileAt(tx, tz + 1) === "r" || rnd2() < 0.5;
      const col = CAR_COLS[Math.floor(rnd2() * CAR_COLS.length)];
      const L = 4.3, W = 1.85, g = 0.8 + rnd2() * 0.3;
      const bx = alongX ? L : W, bz = alongX ? W : L;
      B2(x, STREET_Y + 0.62, z, bx, 0.75, bz, col, 2, g, true);
      B2(
        x + (alongX ? -0.35 : 0),
        STREET_Y + 1.3,
        z + (alongX ? 0 : -0.35),
        alongX ? 2 : 1.6,
        0.62,
        alongX ? 1.6 : 2,
        [col[0] * 0.5, col[1] * 0.5, col[2] * 0.55],
        2,
        g,
        true
      );
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        B2(
          x + sx * (alongX ? 1.4 : 0.8),
          STREET_Y + 0.3,
          z + sz * (alongX ? 0.8 : 1.4),
          alongX ? 0.62 : 0.3,
          0.6,
          alongX ? 0.3 : 0.62,
          [0.06, 0.06, 0.07],
          0,
          1,
          false
        );
      }
    }
    function buildBuildingTile(p, tx, tz, wx, wz) {
      const tpl = p.tpl;
      const ox = (tx - p.tx) * 8, oz = (tz - p.tz) * 8;
      const gOf = (f) => 0.88 + (p.tx * 31 + p.tz * 17 + f * 7) % 13 / 13 * 0.2;
      const nFloors = tpl.floors.length;
      for (let f = 0; f < nFloors; f++) {
        const rowsF = tpl.floors[f];
        const floorY = STREET_Y + f * FLOOR_H;
        const g = gOf(f);
        for (let lz = 0; lz < 8; lz++) {
          const row2 = rowsF[oz + lz];
          const z = wz + lz + 0.5;
          let i = 0;
          while (i < 8) {
            const c = row2[ox + i];
            const kind = c === "w" || c === "b" || c === "o" ? 1 : c === "D" ? 2 : c === "g" ? 3 : c === "S" ? 4 : 0;
            if (kind === 0) {
              pointCell(c, wx + i + 0.5, floorY, z);
              i++;
              continue;
            }
            let j = i;
            const kindOf = (cc) => cc === "w" || cc === "b" || cc === "o" ? 1 : cc === "D" ? 2 : cc === "g" ? 3 : cc === "S" ? 4 : 0;
            while (j < 8 && kindOf(row2[ox + j]) === kind) j++;
            const len = j - i, mid = wx + i + len / 2;
            if (kind === 1) {
              B2(mid, floorY + FLOOR_H / 2, z, len, FLOOR_H, 1, tpl.wall, 0, g, true);
              for (let k = i; k < j; k++) if (row2[ox + k] === "o") {
                B2(wx + k + 0.5, floorY + 1.75, z, 0.92, 1.5, 1.12, C_GLASS, 0, 1, false);
              }
            } else if (kind === 2) {
              B2(mid, floorY + 2.8, z, len, 0.8, 1, tpl.wall, 0, g, true);
            } else if (kind === 3) {
              B2(mid, floorY + 2.9, z, len, 0.6, 1, tpl.wall, 0, g, true);
              B2(mid, floorY + 1.3, z, len, 2.6, 0.24, C_GLASS, 0, 1, true);
            } else {
              let s0 = ox + i;
              while (s0 > 0 && row2[s0 - 1] === "S") s0--;
              let s1 = ox + j;
              while (s1 < tpl.tw * 8 && row2[s1] === "S") s1++;
              const n = s1 - s0, rise = FLOOR_H / n;
              for (let k = i; k < j; k++) {
                const step = ox + k - s0;
                B2(wx + k + 0.5, floorY + rise * (step + 1) - 0.25, z, 1, 0.5, 1, C_STAIR2, 0, g, true);
              }
            }
            i = j;
          }
          if (f > 0) {
            const below = tpl.floors[f - 1][oz + lz];
            let a = 0;
            while (a < 8) {
              const ok = (k) => rowsF[oz + lz][ox + k] !== " " && below[ox + k] !== "S" && below[ox + k] !== "x" && tpl.floors[f - 1][oz + lz][ox + k] !== "S";
              if (!ok(a)) {
                a++;
                continue;
              }
              let b2 = a;
              while (b2 < 8 && ok(b2)) b2++;
              B2(wx + a + (b2 - a) / 2, floorY - 0.1, z, b2 - a, 0.2, 1, C_FLOORIN, 0, g, true);
              a = b2;
            }
          }
        }
      }
      const top = tpl.floors[nFloors - 1];
      const roofY = STREET_Y + nFloors * FLOOR_H;
      for (let lz = 0; lz < 8; lz++) {
        const z = wz + lz + 0.5;
        let a = 0;
        while (a < 8) {
          if (top[oz + lz][ox + a] === " ") {
            a++;
            continue;
          }
          let b2 = a;
          while (b2 < 8 && top[oz + lz][ox + b2] !== " ") b2++;
          B2(wx + a + (b2 - a) / 2, roofY - 0.1, z, b2 - a, 0.2, 1, C_ROOF, 0, gOf(nFloors), true);
          a = b2;
        }
      }
      if (tpl.name === "shelter" && tx === p.tx && tz === p.tz) {
        ch.safes.push({ x: wx + tpl.tw * 4, z: wz + tpl.td * 4, r: 15 });
      }
    }
    function pointCell(c, x, floorY, z) {
      if (c === "T") ch.traders.push({ x, y: floorY, z });
      else if (c === "s") {
        B2(x, floorY + 0.38, z, 0.96, 0.76, 0.96, C_BAG, 0, 0.9, true);
        B2(x, floorY + 0.93, z, 0.7, 0.34, 0.7, C_BAG, 0, 0.82, false);
      } else if (c === "L") {
        ch.lamps.push({ x, y: floorY + 2.9, z, c: [1, 0.82, 0.55], fl: 0, kind: 2 });
      }
    }
    if (arr.length > 0) {
      ch.mesh = makeMesh(arr);
      for (const r of recs) r.buf = ch.mesh.buf;
    }
    return ch;
  }
  function ensureChunks(px, pz) {
    const pcx = chunkOf(px), pcz = chunkOf(pz);
    for (const ch of chunks.values()) {
      if (Math.max(Math.abs(ch.cx - pcx), Math.abs(ch.cz - pcz)) > UNLOAD_R) {
        if (ch.mesh) {
          dropDamageForBuffer(ch.mesh.buf);
          gl.deleteBuffer(ch.mesh.buf);
        }
        chunks.delete(key(ch.cx, ch.cz));
      }
    }
    let bx = -1, bz = -1, bd = 1e9;
    for (let dx = -LOAD_R; dx <= LOAD_R; dx++) for (let dz = -LOAD_R; dz <= LOAD_R; dz++) {
      const cx = pcx + dx, cz = pcz + dz;
      if (cx < 0 || cz < 0 || cx >= NCHUNK || cz >= NCHUNK || chunks.has(key(cx, cz))) continue;
      const d = dx * dx + dz * dz;
      if (d < bd) {
        bd = d;
        bx = cx;
        bz = cz;
      }
    }
    if (bx >= 0) chunks.set(key(bx, bz), buildChunk(bx, bz));
  }

  // src/game/world.ts
  var METRO = { x0: -45, x1: 45, z0: -30, z1: 30 };
  var nearList = [];
  function collidersNear(x, z, r) {
    nearList.length = 0;
    if (x > METRO.x0 - r && x < METRO.x1 + r && z > METRO.z0 - r && z < METRO.z1 + r) {
      for (const c of colliders) nearList.push(c);
    }
    const cx0 = chunkOf(x - r), cx1 = chunkOf(x + r);
    const cz0 = chunkOf(z - r), cz1 = chunkOf(z + r);
    for (let cx = cx0; cx <= cx1; cx++) for (let cz = cz0; cz <= cz1; cz++) {
      const ch = chunkAt(cx, cz);
      if (ch) for (const c of ch.colliders) nearList.push(c);
    }
    return nearList;
  }
  var rayList = [];
  function collidersAlongRay(ox, oz, dx, dz, maxDist) {
    rayList.length = 0;
    const ex = ox + dx * maxDist, ez = oz + dz * maxDist;
    const minx = Math.min(ox, ex), maxx = Math.max(ox, ex);
    const minz = Math.min(oz, ez), maxz = Math.max(oz, ez);
    if (maxx > METRO.x0 && minx < METRO.x1 && maxz > METRO.z0 && minz < METRO.z1) {
      for (const c of colliders) rayList.push(c);
    }
    let cx = chunkOf(ox), cz = chunkOf(oz);
    const stepX = dx > 0 ? 1 : -1, stepZ = dz > 0 ? 1 : -1;
    const tdx = Math.abs(dx) < 1e-9 ? 1e9 : CHUNK_M / Math.abs(dx);
    const tdz = Math.abs(dz) < 1e-9 ? 1e9 : CHUNK_M / Math.abs(dz);
    const fx = (ox + WORLD_HALF) / CHUNK_M - cx, fz = (oz + WORLD_HALF) / CHUNK_M - cz;
    let tmx = tdx * (dx > 0 ? 1 - fx : fx), tmz = tdz * (dz > 0 ? 1 - fz : fz);
    let t = 0;
    for (let s = 0; s < 12 && t <= maxDist; s++) {
      const ch = chunkAt(cx, cz);
      if (ch) for (const c of ch.colliders) rayList.push(c);
      if (tmx < tmz) {
        t = tmx;
        tmx += tdx;
        cx += stepX;
      } else {
        t = tmz;
        tmz += tdz;
        cz += stepZ;
      }
    }
    return rayList;
  }
  var lampScratch = [];
  for (let i = 0; i < 24; i++) lampScratch.push({ x: 0, y: 0, z: 0, c: [0, 0, 0], fl: 0, kind: 0, i: 1 });
  var lampCount = 0;
  function frameLamps(px, pz, underground, t) {
    lampCount = 0;
    const put = (x, y, z, c, fl, kind) => {
      if (lampCount >= 16) return;
      const L = lampScratch[lampCount++];
      L.x = x;
      L.y = y;
      L.z = z;
      L.c = c;
      L.fl = fl;
      L.kind = kind;
      L.i = lampIntensity(L, t);
    };
    if (underground) {
      for (const l of lamps) put(l.x, l.y, l.z, l.c, l.fl, 0);
    } else {
      for (const l of plazaLamps) {
        const d2 = (l.x - px) * (l.x - px) + (l.z - pz) * (l.z - pz);
        if (d2 < 45 * 45) put(l.x, l.y, l.z, l.c, l.fl, 1);
      }
      for (const ch of loadedChunks()) {
        for (const l of ch.lamps) {
          const d2 = (l.x - px) * (l.x - px) + (l.z - pz) * (l.z - pz);
          if (d2 < 45 * 45) put(l.x, l.y, l.z, l.c, l.fl, l.kind);
        }
      }
    }
    lampScratch.length = 24;
    return lampScratch;
  }
  function frameLampCount() {
    return lampCount;
  }
  var safeScratch = [];
  function allSafes() {
    safeScratch.length = 0;
    for (const ch of loadedChunks()) for (const s of ch.safes) safeScratch.push(s);
    return safeScratch;
  }
  function safeZoneAt(x, z) {
    for (const ch of loadedChunks()) {
      for (const s of ch.safes) {
        const dx = x - s.x, dz = z - s.z;
        if (dx * dx + dz * dz < s.r * s.r) return s;
      }
    }
    return null;
  }
  var traderScratch = { x: 0, y: 0, z: 0 };
  function traderNear(px, py, pz, maxD) {
    for (const ch of loadedChunks()) {
      for (const tr of ch.traders) {
        const dx = tr.x - px, dz = tr.z - pz;
        if (dx * dx + dz * dz < maxD * maxD && Math.abs(tr.y - py) < 2.5) {
          traderScratch.x = tr.x;
          traderScratch.y = tr.y;
          traderScratch.z = tr.z;
          return traderScratch;
        }
      }
    }
    return null;
  }
  var markerScratch = [];
  function spawnMarkersNear(px, pz, rMin, rMax) {
    markerScratch.length = 0;
    for (const ch of loadedChunks()) {
      for (const m of ch.spawns) {
        const d2 = (m.x - px) * (m.x - px) + (m.z - pz) * (m.z - pz);
        if (d2 > rMin * rMin && d2 < rMax * rMax && !safeZoneAt(m.x, m.z)) markerScratch.push(m);
      }
    }
    return markerScratch;
  }

  // src/core/ray.ts
  function rayBox(ox, oy, oz, dx, dy, dz, b, info) {
    let tmin = 0, tmax = 1e9, axis = -1, sign = 0;
    const ax = [ox, oy, oz], ad = [dx, dy, dz], b0 = [b.x0, b.y0, b.z0], b1 = [b.x1, b.y1, b.z1];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(ad[i]) < 1e-9) {
        if (ax[i] < b0[i] || ax[i] > b1[i]) return Infinity;
      } else {
        let t1 = (b0[i] - ax[i]) / ad[i], t2 = (b1[i] - ax[i]) / ad[i];
        const s = ad[i] > 0 ? -1 : 1;
        if (t1 > t2) {
          const tmp = t1;
          t1 = t2;
          t2 = tmp;
        }
        if (t1 > tmin) {
          tmin = t1;
          axis = i;
          sign = s;
        }
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) return Infinity;
      }
    }
    if (info) {
      info.axis = axis;
      info.sign = sign;
    }
    return tmin;
  }

  // src/core/physics.ts
  var GRAV = 20;
  var STEP_UP = 0.55;
  function overlapsXZ(c, x, z, r) {
    return x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1;
  }
  function moveAxis(e, list, axis, d) {
    if (d === 0) return;
    const p0 = e[axis];
    e[axis] += d;
    const r = e.r;
    for (const c of list) {
      if (!overlapsXZ(c, e.x, e.z, r)) continue;
      if (c.y1 <= e.y + STEP_UP + 0.01) continue;
      if (c.y0 >= e.y + e.h) continue;
      const lo = axis === "x" ? c.x0 : c.z0, hi = axis === "x" ? c.x1 : c.z1;
      if (p0 + r > lo && p0 - r < hi) continue;
      e[axis] = d > 0 ? lo - r : hi + r;
    }
  }
  function groundIn(e, list) {
    let g = -50;
    for (const c of list) {
      if (!overlapsXZ(c, e.x, e.z, e.r * 0.8)) continue;
      if (c.y1 <= e.y + STEP_UP + 0.01 && c.y1 > g) g = c.y1;
    }
    return g;
  }
  function groundAt(e) {
    return groundIn(e, collidersNear(e.x, e.z, e.r + 0.5));
  }
  function physStep(e, dx, dz, dt) {
    const list = collidersNear(e.x, e.z, e.r + Math.abs(dx) + Math.abs(dz) + 0.6);
    moveAxis(e, list, "x", dx);
    moveAxis(e, list, "z", dz);
    e.vy -= GRAV * dt;
    const g = groundIn(e, list);
    e.y += e.vy * dt;
    if (e.y <= g) {
      e.y = g;
      e.vy = 0;
      e.grounded = true;
    } else e.grounded = e.y - g < 0.02;
    if (e.grounded && g > e.y) e.y = g;
  }
  function quickFloor(x, z, y) {
    let g = -50;
    for (const c of collidersNear(x, z, 0.4)) {
      if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1 && c.y1 <= y + 0.1 && c.y1 > g) g = c.y1;
    }
    return g;
  }

  // src/game/particles.ts
  var particles = [];
  var tracers = [];
  var decals = [];
  var bloodPools = [];
  function resetParticles() {
    particles.length = 0;
    tracers.length = 0;
    decals.length = 0;
    bloodPools.length = 0;
  }
  function emit(opts) {
    if (particles.length > 220) particles.shift();
    particles.push({
      x: opts.x,
      y: opts.y,
      z: opts.z,
      vx: opts.vx || 0,
      vy: opts.vy || 0,
      vz: opts.vz || 0,
      life: 0,
      max: opts.max || 0.6,
      size: opts.size || 0.05,
      r: opts.r,
      g: opts.g,
      b: opts.b,
      em: opts.em || 0,
      grav: opts.grav !== void 0 ? opts.grav : 10,
      drag: opts.drag || 0,
      floor: opts.floor !== void 0 ? opts.floor : -50,
      bounce: opts.bounce || 0,
      grow: opts.grow || 0,
      ry: Math.random() * 6.28,
      vr: opts.vr || 0
    });
  }
  function burstChunks(x, y, z, n, dx, dy, dz, col, sizeMin, sizeMax) {
    const fl = quickFloor(x, z, y);
    for (let i = 0; i < n; i++) {
      const shade = 0.75 + Math.random() * 0.45;
      emit({
        x,
        y,
        z,
        vx: dx * 2.2 + (Math.random() - 0.5) * 3.4,
        vy: dy * 1.5 + 1.2 + Math.random() * 2.4,
        vz: dz * 2.2 + (Math.random() - 0.5) * 3.4,
        max: 0.8 + Math.random() * 0.8,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        r: col[0] * shade,
        g: col[1] * shade,
        b: col[2] * shade,
        em: 0.12,
        grav: 12,
        floor: fl,
        bounce: 0.3 + Math.random() * 0.25,
        vr: (Math.random() - 0.5) * 14
      });
    }
  }
  function burstBlood(x, y, z, n, dx, dy, dz) {
    const fl = quickFloor(x, z, y);
    for (let i = 0; i < n; i++) {
      emit({
        x,
        y,
        z,
        vx: dx * 2 + (Math.random() - 0.5) * 3,
        vy: dy + Math.random() * 2.5,
        vz: dz * 2 + (Math.random() - 0.5) * 3,
        max: 0.5 + Math.random() * 0.4,
        size: 0.035 + Math.random() * 0.05,
        r: 0.3,
        g: 0.02,
        b: 0.02,
        em: 0.3,
        grav: 13,
        floor: fl,
        bounce: 0.1
      });
    }
  }
  function burstDust(x, y, z, n, nx, ny, nz, col) {
    for (let i = 0; i < n; i++) {
      emit({
        x,
        y,
        z,
        vx: nx * (1 + Math.random() * 1.5) + (Math.random() - 0.5) * 1.4,
        vy: ny * (1 + Math.random()) + Math.random() * 1.2,
        vz: nz * (1 + Math.random() * 1.5) + (Math.random() - 0.5) * 1.4,
        max: 0.35 + Math.random() * 0.3,
        size: 0.03 + Math.random() * 0.04,
        r: col[0],
        g: col[1],
        b: col[2],
        em: 0.12,
        grav: 3,
        drag: 2
      });
    }
  }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life >= p.max) {
        particles.splice(i, 1);
        continue;
      }
      p.vy -= p.grav * dt;
      if (p.drag) {
        const k = Math.pow(0.5, dt * p.drag);
        p.vx *= k;
        p.vy *= k;
        p.vz *= k;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      if (p.vr) p.ry += p.vr * dt;
      if (p.grow) p.size += p.grow * dt;
      if (p.y - p.size / 2 < p.floor) {
        p.y = p.floor + p.size / 2;
        if (p.bounce > 0 && Math.abs(p.vy) > 0.5) {
          p.vy = -p.vy * p.bounce;
          p.vx *= 0.6;
          p.vz *= 0.6;
          p.vr *= 0.7;
        } else {
          p.vy = 0;
          p.vx *= 0.85;
          p.vz *= 0.85;
          p.vr *= 0.8;
        }
      }
    }
    for (let i = tracers.length - 1; i >= 0; i--) {
      tracers[i].life += dt;
      if (tracers[i].life > 0.06) tracers.splice(i, 1);
    }
    for (let i = bloodPools.length - 1; i >= 0; i--) {
      bloodPools[i].life += dt;
      if (bloodPools[i].life > 70) bloodPools.splice(i, 1);
    }
  }
  function addDecal(x, y, z, axis, sign) {
    if (decals.length > 48) decals.shift();
    decals.push({ x, y, z, axis, sign });
  }
  function addBloodPool(x, y, z) {
    if (bloodPools.length > 24) bloodPools.shift();
    bloodPools.push({ x, y: y + 0.012, z, life: 0, s: 0.6 + Math.random() * 0.5, ry: Math.random() * 6.28 });
  }

  // src/game/weapons.ts
  var WEAPONS = [
    {
      name: "Автомат",
      magSize: 30,
      reserveMax: 300,
      rate: 0.105,
      reload: 1.35,
      dmg: 30,
      headMul: 2.5,
      pellets: 1,
      spread: 1,
      kick: 0.35,
      auto: true,
      price: 0,
      ammoPack: 60,
      ammoPrice: 25
    },
    {
      name: "Дробовик",
      magSize: 6,
      reserveMax: 60,
      rate: 0.75,
      reload: 2.2,
      dmg: 14,
      headMul: 2,
      pellets: 7,
      spread: 4.5,
      kick: 0.9,
      auto: false,
      price: 150,
      ammoPack: 12,
      ammoPrice: 30
    },
    {
      name: "Пулемёт",
      magSize: 100,
      reserveMax: 400,
      rate: 0.075,
      reload: 3.5,
      dmg: 34,
      headMul: 2.2,
      pellets: 1,
      spread: 1.7,
      kick: 0.28,
      auto: true,
      price: 400,
      ammoPack: 100,
      ammoPrice: 60
    }
  ];

  // src/game/state.ts
  var RANKS = [
    { s: 0, n: "Безбилетник" },
    { s: 500, n: "Гроза турникетов" },
    { s: 1500, n: "Властелин эскалатора" },
    { s: 3e3, n: "Голос в громкоговорителе" },
    { s: 5e3, n: "Машинист апокалипсиса" },
    { s: 8e3, n: "Тёмный лорд депо" },
    { s: 12e3, n: "Легенда последнего вагона" },
    { s: 2e4, n: "Бог пересадочного узла" }
  ];
  function defaultSlots() {
    return [
      { owned: true, mag: WEAPONS[0].magSize, reserve: 120 },
      { owned: false, mag: 0, reserve: 0 },
      { owned: false, mag: 0, reserve: 0 }
    ];
  }
  var player = {
    x: 0,
    y: 0,
    z: 2,
    vy: 0,
    velx: 0,
    velz: 0,
    yaw: Math.PI / 2,
    pitch: 0,
    hp: 100,
    grounded: true,
    wasGrounded: true,
    mag: 30,
    reserve: 120,
    weapon: 0,
    slots: defaultSlots(),
    fireLatch: false,
    reloading: 0,
    shootCd: 0,
    bob: 0,
    bobPrev: 0,
    recoil: 0,
    flash: 0,
    fov: 1.2,
    swayX: 0,
    swayY: 0,
    torch: false,
    r: 0.38,
    h: 1.7
  };
  var zombies = [];
  var state = {
    started: false,
    alive: true,
    score: 0,
    kills: 0,
    money: 0,
    // жетоны — валюта торговцев (начисляются за киллы)
    shopOpen: false,
    // магазин открыт: стрельба заблокирована (ставит ui/shop.ts)
    rankIdx: 0,
    spawnTimer: 2.5,
    elapsed: 0,
    cycleT: 0,
    // позиция в цикле день/ночь, сек (см. daycycle.ts); 0 = 19:00, начало ночи
    dmgFlash: 0,
    // вспышка урона (0..1)
    camShake: 0
    // тряска камеры (0..1.4)
  };
  function resetGame() {
    player.x = 0;
    player.y = 0;
    player.z = 2;
    player.vy = 0;
    player.velx = 0;
    player.velz = 0;
    player.yaw = Math.PI / 2;
    player.pitch = 0;
    player.hp = 100;
    player.grounded = true;
    player.wasGrounded = true;
    player.mag = 30;
    player.reserve = 120;
    player.weapon = 0;
    player.slots = defaultSlots();
    player.fireLatch = false;
    player.reloading = 0;
    player.shootCd = 0;
    player.bob = 0;
    player.bobPrev = 0;
    player.recoil = 0;
    player.flash = 0;
    player.fov = 1.2;
    player.swayX = 0;
    player.swayY = 0;
    player.torch = false;
    zombies.length = 0;
    resetParticles();
    state.score = 0;
    state.kills = 0;
    state.money = 0;
    state.rankIdx = 0;
    state.spawnTimer = 2.5;
    state.elapsed = 0;
    state.cycleT = 0;
    state.dmgFlash = 0;
    state.camShake = 0;
    state.alive = true;
    for (const s of pickupSlots) {
      s.active = true;
      s.timer = 0;
    }
  }

  // src/audio/engine.ts
  var actx = null;
  var master = null;
  var noiseBuf = null;
  var echoIn = null;
  function initAudio() {
    if (actx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    actx = new AC();
    const comp = actx.createDynamicsCompressor();
    master = actx.createGain();
    master.gain.value = 0.55;
    master.connect(comp);
    comp.connect(actx.destination);
    noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    echoIn = actx.createGain();
    echoIn.gain.value = 0.5;
    const dly = actx.createDelay(0.5);
    dly.delayTime.value = 0.16;
    const fb = actx.createGain();
    fb.gain.value = 0.34;
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1300;
    echoIn.connect(dly);
    dly.connect(lp);
    lp.connect(fb);
    fb.connect(dly);
    lp.connect(master);
    startAmbient();
  }
  function resumeAudio() {
    if (actx && actx.state === "suspended") actx.resume();
  }
  function suspendAudio() {
    if (actx) actx.suspend();
  }
  function noiseShot(dur, filterType, freq, q, vol, pan, echo) {
    if (!actx || !noiseBuf) return;
    const ctx = actx;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = 0.85 + Math.random() * 0.3;
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + dur);
    src.connect(f);
    f.connect(g);
    connectPan(g, pan, echo);
    src.start();
    src.stop(ctx.currentTime + dur);
  }
  function tone(type, f0, f1, dur, vol, delay, pan, echo) {
    if (!actx) return;
    const ctx = actx;
    const t0 = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(1e-3, t0 + dur);
    o.connect(g);
    connectPan(g, pan, echo);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  function connectPan(node, pan, echo) {
    if (!actx || !master || !echoIn) return;
    let out = node;
    if (pan !== void 0 && pan !== null && actx.createStereoPanner) {
      const p = actx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(p);
      out = p;
    }
    out.connect(master);
    if (echo) out.connect(echoIn);
  }
  function startAmbient() {
    if (!actx || !master || !noiseBuf) return;
    const ctx = actx, mst = master;
    const mk = (f2, v) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f2;
      const g2 = ctx.createGain();
      g2.gain.value = v;
      o.connect(g2);
      g2.connect(mst);
      o.start();
    };
    mk(46, 0.045);
    mk(46.8, 0.04);
    mk(92.5, 0.012);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 180;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    src.connect(f);
    f.connect(g);
    g.connect(mst);
    src.start();
  }
  var clankTimer = 6;
  var trainTimer = 30;
  function ambientFx(dt) {
    clankTimer -= dt;
    if (clankTimer <= 0) {
      clankTimer = 7 + Math.random() * 14;
      const pan = Math.random() * 2 - 1;
      tone("square", 700 + Math.random() * 900, 120, 0.5, 0.05, 0, pan, true);
      noiseShot(0.7, "bandpass", 1400, 6, 0.05, pan, true);
    }
    trainTimer -= dt;
    if (trainTimer <= 0 && actx && noiseBuf && master) {
      trainTimer = 50 + Math.random() * 50;
      const ctx = actx;
      const t0 = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(60, t0);
      f.frequency.linearRampToValueAtTime(140, t0 + 3);
      f.frequency.linearRampToValueAtTime(50, t0 + 7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(1e-3, t0);
      g.gain.linearRampToValueAtTime(0.14, t0 + 3);
      g.gain.linearRampToValueAtTime(1e-3, t0 + 7);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(t0);
      src.stop(t0 + 7.2);
      tone("sine", 32, 28, 6, 0.1, 0.5);
    }
  }

  // src/audio/sfx.ts
  function spatial(x, z) {
    const dx = x - player.x, dz = z - player.z;
    const dist = Math.hypot(dx, dz);
    const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
    return { pan: Math.max(-1, Math.min(1, (dx * rx + dz * rz) / Math.max(dist, 0.1))), vol: Math.min(1, 5 / Math.max(dist, 1)) };
  }
  var sfx = {
    // w — индекс оружия: 0 автомат, 1 дробовик (тяжёлый бас), 2 пулемёт (грубее)
    shoot(w = 0) {
      if (w === 1) {
        noiseShot(0.12, "bandpass", 1300, 0.8, 0.55, null, true);
        noiseShot(0.3, "lowpass", 260, 1, 0.6, null, true);
        tone("square", 95, 38, 0.1, 0.4);
      } else if (w === 2) {
        noiseShot(0.08, "bandpass", 1500, 0.7, 0.5, null, true);
        noiseShot(0.15, "lowpass", 360, 1, 0.5, null, true);
        tone("square", 120, 45, 0.05, 0.32);
      } else {
        noiseShot(0.09, "bandpass", 1900, 0.7, 0.5, null, true);
        noiseShot(0.16, "lowpass", 420, 1, 0.45, null, true);
        tone("square", 140, 50, 0.05, 0.3);
      }
    },
    swap() {
      tone("square", 300, 210, 0.05, 0.16);
      noiseShot(0.04, "highpass", 2200, 1, 0.12);
    },
    torch() {
      tone("square", 1300, 900, 0.03, 0.1);
    },
    // щелчок фонарика
    buy() {
      tone("triangle", 880, 1320, 0.08, 0.22);
      tone("triangle", 1320, 1760, 0.1, 0.18, 0.07);
    },
    dry() {
      tone("square", 900, 700, 0.04, 0.12);
    },
    reload() {
      tone("square", 420, 300, 0.05, 0.2);
      noiseShot(0.05, "highpass", 2500, 1, 0.15);
      tone("square", 520, 640, 0.05, 0.2, 0.55);
      noiseShot(0.06, "highpass", 3e3, 1, 0.18, 0, false);
    },
    hit() {
      noiseShot(0.07, "lowpass", 650, 1, 0.4);
      tone("sine", 110, 70, 0.08, 0.3);
    },
    growl(x, z) {
      const s = spatial(x, z);
      tone("sawtooth", 50 + Math.random() * 45, 38, 0.7 + Math.random() * 0.4, 0.3 * s.vol, 0, s.pan, true);
      noiseShot(0.5, "lowpass", 300, 1, 0.12 * s.vol, s.pan);
    },
    zdie(x, z) {
      const s = spatial(x, z);
      tone("sawtooth", 130, 30, 0.55, 0.32 * s.vol, 0, s.pan, true);
      noiseShot(0.3, "lowpass", 420, 1, 0.22 * s.vol, s.pan);
    },
    pickup() {
      tone("triangle", 660, 660, 0.09, 0.25);
      tone("triangle", 990, 990, 0.12, 0.25, 0.09);
    },
    heal() {
      tone("sine", 520, 780, 0.18, 0.25);
      tone("sine", 780, 1040, 0.2, 0.2, 0.15);
    },
    hurt() {
      tone("sine", 85, 45, 0.3, 0.5);
      noiseShot(0.18, "lowpass", 500, 1, 0.3);
    },
    rank() {
      [392, 523, 659, 784].forEach((f, i) => tone("square", f, f, 0.13, 0.22, i * 0.11));
    },
    step(run) {
      noiseShot(0.05, "lowpass", 230 + Math.random() * 140, 1, run ? 0.1 : 0.06);
    },
    land() {
      noiseShot(0.12, "lowpass", 180, 1, 0.3);
      tone("sine", 70, 40, 0.12, 0.25);
    },
    die() {
      tone("sawtooth", 200, 30, 1.4, 0.4, 0, null, true);
      noiseShot(0.8, "lowpass", 300, 1, 0.3);
    }
  };

  // src/game/daycycle.ts
  var NIGHT_LEN = 360;
  var DAY_LEN = 120;
  var CYCLE = NIGHT_LEN + DAY_LEN;
  var clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
  var sstep = (e0, e1, x) => {
    const t = clamp01((x - e0) / (e1 - e0));
    return t * t * (3 - 2 * t);
  };
  function sunAngle() {
    const t = state.cycleT;
    return t < NIGHT_LEN ? Math.PI + t / NIGHT_LEN * Math.PI : (t - NIGHT_LEN) / DAY_LEN * Math.PI;
  }
  function dayK() {
    return sstep(-0.08, 0.22, Math.sin(sunAngle()));
  }
  function isDay() {
    return state.cycleT >= NIGHT_LEN;
  }
  var sunScratch = [0, 0, 0];
  var moonScratch = [0, 0, 0];
  function dirInto(out, a, tilt) {
    const x = Math.cos(a), y = Math.sin(a);
    const l = Math.hypot(x, y, tilt) || 1;
    out[0] = x / l;
    out[1] = y / l;
    out[2] = tilt / l;
    return out;
  }
  function sunDir() {
    return dirInto(sunScratch, sunAngle(), -0.32);
  }
  function moonDir() {
    return dirInto(moonScratch, sunAngle() + Math.PI, 0.26);
  }
  function clockMinutes() {
    const t = state.cycleT;
    const mins = t < NIGHT_LEN ? (19 * 60 + t / NIGHT_LEN * 720) % 1440 : 7 * 60 + (t - NIGHT_LEN) / DAY_LEN * 720;
    return Math.floor(mins);
  }

  // src/ui/hud.ts
  var elScore = document.getElementById("score");
  var elRank = document.getElementById("rank");
  var elKills = document.getElementById("kills");
  var elMoney = document.getElementById("money");
  var elClock = document.getElementById("clock");
  var elWpn = document.getElementById("wpn");
  var elHpBar = document.getElementById("hpbar");
  var elHpText = document.getElementById("hptext");
  var elAmmo = document.getElementById("ammo");
  var elPopups = document.getElementById("popups");
  var elCross = document.getElementById("cross");
  var elDmg = document.getElementById("dmg");
  var elZhp = document.getElementById("zhp");
  var elZhpBar = document.getElementById("zhpbar");
  var hScore = -1;
  var hRankIdx = -1;
  var hKills = -1;
  var hMoney = -1;
  var hWpn = -1;
  var hHp = -1e9;
  var hHpText = -1e9;
  var hMag = -2;
  var hReserve = -1;
  var hDmg = -1;
  var hClock = -1;
  var hLow = null;
  function updateHUD() {
    if (state.score !== hScore) {
      hScore = state.score;
      elScore.textContent = String(state.score);
    }
    if (state.rankIdx !== hRankIdx) {
      hRankIdx = state.rankIdx;
      elRank.textContent = RANKS[state.rankIdx].n;
    }
    if (state.kills !== hKills) {
      hKills = state.kills;
      elKills.textContent = "Убито: " + state.kills;
    }
    if (state.money !== hMoney) {
      hMoney = state.money;
      elMoney.textContent = "Жетоны: " + state.money;
    }
    const cm = clockMinutes();
    if (cm !== hClock) {
      hClock = cm;
      const hh = Math.floor(cm / 60), mm = cm % 60;
      elClock.textContent = (isDay() ? "☀ " : "🌙 ") + (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
    }
    if (player.weapon !== hWpn) {
      hWpn = player.weapon;
      elWpn.textContent = WEAPONS[player.weapon].name;
    }
    if (player.hp !== hHp) {
      hHp = player.hp;
      elHpBar.style.width = Math.max(0, player.hp) + "%";
    }
    const hpInt = Math.ceil(player.hp);
    if (hpInt !== hHpText) {
      hHpText = hpInt;
      elHpText.textContent = "HP " + hpInt + " / 100";
    }
    const magShown = player.reloading > 0 ? -1 : player.mag;
    if (magShown !== hMag || player.reserve !== hReserve) {
      hMag = magShown;
      hReserve = player.reserve;
      elAmmo.innerHTML = (magShown < 0 ? "..." : magShown) + " <small>запас " + player.reserve + "</small>";
    }
    const low = player.mag <= 8 && player.reloading <= 0;
    if (low !== hLow) {
      hLow = low;
      elAmmo.classList.toggle("low", low);
    }
    const dmg = Math.round(Math.min(1, state.dmgFlash * 0.9 + (1 - player.hp / 100) * 0.25) * 100) / 100;
    if (dmg !== hDmg) {
      hDmg = dmg;
      elDmg.style.opacity = String(dmg);
    }
  }
  var hAimShown = null;
  var hAimW = -1;
  function updateAimBar(z) {
    const shown = z !== null;
    if (shown !== hAimShown) {
      hAimShown = shown;
      elZhp.classList.toggle("hidden", !shown);
    }
    if (z) {
      const w = Math.round(Math.max(0, z.hp) / z.maxhp * 100);
      if (w !== hAimW) {
        hAimW = w;
        elZhpBar.style.width = w + "%";
      }
    }
  }
  function popup(text, color) {
    const d = document.createElement("div");
    d.className = "popup";
    d.textContent = text;
    d.style.color = color;
    elPopups.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  }
  var crossTo;
  function hitMarker() {
    elCross.classList.add("hit");
    clearTimeout(crossTo);
    crossTo = setTimeout(() => elCross.classList.remove("hit"), 90);
  }
  var rankBanner = document.getElementById("rankBanner");
  var bannerTo;
  function showRankBanner(name) {
    rankBanner.querySelector(".t2").textContent = name;
    rankBanner.classList.remove("show");
    void rankBanner.offsetWidth;
    rankBanner.classList.add("show");
    clearTimeout(bannerTo);
    bannerTo = setTimeout(() => rankBanner.classList.remove("show"), 3100);
  }

  // src/game/score.ts
  function addScore(pts) {
    state.score += pts;
    while (state.rankIdx < RANKS.length - 1 && state.score >= RANKS[state.rankIdx + 1].s) {
      state.rankIdx++;
      showRankBanner(RANKS[state.rankIdx].n);
      sfx.rank();
    }
  }

  // src/game/zombies.ts
  function difficulty() {
    const r = state.rankIdx, t = state.elapsed;
    return {
      interval: Math.max(0.8, 3.6 - r * 0.38 - t * 4e-3),
      maxZ: Math.min(22, 5 + r * 2),
      hp: 50 + r * 26 + Math.random() * 20,
      speed: 1.45 + r * 0.3 + Math.random() * 0.55,
      dmg: 8 + r * 2.5
    };
  }
  var ZCLOTH = [[0.13, 0.15, 0.13], [0.16, 0.13, 0.11], [0.12, 0.14, 0.17], [0.15, 0.15, 0.1]];
  var ZSKIN = [[0.32, 0.36, 0.27], [0.36, 0.33, 0.26], [0.3, 0.34, 0.32]];
  function chunkColor(z) {
    return [z.cloth[0] * 1.6, z.cloth[1] * 1.6, z.cloth[2] * 1.6];
  }
  function spawnZombie(at) {
    const dif = difficulty();
    let p = at;
    if (!p) {
      let pts = spawnPoints.filter((q) => Math.hypot(q.x - player.x, q.z - player.z) > 12);
      if (pts.length === 0) pts = spawnPoints.filter((q) => Math.hypot(q.x - player.x, q.z - player.z) > 7);
      if (pts.length === 0) pts = spawnPoints;
      p = pts[Math.floor(Math.random() * pts.length)];
    }
    const z = {
      x: p.x + (Math.random() - 0.5) * 1.5,
      y: p.y,
      z: p.z + (Math.random() - 0.5) * 1.5,
      vy: 0,
      vx: 0,
      vz: 0,
      r: 0.4,
      h: 1.7,
      grounded: true,
      hp: dif.hp,
      maxhp: dif.hp,
      speed: dif.speed,
      dmg: dif.dmg,
      face: Math.random() * 6.28,
      phase: Math.random() * 6.28,
      spawnT: 0,
      dead: false,
      deathT: 0,
      atkCd: 0,
      lungeT: 0,
      staggerT: 0,
      growlT: 2 + Math.random() * 5,
      stuckT: 0,
      detourT: 0,
      detourA: 0,
      scale: 0.92 + Math.random() * 0.18,
      cloth: ZCLOTH[Math.floor(Math.random() * ZCLOTH.length)],
      skin: ZSKIN[Math.floor(Math.random() * ZSKIN.length)],
      woundX: (Math.random() - 0.5) * 0.3,
      woundY: 0.2 + Math.random() * 0.3,
      headTilt: (Math.random() - 0.5) * 0.5
    };
    zombies.push(z);
    if (Math.hypot(z.x - player.x, z.z - player.z) < 35) sfx.growl(z.x, z.z);
  }
  function navTarget(z) {
    const dy = player.y - z.y;
    if (z.y > 6 || Math.abs(dy) < 1.2) return { x: player.x, z: player.z };
    let best = navRoutes[0], bd = 1e9;
    for (const r of navRoutes) {
      const entry = dy > 0 ? r.bottom : r.top;
      const d = Math.hypot(z.x - entry.x, z.z - entry.z);
      if (d < bd) {
        bd = d;
        best = r;
      }
    }
    const inBox2 = z.x > best.box.x0 && z.x < best.box.x1 && z.z > best.box.z0 && z.z < best.box.z1;
    return inBox2 ? dy > 0 ? best.top : best.bottom : dy > 0 ? best.bottom : best.top;
  }
  var nearActive = [];
  var curSafes = [];
  var frameNo = 0;
  function updateAllZombies(dt, t) {
    frameNo++;
    nearActive.length = 0;
    curSafes = allSafes();
    for (const z of zombies) {
      if (z.dead || z.spawnT < 1) continue;
      const dx = z.x - player.x, dz = z.z - player.z;
      if (dx * dx + dz * dz < 900) nearActive.push(z);
    }
    for (let i = 0; i < zombies.length; i++) {
      const z = zombies[i];
      if (z.dead || z.spawnT < 1) {
        updateZombie(z, dt, t, 0);
        continue;
      }
      const dx = z.x - player.x, dz = z.z - player.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 900) updateZombie(z, dt, t, 0);
      else if (d2 < 3600) updateZombie(z, dt, t, 1);
      else if ((i & 3) === (frameNo & 3)) updateZombie(z, dt * 4, t, 2);
    }
    for (let i = zombies.length - 1; i >= 0; i--) {
      const z = zombies[i];
      const dx = z.x - player.x, dz = z.z - player.z;
      if (z.dead && z.deathT > 1.3 || dx * dx + dz * dz > 110 * 110 || z.y < -10) zombies.splice(i, 1);
    }
  }
  function updateZombie(z, dt, t, lod) {
    if (z.dead) {
      z.deathT += dt;
      return;
    }
    if (z.spawnT < 1) {
      z.spawnT += dt;
      return;
    }
    z.atkCd = Math.max(0, z.atkCd - dt);
    z.lungeT = Math.max(0, z.lungeT - dt);
    z.staggerT = Math.max(0, z.staggerT - dt);
    let tgt = navTarget(z);
    if (lod === 0 && z.detourT > 0) {
      z.detourT -= dt;
      tgt = { x: z.x + Math.sin(z.detourA) * 3, z: z.z + Math.cos(z.detourA) * 3 };
    }
    const ddx = tgt.x - z.x, ddz = tgt.z - z.z;
    const dl = Math.hypot(ddx, ddz);
    const wantFace = Math.atan2(ddx, ddz);
    let da = wantFace - z.face;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    z.face += da * Math.min(1, dt * 6);
    const lurch = 0.5 + 0.9 * Math.max(0, Math.sin(t * 2.4 + z.phase * 7));
    const sp = z.speed * lurch * (z.staggerT > 0 ? 0.25 : 1);
    const px = z.x, pz = z.z;
    let mx = (dl > 0.05 ? ddx / dl : 0) * sp * dt + z.vx * dt;
    let mz = (dl > 0.05 ? ddz / dl : 0) * sp * dt + z.vz * dt;
    z.vx *= Math.pow(1e-3, dt);
    z.vz *= Math.pow(1e-3, dt);
    if (lod === 0) {
      for (const o of nearActive) {
        if (o === z) continue;
        const sx = z.x - o.x, sz = z.z - o.z;
        if (sx > 0.85 || sx < -0.85 || sz > 0.85 || sz < -0.85) continue;
        const sd = Math.hypot(sx, sz);
        if (sd < 0.85 && sd > 1e-3) {
          mx += sx / sd * dt * 1.5;
          mz += sz / sd * dt * 1.5;
        }
      }
    }
    for (const s of curSafes) {
      const nx = z.x + mx - s.x, nz = z.z + mz - s.z;
      if (nx * nx + nz * nz < s.r * s.r) {
        const d = Math.hypot(nx, nz) || 1;
        const dot = (mx * nx + mz * nz) / d;
        if (dot < 0) {
          mx -= nx / d * dot;
          mz -= nz / d * dot;
        }
      }
    }
    physStep(z, mx, mz, dt);
    if (lod === 0) {
      const moved = Math.hypot(z.x - px, z.z - pz);
      if (moved < sp * dt * 0.25 && dl > 1.5) {
        z.stuckT += dt;
        if (z.stuckT > 1.2) {
          z.stuckT = 0;
          z.detourT = 1;
          z.detourA = Math.random() * 6.28;
        }
      } else z.stuckT = Math.max(0, z.stuckT - dt * 2);
    }
    const pd = Math.hypot(player.x - z.x, player.z - z.z);
    if (pd < 1.25 && Math.abs(player.y - z.y) < 1.6 && z.atkCd <= 0 && state.alive) {
      z.atkCd = 1.1;
      z.lungeT = 0.25;
      damagePlayer(z.dmg, z);
    }
    if (lod === 0) {
      z.growlT -= dt;
      if (z.growlT <= 0) {
        z.growlT = 4 + Math.random() * 7;
        sfx.growl(z.x, z.z);
      }
    }
  }
  function killZombie(z, head, dx, dz) {
    z.dead = true;
    z.deathT = 0;
    state.kills++;
    burstBlood(z.x, z.y + 1, z.z, 12, dx || 0, 1, dz || 0);
    burstChunks(z.x, z.y + 0.9, z.z, 7, dx || 0, 0.6, dz || 0, chunkColor(z), 0.05, 0.11);
    burstChunks(z.x, z.y + 1.2, z.z, 7, dx || 0, 0.8, dz || 0, z.skin, 0.04, 0.1);
    addBloodPool(z.x, groundAt(z), z.z);
    if (safeZoneAt(player.x, player.z)) {
      popup("УБЕЖИЩЕ — БЕЗ НАГРАД", "#8fa3bd");
    } else {
      let pts = Math.round((60 + z.maxhp * 0.6 + z.speed * 30) / 10) * 10;
      if (head) pts = Math.round(pts * 1.5 / 10) * 10;
      addScore(pts);
      state.money += 2 + Math.round(pts / 40);
      popup("+" + pts + (head ? " В ГОЛОВУ!" : ""), head ? "#ff9a3d" : "#b8ffb0");
    }
    sfx.zdie(z.x, z.z);
  }
  function damagePlayer(dmg, z) {
    if (!state.alive) return;
    player.hp -= dmg;
    state.dmgFlash = 1;
    state.camShake = Math.min(1.4, state.camShake + 0.8);
    sfx.hurt();
    const kx = player.x - z.x, kz = player.z - z.z, kl = Math.hypot(kx, kz) || 1;
    player.velx += kx / kl * 3;
    player.velz += kz / kl * 3;
    if (player.hp <= 0) {
      player.hp = 0;
      showGameOver();
    }
  }

  // src/game/horde.ts
  var MAX_ALIVE = 500;
  var FIRST_WAVE_DELAY = 18;
  var waveNum = 0;
  var waveTimer = FIRST_WAVE_DELAY;
  var pending = 0;
  var trickle = 0;
  function hordeInfo() {
    return { wave: waveNum, pending };
  }
  function forceWave() {
    waveTimer = 0;
  }
  function resetHorde() {
    waveNum = 0;
    waveTimer = FIRST_WAVE_DELAY;
    pending = 0;
    trickle = 0;
  }
  function updateHorde(dt) {
    if (player.y < 6) {
      trickle = 0;
      return;
    }
    if (pending > 0) {
      trickle += dt * 25;
      while (trickle >= 1 && pending > 0) {
        trickle -= 1;
        if (zombies.length >= MAX_ALIVE) {
          pending = 0;
          break;
        }
        const ms = spawnMarkersNear(player.x, player.z, 25, 70);
        let sx, sz;
        if (ms.length > 0) {
          const m = ms[Math.random() * ms.length | 0];
          sx = m.x + (Math.random() - 0.5) * 5;
          sz = m.z + (Math.random() - 0.5) * 5;
        } else {
          const a = Math.random() * Math.PI * 2, r = 28 + Math.random() * 35;
          sx = player.x + Math.cos(a) * r;
          sz = player.z + Math.sin(a) * r;
        }
        if (quickFloor(sx, sz, 9) < 6) continue;
        let inside = false;
        for (const c of collidersNear(sx, sz, 0.5)) {
          if (sx + 0.4 > c.x0 && sx - 0.4 < c.x1 && sz + 0.4 > c.z0 && sz - 0.4 < c.z1 && c.y1 > 8.05 && c.y0 < 9.7) {
            inside = true;
            break;
          }
        }
        if (inside) continue;
        spawnZombie({ x: sx, y: 8, z: sz });
        pending--;
      }
    }
    waveTimer -= dt;
    if (waveTimer <= 0) {
      waveNum++;
      const size = Math.min(500, 100 + (waveNum - 1) * 60 + state.rankIdx * 40);
      pending = Math.max(pending, Math.min(size, MAX_ALIVE - zombies.length));
      waveTimer = 50 + Math.random() * 25;
      popup("ВОЛНА " + waveNum, "#ff7a3d");
    }
  }

  // src/core/input.ts
  var keys = {};
  var inputState = { firing: false, testLock: false };
  var reloadHandler = () => {
  };
  function onReloadKey(fn) {
    reloadHandler = fn;
  }
  var gameKeyHandler = () => {
  };
  function onGameKey(fn) {
    gameKeyHandler = fn;
  }
  addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space") e.preventDefault();
    if (e.code === "KeyR") reloadHandler();
    gameKeyHandler(e.code);
  });
  addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
  addEventListener("mousedown", (e) => {
    if (locked() && e.button === 0) inputState.firing = true;
  });
  addEventListener("mouseup", (e) => {
    if (e.button === 0) inputState.firing = false;
  });
  addEventListener("contextmenu", (e) => e.preventDefault());
  addEventListener("mousemove", (e) => {
    if (!locked() || !state.alive) return;
    const sens = 22e-4;
    player.yaw -= e.movementX * sens;
    player.pitch -= e.movementY * sens;
    player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch));
    player.swayX = Math.max(-0.05, Math.min(0.05, player.swayX - e.movementX * 7e-4));
    player.swayY = Math.max(-0.04, Math.min(0.04, player.swayY + e.movementY * 6e-4));
  });
  function locked() {
    return document.pointerLockElement === canvas || inputState.testLock;
  }
  function requestLock() {
    const p = canvas.requestPointerLock();
    if (p && typeof p.catch === "function") p.catch(() => {
    });
  }

  // src/ui/screens.ts
  var startScreen = document.getElementById("startScreen");
  var pauseScreen = document.getElementById("pauseScreen");
  var gameOverScr = document.getElementById("gameOver");
  startScreen.addEventListener("click", () => {
    initAudio();
    resumeAudio();
    state.started = true;
    startScreen.classList.add("hidden");
    requestLock();
  });
  pauseScreen.addEventListener("click", () => {
    requestLock();
  });
  document.addEventListener("pointerlockchange", () => {
    if (locked()) {
      pauseScreen.classList.add("hidden");
      resumeAudio();
    } else if (state.started && state.alive) {
      pauseScreen.classList.remove("hidden");
      inputState.firing = false;
      suspendAudio();
    }
  });
  document.getElementById("restartBtn").addEventListener("click", () => {
    resetGame();
    resetHorde();
    updateHUD();
    gameOverScr.classList.add("hidden");
    resumeAudio();
    requestLock();
  });
  function showGameOver() {
    state.alive = false;
    inputState.firing = false;
    sfx.die();
    document.getElementById("goStats").innerHTML = 'Очки: <span class="big">' + state.score + "</span><br>Ранг: " + RANKS[state.rankIdx].n + "<br>Убито зомби: " + state.kills;
    gameOverScr.classList.remove("hidden");
    document.exitPointerLock();
  }

  // src/game/player.ts
  function eyeHeight() {
    return 1.62 + Math.sin(player.bob * 2) * 0.042;
  }
  function updatePlayer(dt) {
    const fwx = -Math.sin(player.yaw), fwz = -Math.cos(player.yaw);
    const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
    let wx = 0, wz = 0;
    if (keys["KeyW"]) {
      wx += fwx;
      wz += fwz;
    }
    if (keys["KeyS"]) {
      wx -= fwx;
      wz -= fwz;
    }
    if (keys["KeyD"]) {
      wx += rx;
      wz += rz;
    }
    if (keys["KeyA"]) {
      wx -= rx;
      wz -= rz;
    }
    const len = Math.hypot(wx, wz);
    const run = (keys["ShiftLeft"] || keys["ShiftRight"]) && keys["KeyW"];
    let target = 0;
    if (len > 0) {
      wx /= len;
      wz /= len;
      target = run ? 6.6 : 4;
    }
    const accel = player.grounded ? 11 : 2.5;
    player.velx += (wx * target - player.velx) * Math.min(1, dt * accel);
    player.velz += (wz * target - player.velz) * Math.min(1, dt * accel);
    if (keys["Space"] && player.grounded) {
      player.vy = 6;
      player.grounded = false;
    }
    player.r = 0.38;
    player.h = 1.7;
    const fellSpeed = player.vy;
    physStep(player, player.velx * dt, player.velz * dt, dt);
    if (player.grounded && !player.wasGrounded && fellSpeed < -6) {
      sfx.land();
      state.camShake = Math.min(1, state.camShake + 0.4);
      burstDust(player.x, player.y + 0.05, player.z, 5, 0, 0.5, 0, [0.4, 0.4, 0.38]);
    }
    player.wasGrounded = player.grounded;
    if (player.y < -8) {
      player.y = 0;
      player.x = 0;
      player.z = 2;
    }
    const spd = Math.hypot(player.velx, player.velz);
    if (spd > 0.5 && player.grounded) {
      player.bob += dt * spd * 1.6;
      if (Math.floor(player.bob / Math.PI) !== Math.floor(player.bobPrev / Math.PI)) sfx.step(!!run);
    }
    player.bobPrev = player.bob;
    const fovT = run && spd > 4 ? 1.28 : 1.2;
    player.fov += (fovT - player.fov) * Math.min(1, dt * 6);
    player.swayX += (0 - player.swayX) * Math.min(1, dt * 8);
    player.swayY += (0 - player.swayY) * Math.min(1, dt * 8);
    const W = WEAPONS[player.weapon];
    player.shootCd -= dt;
    player.recoil = Math.max(0, player.recoil - dt * 4);
    if (!inputState.firing) player.fireLatch = false;
    if (player.reloading > 0) {
      player.reloading -= dt;
      if (player.reloading <= 0) {
        const need = W.magSize - player.mag;
        const take = Math.min(need, player.reserve);
        player.mag += take;
        player.reserve -= take;
      }
    } else if (inputState.firing && !state.shopOpen && player.shootCd <= 0) {
      if (!W.auto && player.fireLatch) {
      } else if (player.mag > 0) shoot();
      else {
        sfx.dry();
        player.shootCd = 0.3;
        player.fireLatch = true;
        if (player.reserve > 0) tryReload();
      }
    }
    for (const s of pickupSlots) {
      if (!s.active) {
        s.timer -= dt;
        if (s.timer <= 0) s.active = true;
        continue;
      }
      const d = Math.hypot(player.x - s.x, player.z - s.z);
      if (d < 1 && Math.abs(player.y - s.y) < 1.4) {
        if (s.type === "ammo") {
          player.reserve = Math.min(player.reserve + 30, WEAPONS[player.weapon].reserveMax);
          popup("+30 патронов", "#ffd24a");
          sfx.pickup();
        } else {
          if (player.hp >= 100) continue;
          player.hp = Math.min(100, player.hp + 25);
          popup("+25 HP", "#7dff8a");
          sfx.heal();
        }
        s.active = false;
        s.timer = 20 + Math.random() * 8;
      }
    }
  }
  function tryReload() {
    const W = WEAPONS[player.weapon];
    if (!state.alive || player.reloading > 0 || player.mag >= W.magSize || player.reserve <= 0) return;
    player.reloading = W.reload;
    sfx.reload();
  }
  function switchWeapon(i) {
    if (!state.alive || i === player.weapon || !player.slots[i] || !player.slots[i].owned) return;
    const cur = player.slots[player.weapon];
    cur.mag = player.mag;
    cur.reserve = player.reserve;
    player.weapon = i;
    player.mag = player.slots[i].mag;
    player.reserve = player.slots[i].reserve;
    player.reloading = 0;
    player.shootCd = 0.3;
    player.fireLatch = false;
    popup(WEAPONS[i].name, "#9fe3ff");
    sfx.swap();
  }
  function muzzleWorld() {
    const cp = Math.cos(player.pitch), sp = Math.sin(player.pitch);
    const fw = [-Math.sin(player.yaw) * cp, sp, -Math.cos(player.yaw) * cp];
    const rt = [Math.cos(player.yaw), 0, -Math.sin(player.yaw)];
    const ey = player.y + eyeHeight();
    return {
      x: player.x + fw[0] * 0.7 + rt[0] * 0.16,
      y: ey + fw[1] * 0.7 - 0.12,
      z: player.z + fw[2] * 0.7 + rt[2] * 0.16,
      fw,
      rt
    };
  }
  function shoot() {
    const W = WEAPONS[player.weapon];
    player.mag--;
    player.shootCd = W.rate;
    player.flash = 0.06;
    player.recoil = Math.min(player.recoil + W.kick, 1.6);
    player.pitch = Math.min(1.5, player.pitch + W.kick * 0.03);
    player.yaw += (Math.random() - 0.5) * 5e-3;
    player.fireLatch = true;
    sfx.shoot(player.weapon);
    const spread = (0.011 + player.recoil * 0.013 + Math.hypot(player.velx, player.velz) * 22e-4) * W.spread;
    const cp = Math.cos(player.pitch), sp = Math.sin(player.pitch);
    const fw = [-Math.sin(player.yaw) * cp, sp, -Math.cos(player.yaw) * cp];
    const rt = [Math.cos(player.yaw), 0, -Math.sin(player.yaw)];
    const up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
    const mw = muzzleWorld();
    emit({
      x: mw.x,
      y: mw.y,
      z: mw.z,
      vx: mw.rt[0] * (1.6 + Math.random()) + mw.fw[0] * 0.3,
      vy: 2.2 + Math.random(),
      vz: mw.rt[2] * (1.6 + Math.random()) + mw.fw[2] * 0.3,
      max: 2.5,
      size: 0.028,
      r: 0.72,
      g: 0.55,
      b: 0.18,
      em: 0.25,
      grav: 14,
      floor: quickFloor(player.x, player.z, player.y + 0.2),
      bounce: 0.35
    });
    emit({
      x: mw.x,
      y: mw.y,
      z: mw.z,
      vx: fw[0] * 0.4,
      vy: 0.5,
      vz: fw[2] * 0.4,
      max: 0.45,
      size: 0.05,
      r: 0.32,
      g: 0.32,
      b: 0.34,
      em: 0.1,
      grav: -1,
      drag: 2,
      grow: 0.25
    });
    for (let p = 0; p < W.pellets; p++) firePellet(W, spread, fw, rt, up, mw);
  }
  function firePellet(W, spread, fw, rt, up, mw) {
    const r1 = (Math.random() - 0.5) * 2 * spread, r2 = (Math.random() - 0.5) * 2 * spread;
    let dx = fw[0] + rt[0] * r1 + up[0] * r2, dy = fw[1] + rt[1] * r1 + up[1] * r2, dz = fw[2] + rt[2] * r1 + up[2] * r2;
    const dl = Math.hypot(dx, dy, dz);
    dx /= dl;
    dy /= dl;
    dz /= dl;
    const ox = player.x, oy = player.y + eyeHeight(), oz = player.z;
    let wallT = 90, wallC = null;
    const wInfo = { axis: -1, sign: 0 }, tmp = { axis: -1, sign: 0 };
    for (const c of collidersAlongRay(ox, oz, dx, dz, 90)) {
      const t = rayBox(ox, oy, oz, dx, dy, dz, c, tmp);
      if (t < wallT) {
        wallT = t;
        wInfo.axis = tmp.axis;
        wInfo.sign = tmp.sign;
        wallC = c;
      }
    }
    let best = null, bestT = wallT;
    for (const z of zombies) {
      if (z.dead || z.spawnT < 0.5) continue;
      const b = { x0: z.x - 0.5, x1: z.x + 0.5, y0: z.y, y1: z.y + 1.8, z0: z.z - 0.5, z1: z.z + 0.5 };
      const t = rayBox(ox, oy, oz, dx, dy, dz, b);
      if (t < bestT) {
        bestT = t;
        best = z;
      }
    }
    const hx = ox + dx * bestT, hy = oy + dy * bestT, hz = oz + dz * bestT;
    tracers.push({
      x: (mw.x + hx) / 2,
      y: (mw.y + hy) / 2,
      z: (mw.z + hz) / 2,
      len: Math.hypot(hx - mw.x, hy - mw.y, hz - mw.z),
      dx,
      dy,
      dz,
      life: 0
    });
    const multi = W.pellets > 1;
    if (best) {
      const hitY = oy + dy * bestT;
      const head = hitY > best.y + 1.32;
      const dmg = Math.round(head ? W.dmg * W.headMul : W.dmg);
      best.hp -= dmg;
      best.staggerT = 0.18;
      best.vx = dx * 1.2;
      best.vz = dz * 1.2;
      burstBlood(hx, hy, hz, multi ? 3 : head ? 9 : 6, dx, 0.5, dz);
      burstChunks(hx, hy, hz, multi ? 2 : head ? 6 : 4, dx, 0.4, dz, chunkColor(best), 0.035, 0.08);
      sfx.hit();
      hitMarker();
      if (best.hp <= 0) killZombie(best, head, dx, dz);
    } else if (wallT < 89) {
      const n = [0, 0, 0];
      if (wInfo.axis >= 0) n[wInfo.axis] = wInfo.sign;
      const carved = wallC ? applyMapHit(wallC, hx, hy, hz, dx, dy, dz, wInfo.axis, wInfo.sign) : false;
      burstDust(hx + n[0] * 0.02, hy + n[1] * 0.02, hz + n[2] * 0.02, multi ? 2 : 5, n[0], n[1], n[2], [0.42, 0.42, 0.4]);
      burstChunks(
        hx + n[0] * 0.05,
        hy + n[1] * 0.05,
        hz + n[2] * 0.05,
        carved ? multi ? 2 : 5 : multi ? 1 : 3,
        n[0],
        n[1],
        n[2],
        wallC && wallC.col || [0.35, 0.35, 0.35],
        0.025,
        0.06
      );
      if (!carved) addDecal(hx + n[0] * 0.012, hy + n[1] * 0.012, hz + n[2] * 0.012, wInfo.axis, wInfo.sign);
    }
  }

  // src/ui/shop.ts
  var elShop = document.getElementById("shop");
  var elShopList = document.getElementById("shopList");
  var elShopMoney = document.getElementById("shopMoney");
  var elInteract = document.getElementById("interact");
  var MED_PRICE = 20;
  var MED_HEAL = 50;
  var open = false;
  var hintShown = false;
  function setOpen(v) {
    if (open === v) return;
    open = v;
    state.shopOpen = v;
    elShop.classList.toggle("hidden", !v);
    if (v) renderShop();
  }
  function updateShopUI() {
    const near = state.started && state.alive ? traderNear(player.x, player.y, player.z, open ? 3.2 : 2.4) : null;
    if (open && !near) setOpen(false);
    const showHint = !!near && !open;
    if (showHint !== hintShown) {
      hintShown = showHint;
      elInteract.classList.toggle("hidden", !showHint);
    }
  }
  function handleShopKey(code) {
    if (code === "KeyE") {
      if (open) {
        setOpen(false);
        return true;
      }
      if (traderNear(player.x, player.y, player.z, 2.4)) {
        setOpen(true);
        return true;
      }
      return false;
    }
    if (!open) return false;
    if (code === "Digit1") buySlot(0);
    else if (code === "Digit2") buySlot(1);
    else if (code === "Digit3") buySlot(2);
    else if (code === "Digit4") buyMed();
    else return false;
    return true;
  }
  function buySlot(i) {
    if (player.slots[i].owned) buyAmmo(i);
    else buyWeapon(i);
  }
  function buyWeapon(i) {
    const W = WEAPONS[i], s = player.slots[i];
    if (s.owned) return false;
    if (state.money < W.price) {
      deny();
      return false;
    }
    state.money -= W.price;
    s.owned = true;
    s.mag = W.magSize;
    s.reserve = W.ammoPack;
    switchWeapon(i);
    popup(W.name + ": куплен", "#ffd24a");
    sfx.buy();
    if (open) renderShop();
    return true;
  }
  function buyAmmo(i) {
    const W = WEAPONS[i], s = player.slots[i];
    if (!s.owned) return false;
    if (state.money < W.ammoPrice) {
      deny();
      return false;
    }
    const reserve = i === player.weapon ? player.reserve : s.reserve;
    if (reserve >= W.reserveMax) {
      deny("Запас полон");
      return false;
    }
    state.money -= W.ammoPrice;
    const v = Math.min(W.reserveMax, reserve + W.ammoPack);
    if (i === player.weapon) player.reserve = v;
    else s.reserve = v;
    popup("+" + W.ammoPack + " патронов", "#ffd24a");
    sfx.buy();
    if (open) renderShop();
    return true;
  }
  function buyMed() {
    if (player.hp >= 100) {
      deny("Здоровье полное");
      return false;
    }
    if (state.money < MED_PRICE) {
      deny();
      return false;
    }
    state.money -= MED_PRICE;
    player.hp = Math.min(100, player.hp + MED_HEAL);
    popup("+" + MED_HEAL + " HP", "#7dff8a");
    sfx.heal();
    if (open) renderShop();
    return true;
  }
  function deny(msg = "Не хватает жетонов") {
    popup(msg, "#ff7766");
    sfx.dry();
  }
  function renderShop() {
    elShopMoney.textContent = String(state.money);
    let html = "";
    for (let i = 0; i < WEAPONS.length; i++) {
      const W = WEAPONS[i];
      if (player.slots[i].owned) {
        html += row(i + 1, "Патроны: " + W.name + " ×" + W.ammoPack, W.ammoPrice);
      } else {
        html += row(i + 1, W.name + " (+" + W.ammoPack + " патр.)", W.price);
      }
    }
    html += row(4, "Аптечка +" + MED_HEAL + " HP", MED_PRICE);
    elShopList.innerHTML = html;
  }
  function row(key2, label, price) {
    const poor = state.money < price ? " poor" : "";
    return '<div class="srow' + poor + '"><span>[' + key2 + "] " + label + '</span><span class="sprice">' + price + " ж</span></div>";
  }

  // src/game/aim.ts
  var AIM_RANGE = 80;
  var box = { x0: 0, x1: 0, y0: 0, y1: 0, z0: 0, z1: 0 };
  function aimedZombie() {
    const cp = Math.cos(player.pitch), sp = Math.sin(player.pitch);
    const dx = -Math.sin(player.yaw) * cp, dy = sp, dz = -Math.cos(player.yaw) * cp;
    const ox = player.x, oy = player.y + eyeHeight(), oz = player.z;
    let bestT = AIM_RANGE;
    for (const c of collidersAlongRay(ox, oz, dx, dz, AIM_RANGE)) {
      const t = rayBox(ox, oy, oz, dx, dy, dz, c);
      if (t < bestT) bestT = t;
    }
    let best = null;
    for (const z of zombies) {
      if (z.dead || z.spawnT < 0.5) continue;
      box.x0 = z.x - 0.5;
      box.x1 = z.x + 0.5;
      box.y0 = z.y;
      box.y1 = z.y + 1.8;
      box.z0 = z.z - 0.5;
      box.z1 = z.z + 0.5;
      const t = rayBox(ox, oy, oz, dx, dy, dz, box);
      if (t < bestT) {
        bestT = t;
        best = z;
      }
    }
    return best;
  }

  // src/gfx/post.ts
  var VSH2 = `
attribute vec2 aXY;
varying vec2 vUV;
void main(){ vUV = aXY*0.5 + 0.5; gl_Position = vec4(aXY, 0.0, 1.0); }`;
  var FSH2 = `
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTex;
uniform vec2 uInvRes;
float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec3 rgbNW = texture2D(uTex, vUV + vec2(-1.0,-1.0)*uInvRes).rgb;
  vec3 rgbNE = texture2D(uTex, vUV + vec2( 1.0,-1.0)*uInvRes).rgb;
  vec3 rgbSW = texture2D(uTex, vUV + vec2(-1.0, 1.0)*uInvRes).rgb;
  vec3 rgbSE = texture2D(uTex, vUV + vec2( 1.0, 1.0)*uInvRes).rgb;
  vec3 rgbM  = texture2D(uTex, vUV).rgb;
  float lNW = luma(rgbNW), lNE = luma(rgbNE);
  float lSW = luma(rgbSW), lSE = luma(rgbSE), lM = luma(rgbM);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
  float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float dirReduce = max((lNW + lNE + lSW + lSE)*0.03125, 1.0/128.0);
  float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = clamp(dir*rcpDirMin, vec2(-8.0), vec2(8.0))*uInvRes;
  vec3 rgbA = 0.5*(texture2D(uTex, vUV + dir*(1.0/3.0 - 0.5)).rgb
                 + texture2D(uTex, vUV + dir*(2.0/3.0 - 0.5)).rgb);
  vec3 rgbB = rgbA*0.5 + 0.25*(texture2D(uTex, vUV - dir*0.5).rgb
                             + texture2D(uTex, vUV + dir*0.5).rgb);
  float lB = luma(rgbB);
  gl_FragColor = vec4((lB < lMin || lB > lMax) ? rgbA : rgbB, 1.0);
}`;
  function makeShader2(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "post shader compile failed");
    return s;
  }
  var postProg = gl.createProgram();
  gl.attachShader(postProg, makeShader2(gl.VERTEX_SHADER, VSH2));
  gl.attachShader(postProg, makeShader2(gl.FRAGMENT_SHADER, FSH2));
  gl.linkProgram(postProg);
  if (!gl.getProgramParameter(postProg, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(postProg) || "post link failed");
  var aXY = gl.getAttribLocation(postProg, "aXY");
  var uInvRes = gl.getUniformLocation(postProg, "uInvRes");
  gl.useProgram(postProg);
  gl.uniform1i(gl.getUniformLocation(postProg, "uTex"), 0);
  gl.useProgram(prog);
  var quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var sceneTex = gl.createTexture();
  var sceneDepth = gl.createRenderbuffer();
  var sceneFbo = gl.createFramebuffer();
  function allocScene() {
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sceneSize.w, sceneSize.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindRenderbuffer(gl.RENDERBUFFER, sceneDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, sceneSize.w, sceneSize.h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sceneDepth);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  allocScene();
  onResize.push(allocScene);
  function beginScene() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.viewport(0, 0, sceneSize.w, sceneSize.h);
  }
  function endScene() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(postProg);
    gl.disable(gl.DEPTH_TEST);
    gl.disableVertexAttribArray(loc.aNorm);
    gl.disableVertexAttribArray(loc.aCol);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aXY);
    gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 8, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.uniform2f(uInvRes, 1 / sceneSize.w, 1 / sceneSize.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(prog);
  }

  // src/gfx/sky.ts
  var VSH3 = `
attribute vec2 aPos;
uniform vec3 uFw, uRt, uUp;   // базис камеры (без roll — крен ничтожен)
uniform vec2 uTanAsp;         // tan(fov/2)*aspect, tan(fov/2)
varying vec3 vRay;
void main(){
  vRay = uFw + uRt*aPos.x*uTanAsp.x + uUp*aPos.y*uTanAsp.y;
  // z чуть меньше дальней плоскости: проходит depth-тест (LESS) только там,
  // где буфер глубины остался очищенным (геометрии нет)
  gl_Position = vec4(aPos, 0.999, 1.0);
}`;
  var FSH3 = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vRay;
uniform vec3 uFogCol;     // цвет тумана кадра = цвет горизонта
uniform float uSkyMix;    // 0 в метро (фон = туман), 1 на улице
uniform float uDayK;      // 0 ночь, 1 день
uniform vec3 uSunDir, uMoonDir;
uniform float uTime;

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
// кратер в точке c радиуса r: светлый вал по кромке, тёмное дно
float crat(vec3 p, vec3 c, float r){
  float d = length(p - c);
  return smoothstep(r*1.3, r, d) * smoothstep(r*0.55, r*0.95, d) * 0.40
       - smoothstep(r*0.9, r*0.45, d) * 0.50;
}

void main(){
  // в метро небо не видно — сразу цвет тумана, без звёзд и шумов
  if(uSkyMix < 0.004){ gl_FragColor = vec4(uFogCol, 1.0); return; }
  vec3 rd = normalize(vRay);
  float up = rd.y;

  // === ночь: градиент + звёзды + луна ===
  vec3 night = mix(vec3(0.012,0.016,0.034), vec3(0.002,0.004,0.012), smoothstep(0.0,0.6,up));
  // слабая «дымка млечного пути»
  night += vec3(0.030,0.038,0.060) * pow(noise(rd*3.0+5.0), 2.0) * smoothstep(0.05,0.45,up);
  float md = length(rd - uMoonDir);
  // звёзды: в ~10% ячеек направления — мягкая точка со своим мерцанием;
  // возле луны гаснут — их смывает её сияние
  vec3 sp = rd*230.0;
  vec3 ip = floor(sp);
  float h = hash(ip);
  float star = smoothstep(0.90, 1.0, h);
  if(star > 0.0){
    vec3 fp = fract(sp) - 0.5 - (vec3(hash(ip+7.1), hash(ip+3.7), hash(ip+9.3)) - 0.5)*0.5;
    float tw = 0.7 + 0.3*sin(uTime*(1.0+h*4.0) + h*40.0);
    star *= smoothstep(0.40, 0.05, length(fp)) * tw * smoothstep(0.06, 0.17, md);
    night += vec3(0.85, 0.92, 1.0) * star * 1.3 * smoothstep(0.02, 0.22, up);
  }
  // луна: большой диск — моря, явные кратеры с валами, сферическое
  // затенение к краю; гало двухслойное (узкое яркое + широкое слабое).
  // Кратеры — в тангенс-базисе луны: не плывут по диску при её движении.
  night += vec3(0.40, 0.50, 0.72) * (exp(-md*6.0)*0.12 + exp(-md*16.0)*0.42);
  float moonDisc = smoothstep(0.092, 0.085, md);
  if(moonDisc > 0.0){
    vec3 t1 = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)));
    vec3 t2 = cross(t1, uMoonDir);
    vec3 mp = rd - uMoonDir;
    float sph = sqrt(max(0.0, 1.0 - md*md/0.0081)); // ламберт сферы (R=0.09)
    vec3 col = vec3(0.93, 0.94, 0.99) * (0.46 + 0.50*sph);
    // моря: два масштаба тёмных пятен
    col *= 1.0 - 0.34*smoothstep(0.36, 0.68, noise(mp*21.0 + 9.0))
               - 0.16*smoothstep(0.45, 0.75, noise(mp*47.0 + 31.0));
    col *= 1.0 + crat(mp, t1*0.041 + t2*(-0.034), 0.022)
               + crat(mp, t1*(-0.052) + t2*(-0.012), 0.013)
               + crat(mp, t1*(-0.026) + t2*0.046, 0.010)
               + crat(mp, t1*0.018 + t2*0.055, 0.007);
    col *= 0.92 + 0.16*noise(mp*240.0 + 17.0);                        // реголит
    night = mix(night, col, moonDisc);
  }

  // === день: градиент + солнце ===
  vec3 day = mix(vec3(0.36,0.42,0.52), vec3(0.16,0.28,0.48), smoothstep(0.0,0.7,up));
  float sd = length(rd - uSunDir);
  day += vec3(1.0,0.9,0.7) * exp(-sd*16.0) * 0.8;        // ореол
  day += vec3(1.0,0.97,0.90) * smoothstep(0.045,0.030,sd); // диск

  // тёплый рассвет/закат у горизонта в стороне солнца, когда оно низко
  float lowSun = 1.0 - smoothstep(0.05, 0.35, abs(uSunDir.y));
  vec2 rh = normalize(rd.xz + vec2(1e-4)), sh = normalize(uSunDir.xz + vec2(1e-4));
  float toSun = max(dot(rh, sh), 0.0);
  vec3 warm = vec3(0.85,0.32,0.10) * pow(toSun, 3.0) * lowSun * smoothstep(0.35, 0.0, abs(up)) * 0.6;

  vec3 sky = mix(night, day, uDayK) + warm;
  // горизонт и низ — цвет тумана; в метро (uSkyMix=0) — везде туман
  sky = mix(uFogCol, sky, smoothstep(-0.02, 0.18, up) * uSkyMix);
  gl_FragColor = vec4(sky, 1.0);
}`;
  var skyProg = makeProgram(VSH3, FSH3);
  var sLoc = {
    uFw: gl.getUniformLocation(skyProg, "uFw"),
    uRt: gl.getUniformLocation(skyProg, "uRt"),
    uUp: gl.getUniformLocation(skyProg, "uUp"),
    uTanAsp: gl.getUniformLocation(skyProg, "uTanAsp"),
    uFogCol: gl.getUniformLocation(skyProg, "uFogCol"),
    uSkyMix: gl.getUniformLocation(skyProg, "uSkyMix"),
    uDayK: gl.getUniformLocation(skyProg, "uDayK"),
    uSunDir: gl.getUniformLocation(skyProg, "uSunDir"),
    uMoonDir: gl.getUniformLocation(skyProg, "uMoonDir"),
    uTime: gl.getUniformLocation(skyProg, "uTime")
  };
  var skyBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  function drawSky(t, yaw, pitch, fov, aspect, dayKv, sun, moon, fr, fg, fb, skyMix) {
    const cp = Math.cos(pitch), spch = Math.sin(pitch);
    const fwx = -Math.sin(yaw) * cp, fwy = spch, fwz = -Math.cos(yaw) * cp;
    const rtx = Math.cos(yaw), rtz = -Math.sin(yaw);
    const upx = -rtz * fwy, upy = rtz * fwx - rtx * fwz, upz = rtx * fwy;
    const tanF = Math.tan(fov / 2);
    gl.useProgram(skyProg);
    gl.uniform3f(sLoc.uFw, fwx, fwy, fwz);
    gl.uniform3f(sLoc.uRt, rtx, 0, rtz);
    gl.uniform3f(sLoc.uUp, upx, upy, upz);
    gl.uniform2f(sLoc.uTanAsp, tanF * aspect, tanF);
    gl.uniform3f(sLoc.uFogCol, fr, fg, fb);
    gl.uniform1f(sLoc.uSkyMix, skyMix);
    gl.uniform1f(sLoc.uDayK, dayKv);
    gl.uniform3f(sLoc.uSunDir, sun[0], sun[1], sun[2]);
    gl.uniform3f(sLoc.uMoonDir, moon[0], moon[1], moon[2]);
    gl.uniform1f(sLoc.uTime, t);
    gl.depthMask(false);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
    gl.useProgram(prog);
  }

  // src/gfx/instanced.ts
  var VSH_INST = `
attribute vec3 aPos; attribute vec3 aNorm; attribute vec4 aCol;
attribute vec4 aM0; attribute vec4 aM1; attribute vec4 aM2; attribute vec4 aM3;
attribute vec4 aTintEm;
uniform mat4 uProj, uView;
varying vec3 vWorld, vNorm; varying vec4 vCol; varying vec4 vTintEm;
void main(){
  mat4 model = mat4(aM0, aM1, aM2, aM3);
  vec4 wp = model * vec4(aPos, 1.0);
  vWorld = wp.xyz;
  vNorm = (model * vec4(aNorm, 0.0)).xyz;
  vCol = aCol;
  vTintEm = aTintEm;
  gl_Position = uProj * uView * wp;
}`;
  var ext = gl.getExtension("ANGLE_instanced_arrays");
  var iProg = makeProgram(VSH_INST, FSH);
  var iLoc = {
    uProj: gl.getUniformLocation(iProg, "uProj"),
    uView: gl.getUniformLocation(iProg, "uView"),
    uLightPos: gl.getUniformLocation(iProg, "uLightPos"),
    uLightCol: gl.getUniformLocation(iProg, "uLightCol"),
    uLightCount: gl.getUniformLocation(iProg, "uLightCount"),
    uCamPos: gl.getUniformLocation(iProg, "uCamPos"),
    uProc: gl.getUniformLocation(iProg, "uProc"),
    uAmbient: gl.getUniformLocation(iProg, "uAmbient"),
    uFogDen: gl.getUniformLocation(iProg, "uFogDen"),
    uFogCol: gl.getUniformLocation(iProg, "uFogCol"),
    uSunDir: gl.getUniformLocation(iProg, "uSunDir"),
    uSunCol: gl.getUniformLocation(iProg, "uSunCol"),
    uFlashPos: gl.getUniformLocation(iProg, "uFlashPos"),
    uFlashDir: gl.getUniformLocation(iProg, "uFlashDir"),
    uFlashI: gl.getUniformLocation(iProg, "uFlashI")
  };
  function instAtmo(ar, ag, ab, fd, fr, fg, fb, sdx, sdy, sdz, scr, scg, scb, fpx, fpy, fpz, fdx, fdy, fdz, fi) {
    gl.useProgram(iProg);
    gl.uniform3f(iLoc.uAmbient, ar, ag, ab);
    gl.uniform1f(iLoc.uFogDen, fd);
    gl.uniform3f(iLoc.uFogCol, fr, fg, fb);
    gl.uniform3f(iLoc.uSunDir, sdx, sdy, sdz);
    gl.uniform3f(iLoc.uSunCol, scr, scg, scb);
    gl.uniform3f(iLoc.uFlashPos, fpx, fpy, fpz);
    gl.uniform3f(iLoc.uFlashDir, fdx, fdy, fdz);
    gl.uniform1f(iLoc.uFlashI, fi);
    gl.useProgram(prog);
  }
  var FLOATS = 20;
  var MAX_INST = 8192;
  var data = new Float32Array(MAX_INST * FLOATS);
  var count = 0;
  var instBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
  function instBegin(proj, view, lightPos, lightCol, lightCount2, camX, camY, camZ) {
    gl.useProgram(iProg);
    gl.uniformMatrix4fv(iLoc.uProj, false, proj);
    gl.uniformMatrix4fv(iLoc.uView, false, view);
    gl.uniform3fv(iLoc.uLightPos, lightPos);
    gl.uniform3fv(iLoc.uLightCol, lightCol);
    gl.uniform1i(iLoc.uLightCount, lightCount2);
    gl.uniform3f(iLoc.uCamPos, camX, camY, camZ);
    gl.uniform1f(iLoc.uProc, 0);
    gl.useProgram(prog);
    count = 0;
  }
  function instPush(model, r, g, b, em) {
    if (count === MAX_INST) instFlush();
    const o = count * FLOATS;
    data.set(model, o);
    data[o + 16] = r;
    data[o + 17] = g;
    data[o + 18] = b;
    data[o + 19] = em;
    count++;
  }
  function instFlush() {
    if (count === 0) return;
    gl.useProgram(iProg);
    bindMesh(cubeMesh);
    if (ext) {
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * FLOATS));
      for (let i = 0; i < 4; i++) {
        const a = ATTR.aM0 + i;
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 4, gl.FLOAT, false, FLOATS * 4, i * 16);
        ext.vertexAttribDivisorANGLE(a, 1);
      }
      gl.enableVertexAttribArray(ATTR.aTintEm);
      gl.vertexAttribPointer(ATTR.aTintEm, 4, gl.FLOAT, false, FLOATS * 4, 64);
      ext.vertexAttribDivisorANGLE(ATTR.aTintEm, 1);
      ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, cubeMesh.count, count);
      for (let a = ATTR.aM0; a <= ATTR.aTintEm; a++) gl.disableVertexAttribArray(a);
    } else {
      for (let i = 0; i < count; i++) {
        const o = i * FLOATS;
        gl.vertexAttrib4f(ATTR.aM0, data[o], data[o + 1], data[o + 2], data[o + 3]);
        gl.vertexAttrib4f(ATTR.aM1, data[o + 4], data[o + 5], data[o + 6], data[o + 7]);
        gl.vertexAttrib4f(ATTR.aM2, data[o + 8], data[o + 9], data[o + 10], data[o + 11]);
        gl.vertexAttrib4f(ATTR.aM3, data[o + 12], data[o + 13], data[o + 14], data[o + 15]);
        gl.vertexAttrib4f(ATTR.aTintEm, data[o + 16], data[o + 17], data[o + 18], data[o + 19]);
        gl.drawArrays(gl.TRIANGLES, 0, cubeMesh.count);
      }
    }
    gl.useProgram(prog);
    count = 0;
  }

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
    const o = alloc();
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function m4Chain(...ms) {
    let m = ms[0];
    for (let i = 1; i < ms.length; i++) m = m4Mul(m, ms[i]);
    return m;
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
  function m4RotX(a) {
    const m = m4Ident(), c = Math.cos(a), s = Math.sin(a);
    m[5] = c;
    m[6] = s;
    m[9] = -s;
    m[10] = c;
    return m;
  }
  function m4RotY(a) {
    const m = m4Ident(), c = Math.cos(a), s = Math.sin(a);
    m[0] = c;
    m[2] = -s;
    m[8] = s;
    m[10] = c;
    return m;
  }
  function m4RotZ(a) {
    const m = m4Ident(), c = Math.cos(a), s = Math.sin(a);
    m[0] = c;
    m[1] = s;
    m[4] = -s;
    m[5] = c;
    return m;
  }
  function m4Aim(dx, dy, dz) {
    const yaw = Math.atan2(dx, dz), pitch = -Math.asin(Math.max(-1, Math.min(1, dy)));
    return m4Mul(m4RotY(yaw), m4RotX(pitch));
  }

  // src/gfx/renderer.ts
  var lightPosArr = new Float32Array(48);
  var lightColArr = new Float32Array(48);
  var lightCount = 0;
  function resetLights() {
    lightCount = 0;
  }
  function pushLight(x, y, z, r, g, b) {
    if (lightCount >= 16) return;
    lightPosArr.set([x, y, z], lightCount * 3);
    lightColArr.set([r, g, b], lightCount * 3);
    lightCount++;
  }
  function drawCube(model, r, g, b, emissive) {
    instPush(model, r, g, b, emissive || 0);
  }
  function drawZombie(z, t) {
    const ddx = z.x - player.x, ddz = z.z - player.z;
    const d2 = ddx * ddx + ddz * ddz;
    if (d2 > 4900) return;
    let yOff = 0, fall = 0;
    if (z.spawnT < 1) yOff = -1.5 * (1 - z.spawnT);
    if (z.dead) {
      fall = Math.min(1, z.deathT * 2.2);
      yOff = -fall * 0.6;
    }
    if (d2 > 1225) {
      const sw2 = Math.sin(t * 7 * z.speed * 0.5 + z.phase) * 0.15;
      const base2 = m4Chain(
        m4Trans(z.x, z.y + yOff, z.z),
        m4RotY(z.face),
        m4Scale(z.scale, z.scale, z.scale),
        m4RotX(fall * 1.5 + sw2 * 0.3)
      );
      drawCube(m4Chain(base2, m4Trans(0, 0.45, 0), m4Scale(0.34, 0.9, 0.3)), z.cloth[0], z.cloth[1], z.cloth[2]);
      drawCube(m4Chain(base2, m4Trans(0, 1.25, 0.08), m4Scale(0.55, 0.65, 0.36)), z.cloth[0], z.cloth[1], z.cloth[2]);
      drawCube(m4Chain(base2, m4Trans(0, 1.72, 0.14), m4Scale(0.3, 0.3, 0.3)), z.skin[0], z.skin[1], z.skin[2]);
      drawCube(m4Chain(base2, m4Trans(0, 1.74, 0.3), m4Scale(0.18, 0.05, 0.04)), 0.9, 0.14, 0.05, 1);
      return;
    }
    const lunge = z.lungeT > 0 ? Math.sin(z.lungeT / 0.25 * Math.PI) * 0.4 : 0;
    const base = m4Chain(
      m4Trans(z.x, z.y + yOff, z.z),
      m4RotY(z.face),
      m4Scale(z.scale, z.scale, z.scale),
      m4RotX(fall * 1.5),
      m4Trans(0, 0, lunge * 0.5)
    );
    const sw = Math.sin(t * 7 * z.speed * 0.5 + z.phase);
    const tw = Math.sin(t * 11 + z.phase * 3) * 0.12;
    const CB = z.cloth, CS = z.skin;
    drawCube(m4Chain(base, m4Trans(-0.13, 0.85, 0), m4RotX(sw * 0.55), m4Trans(0, -0.42, 0), m4Scale(0.17, 0.85, 0.17)), CB[0], CB[1], CB[2]);
    drawCube(m4Chain(base, m4Trans(0.13, 0.85, 0), m4RotX(-sw * 0.55), m4Trans(0, -0.42, 0), m4Scale(0.17, 0.85, 0.17)), CB[0], CB[1], CB[2]);
    const torso = m4Chain(base, m4Trans(0, 0.95, 0), m4RotX(0.5 + tw * 0.5), m4RotZ(sw * 0.06));
    drawCube(m4Chain(torso, m4Trans(0, 0.34, 0), m4Scale(0.55, 0.7, 0.34)), CB[0], CB[1], CB[2]);
    drawCube(m4Chain(torso, m4Trans(z.woundX, z.woundY, 0.165), m4Scale(0.16, 0.2, 0.06)), 0.25, 0.02, 0.02, 0.25);
    const head = m4Chain(torso, m4Trans(0, 0.72, 0.1), m4RotZ(tw + z.headTilt), m4RotX(-0.3));
    drawCube(m4Chain(head, m4Scale(0.3, 0.3, 0.3)), CS[0], CS[1], CS[2]);
    const eyeGlow = z.dead ? Math.max(0, 1 - fall * 1.5) : 1;
    drawCube(m4Chain(head, m4Trans(-0.08, 0.02, 0.15), m4Scale(0.065, 0.06, 0.04)), 1.2 * eyeGlow, 0.18, 0.06, 1);
    drawCube(m4Chain(head, m4Trans(0.08, 0.02, 0.15), m4Scale(0.065, 0.06, 0.04)), 1.2 * eyeGlow, 0.18, 0.06, 1);
    const near = Math.hypot(player.x - z.x, player.z - z.z) < 3 ? 0.3 : 0;
    const armA = -1.25 - near + Math.sin(t * 5 + z.phase) * 0.18 + lunge;
    drawCube(m4Chain(torso, m4Trans(-0.34, 0.55, 0), m4RotX(armA), m4Trans(0, -0.38, 0), m4Scale(0.13, 0.78, 0.13)), CS[0], CS[1], CS[2]);
    drawCube(m4Chain(torso, m4Trans(0.34, 0.55, 0), m4RotX(armA + 0.25), m4Trans(0, -0.38, 0), m4Scale(0.13, 0.78, 0.13)), CS[0], CS[1], CS[2]);
  }
  function drawPickup(s, t) {
    if (!s.active) return;
    const bob = 0.28 + Math.sin(t * 2.2 + s.phase) * 0.07;
    const rot = m4Chain(m4Trans(s.x, s.y + bob, s.z), m4RotY(t * 1.6 + s.phase));
    const pulse = 0.55 + 0.25 * Math.sin(t * 4 + s.phase);
    if (s.type === "ammo") {
      drawCube(m4Chain(rot, m4Scale(0.5, 0.3, 0.34)), 0.75 * pulse + 0.2, 0.62 * pulse + 0.15, 0.12, 0.75);
      drawCube(m4Chain(rot, m4Trans(0, 0.18, 0), m4Scale(0.34, 0.07, 0.2)), 0.9, 0.78, 0.2, 0.9);
    } else {
      drawCube(m4Chain(rot, m4Scale(0.42, 0.18, 0.42)), 0.85, 0.9, 0.85, 0.6 * pulse + 0.3);
      drawCube(m4Chain(rot, m4Trans(0, 0.11, 0), m4Scale(0.3, 0.05, 0.1)), 0.15, 1, 0.3, 1);
      drawCube(m4Chain(rot, m4Trans(0, 0.11, 0), m4Scale(0.1, 0.05, 0.3)), 0.15, 1, 0.3, 1);
    }
  }
  function drawGun() {
    const W = WEAPONS[player.weapon];
    const bobX = Math.sin(player.bob) * 0.013;
    const bobY = Math.abs(Math.sin(player.bob * 2)) * 0.015;
    let dropY = 0, rotR = 0, relP = 0;
    if (player.reloading > 0) {
      relP = 1 - player.reloading / W.reload;
      dropY = -0.22 * Math.sin(relP * Math.PI);
      rotR = 0.5 * Math.sin(relP * Math.PI);
    }
    const kick = player.recoil * 0.045;
    const root = m4Chain(
      m4Trans(0.27 + bobX + player.swayX, -0.26 + bobY + dropY + player.swayY, kick),
      m4RotX(kick * 1.6 + rotR + player.swayY * 1.5),
      m4RotY(player.swayX * 1.4),
      m4RotZ(bobX * 0.5 + player.swayX * 0.8)
    );
    const C = [0.1, 0.105, 0.12];
    if (player.weapon === 1) {
      const WD = [0.3, 0.2, 0.11];
      const pump = player.reloading > 0 ? -0.07 * Math.sin(relP * Math.PI * 3) : 0;
      drawCube(m4Chain(root, m4Trans(0, 0, -0.42), m4Scale(0.055, 0.075, 0.4)), C[0], C[1], C[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.02, -0.85), m4Scale(0.032, 0.032, 0.5)), 0.14, 0.14, 0.16, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.035, -0.82), m4Scale(0.027, 0.027, 0.42)), 0.12, 0.12, 0.13, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.04, -0.68 + pump), m4Scale(0.058, 0.052, 0.15)), WD[0], WD[1], WD[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.025, -0.14), m4RotX(0.14), m4Scale(0.048, 0.082, 0.22)), WD[0], WD[1], WD[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.055, -1.06), m4Scale(0.016, 0.024, 0.05)), C[0], C[1], C[2], 0.5);
    } else if (player.weapon === 2) {
      drawCube(m4Chain(root, m4Trans(0, 0, -0.5), m4Scale(0.07, 0.1, 0.44)), C[0], C[1], C[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.02, -1), m4Scale(0.034, 0.034, 0.52)), 0.14, 0.14, 0.16, 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.02, -1.28), m4Scale(0.05, 0.05, 0.07)), 0.09, 0.09, 0.1, 0.5);
      drawCube(m4Chain(root, m4Trans(-0.075, -0.05, -0.46), m4Scale(0.09, 0.11, 0.16)), 0.16, 0.22, 0.12, 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.075, -0.52), m4Scale(0.018, 0.05, 0.06)), C[0], C[1], C[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.02, -0.16), m4Scale(0.05, 0.07, 0.17)), 0.13, 0.12, 0.11, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.09, -0.36), m4RotX(-0.2), m4Scale(0.04, 0.1, 0.05)), 0.13, 0.11, 0.08, 0.5);
      drawCube(m4Chain(root, m4Trans(-0.035, -0.06, -1.05), m4RotX(0.5), m4Scale(0.014, 0.16, 0.014)), 0.12, 0.12, 0.13, 0.5);
      drawCube(m4Chain(root, m4Trans(0.035, -0.06, -1.05), m4RotX(0.5), m4Scale(0.014, 0.16, 0.014)), 0.12, 0.12, 0.13, 0.5);
    } else {
      drawCube(m4Chain(root, m4Trans(0, 0, -0.55), m4Scale(0.065, 0.085, 0.5)), C[0], C[1], C[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, 5e-3, -0.84), m4Scale(0.055, 0.06, 0.22)), 0.12, 0.11, 0.1, 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.022, -0.98), m4Scale(0.028, 0.028, 0.3)), 0.14, 0.14, 0.16, 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.022, -1.12), m4Scale(0.04, 0.04, 0.07)), 0.09, 0.09, 0.1, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.1, -0.5), m4RotX(0.22), m4Scale(0.045, 0.17, 0.085)), 0.15, 0.13, 0.1, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.12, -0.62), m4RotX(0.38), m4Scale(0.043, 0.09, 0.08)), 0.14, 0.12, 0.09, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.02, -0.2), m4Scale(0.05, 0.06, 0.18)), 0.16, 0.12, 0.09, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.085, -0.36), m4RotX(-0.2), m4Scale(0.04, 0.1, 0.05)), 0.13, 0.11, 0.08, 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.065, -0.62), m4Scale(0.016, 0.026, 0.06)), C[0], C[1], C[2], 0.5);
      drawCube(m4Chain(root, m4Trans(0, 0.06, -0.36), m4Scale(0.03, 0.022, 0.09)), 0.09, 0.09, 0.1, 0.5);
    }
    if (player.torch) {
      drawCube(m4Chain(root, m4Trans(0, -0.055, -0.9), m4Scale(0.02, 0.02, 0.07)), 0.1, 0.1, 0.11, 0.5);
      drawCube(m4Chain(root, m4Trans(0, -0.055, -0.975), m4Scale(0.016, 0.016, 0.012)), 1, 0.95, 0.8, 1);
    }
    if (player.flash > 0) {
      const fs = player.weapon === 1 ? 1.6 : 1;
      const s = (0.1 + Math.random() * 0.14) * fs;
      const fz = player.weapon === 1 ? -1.05 : -1.2;
      drawCube(m4Chain(root, m4Trans(0, 0.022, fz), m4RotZ(Math.random() * 3), m4Scale(s, s, s * 0.8)), 1, 0.85, 0.45, 1);
      drawCube(m4Chain(root, m4Trans(0, 0.022, fz), m4RotZ(Math.random() * 3), m4Scale(s * 0.45, s * 0.45, s * 1.6)), 1, 0.95, 0.7, 1);
    }
  }
  function drawTrader(x, y, z, t) {
    const dx = x - player.x, dz = z - player.z;
    if (dx * dx + dz * dz > 1600) return;
    const br = Math.sin(t * 1.3 + x * 0.7) * 0.012;
    const base = m4Trans(x, y, z);
    const CO = [0.17, 0.15, 0.09], SK = [0.52, 0.4, 0.3];
    drawCube(m4Chain(base, m4Trans(-0.12, 0.45, 0), m4Scale(0.16, 0.9, 0.16)), 0.1, 0.1, 0.11);
    drawCube(m4Chain(base, m4Trans(0.12, 0.45, 0), m4Scale(0.16, 0.9, 0.16)), 0.1, 0.1, 0.11);
    drawCube(m4Chain(base, m4Trans(0, 1.18 + br, 0), m4Scale(0.56, 0.62, 0.32)), CO[0], CO[1], CO[2]);
    drawCube(m4Chain(base, m4Trans(0, 1.05 + br, 0.18), m4Scale(0.44, 0.13, 0.13)), CO[0] * 0.8, CO[1] * 0.8, CO[2] * 0.8);
    drawCube(m4Chain(base, m4Trans(0, 1.62 + br, 0.02), m4Scale(0.26, 0.26, 0.26)), SK[0], SK[1], SK[2]);
    drawCube(m4Chain(base, m4Trans(0, 1.78 + br, 0), m4Scale(0.3, 0.12, 0.3)), 0.25, 0.2, 0.14);
    drawCube(m4Chain(base, m4Trans(0, 0.45, 0.85), m4Scale(1.1, 0.55, 0.5)), 0.28, 0.22, 0.14);
    const fl = 0.85 + 0.15 * Math.sin(t * 5.3 + x);
    drawCube(m4Chain(base, m4Trans(0.38, 0.82, 0.85), m4Scale(0.09, 0.14, 0.09)), 1 * fl, 0.74 * fl, 0.32 * fl, 0.9);
  }
  var DECAL_AX = [[0.012, 0.07, 0.07], [0.07, 0.012, 0.07], [0.07, 0.07, 0.012]];
  var ATMO = {
    amb0: [0.03, 0.035, 0.05],
    amb1n: [0.165, 0.185, 0.245],
    amb1d: [0.4, 0.44, 0.5],
    fog0: 0.04,
    fog1n: 0.024,
    fog1d: 0.019,
    col0: [8e-3, 0.01, 0.018],
    col1n: [0.014, 0.02, 0.038],
    col1d: [0.34, 0.4, 0.5]
  };
  var lerp = (a, b, k) => a + (b - a) * k;
  function render(t) {
    resetMatrixPool();
    beginScene();
    const eyeYpre = player.y + eyeHeight();
    const k = Math.min(1, Math.max(0, (eyeYpre - 4.6) / 2.8));
    const dk = dayK();
    const ar = lerp(ATMO.amb0[0], lerp(ATMO.amb1n[0], ATMO.amb1d[0], dk), k), ag = lerp(ATMO.amb0[1], lerp(ATMO.amb1n[1], ATMO.amb1d[1], dk), k), ab = lerp(ATMO.amb0[2], lerp(ATMO.amb1n[2], ATMO.amb1d[2], dk), k);
    const fd = lerp(ATMO.fog0, lerp(ATMO.fog1n, ATMO.fog1d, dk), k);
    const fr = lerp(ATMO.col0[0], lerp(ATMO.col1n[0], ATMO.col1d[0], dk), k), fg = lerp(ATMO.col0[1], lerp(ATMO.col1n[1], ATMO.col1d[1], dk), k), fb = lerp(ATMO.col0[2], lerp(ATMO.col1n[2], ATMO.col1d[2], dk), k);
    const sa = sunAngle();
    const sun = sunDir(), moon = moonDir();
    const sunUp = Math.max(0, Math.sin(sa)), moonUp = Math.max(0, -Math.sin(sa));
    let dirX = 0, dirY = 1, dirZ = 0, dcR = 0, dcG = 0, dcB = 0;
    if (dk > 0.5) {
      const warm = Math.min(1, sunUp / 0.35);
      const w = Math.min(1, (dk - 0.5) * 4) * sunUp * k;
      dirX = sun[0];
      dirY = sun[1];
      dirZ = sun[2];
      dcR = lerp(0.8, 0.52, warm) * w;
      dcG = lerp(0.38, 0.5, warm) * w;
      dcB = lerp(0.16, 0.42, warm) * w;
    } else {
      const w = Math.min(1, (0.5 - dk) * 4) * moonUp * k;
      dirX = moon[0];
      dirY = moon[1];
      dirZ = moon[2];
      dcR = 0.1 * w;
      dcG = 0.13 * w;
      dcB = 0.2 * w;
    }
    const eyeYf = player.y + eyeHeight();
    const cpf = Math.cos(player.pitch), spf = Math.sin(player.pitch);
    const flDX = -Math.sin(player.yaw) * cpf, flDY = spf, flDZ = -Math.cos(player.yaw) * cpf;
    const flI = player.torch && state.alive ? 2.6 : 0;
    gl.uniform3f(loc.uAmbient, ar, ag, ab);
    gl.uniform1f(loc.uFogDen, fd);
    gl.uniform3f(loc.uFogCol, fr, fg, fb);
    gl.uniform3f(loc.uSunDir, dirX, dirY, dirZ);
    gl.uniform3f(loc.uSunCol, dcR, dcG, dcB);
    gl.uniform3f(loc.uFlashPos, player.x, eyeYf, player.z);
    gl.uniform3f(loc.uFlashDir, flDX, flDY, flDZ);
    gl.uniform1f(loc.uFlashI, flI);
    instAtmo(
      ar,
      ag,
      ab,
      fd,
      fr,
      fg,
      fb,
      dirX,
      dirY,
      dirZ,
      dcR,
      dcG,
      dcB,
      player.x,
      eyeYf,
      player.z,
      flDX,
      flDY,
      flDZ,
      flI
    );
    gl.clearColor(fr, fg, fb, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const shX = state.camShake * Math.sin(t * 73) * 0.014;
    const shY = state.camShake * Math.sin(t * 89 + 1.7) * 0.011;
    const eyeY = player.y + eyeHeight();
    const rxv = Math.cos(player.yaw) * player.velx - Math.sin(player.yaw) * player.velz;
    const roll = rxv * 6e-3 + Math.sin(player.bob) * 4e-3;
    const proj = m4Persp(player.fov, canvas.width / canvas.height, 0.05, 120);
    const view = m4Chain(
      m4RotZ(roll),
      m4RotX(-player.pitch + shY),
      m4RotY(-player.yaw + shX),
      m4Trans(-player.x, -eyeY, -player.z)
    );
    gl.uniformMatrix4fv(loc.uProj, false, proj);
    gl.uniformMatrix4fv(loc.uView, false, view);
    gl.uniform3f(loc.uCamPos, player.x, eyeY, player.z);
    resetLights();
    const fls = frameLamps(player.x, player.z, k < 0.5, t);
    const nLamps = frameLampCount();
    for (let i = 0; i < nLamps; i++) {
      const l = fls[i];
      const ls = l.kind === 1 ? (1 - dk) * 2.1 * l.i : 2.1 * l.i;
      pushLight(l.x, l.y, l.z, l.c[0] * ls, l.c[1] * ls, l.c[2] * ls);
    }
    if (player.flash > 0) {
      const fw = [-Math.sin(player.yaw), 0, -Math.cos(player.yaw)];
      pushLight(player.x + fw[0], eyeY, player.z + fw[2], 2.6, 2, 1);
    }
    gl.uniform3fv(loc.uLightPos, lightPosArr);
    gl.uniform3fv(loc.uLightCol, lightColArr);
    gl.uniform1i(loc.uLightCount, lightCount);
    bindMesh(mapMesh);
    gl.uniform1f(loc.uProc, 1);
    gl.uniformMatrix4fv(loc.uModel, false, m4Ident());
    gl.uniform3f(loc.uTint, 1, 1, 1);
    gl.uniform1f(loc.uEmissive, 0);
    gl.drawArrays(gl.TRIANGLES, 0, mapMesh.count);
    for (const ch of loadedChunks()) {
      if (!ch.mesh) continue;
      bindMesh(ch.mesh);
      gl.drawArrays(gl.TRIANGLES, 0, ch.mesh.count);
    }
    renderDamage();
    instBegin(proj, view, lightPosArr, lightColArr, lightCount, player.x, eyeY, player.z);
    for (let i = 0; i < nLamps; i++) {
      const l = fls[i], li = l.i;
      if (l.kind === 0) {
        drawCube(
          m4Chain(m4Trans(l.x, l.y + 0.25, l.z), m4Scale(0.9, 0.16, 0.9)),
          l.c[0] * li,
          l.c[1] * li,
          l.c[2] * li,
          0.95
        );
        drawCube(m4Chain(m4Trans(l.x, l.y + 0.55, l.z), m4Scale(0.05, 0.6, 0.05)), 0.08, 0.08, 0.1, 0);
      } else if (l.kind === 1) {
        const ds = li * (1 - dk * 0.92);
        drawCube(
          m4Chain(m4Trans(l.x, l.y + 0.15, l.z), m4Scale(0.55, 0.22, 0.55)),
          l.c[0] * ds,
          l.c[1] * ds,
          l.c[2] * ds,
          0.95
        );
      } else {
        drawCube(
          m4Chain(m4Trans(l.x, l.y + 0.1, l.z), m4Scale(0.7, 0.08, 0.7)),
          l.c[0] * li,
          l.c[1] * li,
          l.c[2] * li,
          0.95
        );
      }
    }
    for (const sx of [-22, 22]) {
      const gl2 = 0.5 + 0.12 * Math.sin(t * 3 + sx);
      drawCube(m4Chain(m4Trans(sx, 4.7, -11.6), m4Scale(0.7, 0.5, 0.08)), 0.1 * gl2, 0.2 * gl2, 0.65 * gl2, 1);
    }
    if (k < 0.5) for (const m of motes) {
      const l = lamps[m.l], li = lampIntensity(l, t);
      if (li < 0.2) continue;
      const mx = l.x + Math.sin(t * 0.31 * m.s + m.a) * 1.3;
      const my = l.y - 0.9 + Math.sin(t * 0.23 * m.s + m.b) * 0.8;
      const mz = l.z + Math.sin(t * 0.27 * m.s + m.c) * 1.3;
      drawCube(
        m4Chain(m4Trans(mx, my, mz), m4Scale(0.014, 0.014, 0.014)),
        l.c[0] * li * 0.7,
        l.c[1] * li * 0.7,
        l.c[2] * li * 0.7,
        0.9
      );
    }
    for (const bp of bloodPools) {
      const grow = Math.min(1, bp.life * 0.8);
      const fade = bp.life > 60 ? (70 - bp.life) / 10 : 1;
      drawCube(
        m4Chain(m4Trans(bp.x, bp.y, bp.z), m4RotY(bp.ry), m4Scale(bp.s * grow, 0.012, bp.s * grow * 0.8)),
        0.13 * fade,
        0.012 * fade,
        0.012 * fade,
        0.35
      );
    }
    for (const d of decals) {
      const s = DECAL_AX[d.axis] || DECAL_AX[2];
      drawCube(m4Chain(m4Trans(d.x, d.y, d.z), m4Scale(s[0], s[1], s[2])), 0.03, 0.03, 0.035, 0.9);
    }
    for (const z of zombies) drawZombie(z, t);
    for (const s of pickupSlots) drawPickup(s, t);
    for (const ch of loadedChunks()) for (const tr of ch.traders) drawTrader(tr.x, tr.y, tr.z, t);
    for (const p of particles) {
      const k2 = 1 - p.life / p.max;
      drawCube(
        m4Chain(m4Trans(p.x, p.y, p.z), m4RotY(p.ry), m4Scale(p.size, p.size, p.size)),
        p.r * (0.4 + 0.6 * k2),
        p.g * (0.4 + 0.6 * k2),
        p.b * (0.4 + 0.6 * k2),
        p.em
      );
    }
    for (const tr of tracers) {
      drawCube(
        m4Chain(m4Trans(tr.x, tr.y, tr.z), m4Aim(tr.dx, tr.dy, tr.dz), m4Scale(0.012, 0.012, tr.len)),
        1,
        0.8,
        0.45,
        1
      );
    }
    instFlush();
    drawSky(
      t,
      player.yaw,
      player.pitch,
      player.fov,
      canvas.width / canvas.height,
      dk,
      sun,
      moon,
      fr,
      fg,
      fb,
      k
    );
    gl.clear(gl.DEPTH_BUFFER_BIT);
    instBegin(proj, m4Ident(), lightPosArr, lightColArr, lightCount, player.x, eyeY, player.z);
    drawGun();
    instFlush();
    endScene();
  }

  // src/test-api.ts
  function installTestApi() {
    if (!location.search.includes("autotest")) return;
    window.__game = {
      state,
      player,
      zombies,
      // обход Pointer Lock: в headless-браузере захват мыши недоступен
      forceLock() {
        inputState.testLock = true;
      },
      fire(on) {
        inputState.firing = on;
      },
      spawn() {
        spawnZombie();
      },
      killFirst() {
        const z = zombies.find((z2) => !z2.dead);
        if (z) killZombie(z, false, 0, 0);
      },
      hurt(n) {
        damagePlayer(n, { x: player.x + 1, z: player.z });
      },
      damageStats,
      // диагностика рендера: канвас (нативное разрешение) и офскрин-сцена (RENDER_DPR)
      renderInfo() {
        return { w: canvas.width, h: canvas.height, sceneW: sceneSize.w, sceneH: sceneSize.h };
      },
      chunksLoaded,
      forceWave,
      hordeInfo,
      // орды: форс волны и статус (для тестов и перф-замера)
      floorAt(x, z) {
        return quickFloor(x, z, 9);
      },
      spawnAt(x, y, z) {
        spawnZombie({ x, y, z });
      },
      // торговля и оружие (магазин тестируется без подхода к торговцу)
      giveMoney(n) {
        state.money += n;
      },
      buyWeapon,
      buyAmmo,
      buyMed,
      switchWeapon,
      // день/ночь: установка позиции в цикле (сек) для скриншотов и тестов
      setCycle(t) {
        state.cycleT = t;
      },
      // дамп коллайдеров загруженных чанков (диагностика геометрии города)
      dumpColliders() {
        const out = [];
        for (const ch of loadedChunks()) for (const c of ch.colliders) {
          out.push([c.x0, c.x1, c.y0, c.y1, c.z0, c.z1]);
        }
        return out;
      }
    };
  }

  // src/main.ts
  onReloadKey(tryReload);
  onGameKey((code) => {
    if (!state.started || !state.alive || !locked()) return;
    if (handleShopKey(code)) return;
    if (code === "Digit1") switchWeapon(0);
    else if (code === "Digit2") switchWeapon(1);
    else if (code === "Digit3") switchWeapon(2);
    else if (code === "KeyF") {
      player.torch = !player.torch;
      sfx.torch();
    }
  });
  installTestApi();
  resetGame();
  updateHUD();
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const t = now / 1e3;
    const dt = Math.min((now - last) / 1e3, 0.05);
    last = now;
    const playing = state.started && state.alive && locked();
    if (playing) {
      state.elapsed += dt;
      state.cycleT = (state.cycleT + dt) % CYCLE;
      updatePlayer(dt);
      if (player.y < 6) {
        state.spawnTimer -= dt;
        const dif = difficulty();
        const aliveZ = zombies.reduce((n, z) => n + (z.dead ? 0 : 1), 0);
        if (state.spawnTimer <= 0 && aliveZ < dif.maxZ) {
          spawnZombie();
          state.spawnTimer = dif.interval * (0.7 + Math.random() * 0.6);
        }
      }
      updateHorde(dt);
      updateAllZombies(dt, t);
      updateParticles(dt);
      player.flash = Math.max(0, player.flash - dt);
      state.dmgFlash = Math.max(0, state.dmgFlash - dt * 2.5);
      state.camShake = Math.max(0, state.camShake - dt * 3);
      ambientFx(dt);
      updateHUD();
      updateAimBar(aimedZombie());
    } else if (!state.alive) {
      updateAimBar(null);
    }
    updateShopUI();
    ensureChunks(player.x, player.z);
    render(t);
  }
  requestAnimationFrame(frame);
})();
