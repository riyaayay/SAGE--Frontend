const canvas = document.getElementById('c');
const W = () => window.innerWidth, H = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.setClearColor(0x080d16, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x080d16, 0.042);

const camera = new THREE.PerspectiveCamera(44, W()/H(), 0.1, 120);
camera.position.set(1.5, 9.5, 3.5);
camera.lookAt(0, 0.8, 0);

const ambient = new THREE.AmbientLight(0x1a2540, 1.4);
scene.add(ambient);

const ceilLight = new THREE.PointLight(0x3a5580, 1.0, 18);
ceilLight.position.set(0, 4.5, 0);
ceilLight.castShadow = true;
ceilLight.shadow.mapSize.set(1024,1024);
ceilLight.shadow.camera.near = 0.1;
ceilLight.shadow.camera.far = 18;
scene.add(ceilLight);

const rimL = new THREE.DirectionalLight(0x2050c0, 0.35);
rimL.position.set(-8, 6, -4);
scene.add(rimL);
const rimR = new THREE.DirectionalLight(0x501080, 0.2);
rimR.position.set(8, 5, -4);
scene.add(rimR);

const bLights = AGENTS.map(a => {
  const l = new THREE.PointLight(a.beaconColor, 0, 7);
  l.castShadow = false;
  scene.add(l);
  return l;
});

function mat(color, roughness=0.75, metalness=0) {
  return new THREE.MeshStandardMaterial({color, roughness, metalness});
}

function mesh(geo, m) {
  const o = new THREE.Mesh(geo, m);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

const floor = mesh(
  new THREE.PlaneGeometry(28,28),
  mat(0x0c1420, 0.88, 0.04)
);
floor.rotation.x = -Math.PI/2;
floor.receiveShadow = true;
floor.castShadow = false;
scene.add(floor);

const grid = new THREE.GridHelper(22, 22, 0x1a2540, 0x111c30);
grid.position.y = 0.002;
scene.add(grid);

const ceil = mesh(new THREE.PlaneGeometry(28,28), mat(0x060c16,1));
ceil.rotation.x = Math.PI/2;
ceil.position.y = 5;
scene.add(ceil);

[[0,2.5,-11,0],[0,2.5,11,Math.PI],[-11,2.5,0,Math.PI/2],[11,2.5,0,-Math.PI/2]].forEach(([x,y,z,ry])=>{
  const w = mesh(new THREE.PlaneGeometry(22,5), mat(0x0b1422,0.9));
  w.position.set(x,y,z); w.rotation.y=ry;
  scene.add(w);
});

const panelMat = new THREE.MeshBasicMaterial({color:0x1a2a40, transparent:true, opacity:0.35});
for(let i=0;i<6;i++){
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(20,0.006), panelMat);
  strip.position.set(0, i*0.55+0.5, -10.98);
  scene.add(strip);
}

function buildTable(){
  const g = new THREE.Group();

  const top = mesh(
    new THREE.CylinderGeometry(TABLE_R, TABLE_R, 0.075, 48),
    mat(0x14202e, 0.22, 0.06)
  );
  top.position.y = 0.775;
  g.add(top);

  const edge = new THREE.Mesh(
    new THREE.CylinderGeometry(TABLE_R+0.025, TABLE_R+0.025, 0.08, 48, 1, true),
    mat(0x4a6282, 0.25, 0.65)
  );
  edge.position.y = 0.775;
  g.add(edge);

  const inlay = mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.079, 32),
    mat(0x1e2f44, 0.18, 0.12)
  );
  inlay.position.y = 0.776;
  g.add(inlay);

  const ped = mesh(
    new THREE.CylinderGeometry(0.12, 0.38, 0.72, 16),
    mat(0x283558, 0.28, 0.55)
  );
  ped.position.y = 0.36;
  g.add(ped);

  const base = mesh(new THREE.CylinderGeometry(0.62,0.62,0.055,20), mat(0x283558,0.3,0.5));
  base.position.y = 0.027;
  g.add(base);

  const holoMat = new THREE.MeshBasicMaterial({color:0x4f8ef0, transparent:true, opacity:0.1, side:THREE.DoubleSide});
  const holo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 36), holoMat);
  holo.rotation.x = -Math.PI/2;
  holo.position.y = 0.82;
  g.add(holo);
  g.userData.holo = holo;

  scene.add(g);
  return g;
}
const tableGroup = buildTable();

function buildChair(){
  const g = new THREE.Group();
  const sm = mat(0x1a1e2a, 0.65, 0.12);
  const mm = mat(0x3a4870, 0.25, 0.75);

  const seat = mesh(new THREE.BoxGeometry(0.54,0.075,0.54), mat(0x1e2438,0.72));
  seat.position.y = 0.44;
  g.add(seat);

  const cush = mesh(new THREE.BoxGeometry(0.50,0.055,0.50), mat(0x252a40,0.8));
  cush.position.y = 0.483;
  g.add(cush);

  const back = mesh(new THREE.BoxGeometry(0.5,0.62,0.068), sm);
  back.position.set(0,0.77,-0.24);
  g.add(back);

  const cap = mesh(new THREE.BoxGeometry(0.52,0.045,0.09), sm);
  cap.position.set(0,1.075,-0.235);
  g.add(cap);

  [-1,1].forEach(s=>{
    const ar = mesh(new THREE.BoxGeometry(0.06,0.04,0.42), mm);
    ar.position.set(s*0.29, 0.63, 0.02);
    g.add(ar);
  });

  [[-0.21,-0.21],[-0.21,0.21],[0.21,-0.21],[0.21,0.21]].forEach(([x,z])=>{
    const leg = mesh(new THREE.CylinderGeometry(0.022,0.022,0.44,7), mm);
    leg.position.set(x,0.22,z);
    g.add(leg);
  });

  return g;
}

function buildHuman(cfg){
  const g = new THREE.Group();
  const female = cfg.gender === 'female';
  const sk = mat(cfg.skinColor, 0.72);
  const su = mat(cfg.suitColor, 0.76);
  const ha = mat(cfg.hairColor, 0.96);
  const sh = mat(0xdde4f0, 0.82);

  const hips = mesh(new THREE.CylinderGeometry(0.17,0.19,0.3,10), su);
  hips.position.y = 0.57;
  g.add(hips);

  const torso = mesh(new THREE.CylinderGeometry(female?0.155:0.185,0.17,0.4,10), su);
  torso.position.y = 0.91;
  g.add(torso);

  const strip = mesh(new THREE.BoxGeometry(0.09,0.3,0.08), sh);
  strip.position.set(0,0.91,female?0.135:0.148);
  g.add(strip);

  const sho = mesh(new THREE.BoxGeometry(female?0.44:0.52,0.095,0.30), su);
  sho.position.y = 1.09;
  g.add(sho);

  const neck = mesh(new THREE.CylinderGeometry(0.062,0.082,0.15,8), sk);
  neck.position.y = 1.2;
  g.add(neck);

  const head = mesh(new THREE.SphereGeometry(0.178,20,16), sk);
  head.scale.set(0.95, 1.12, 0.92);
  head.position.y = 1.4;
  g.add(head);

  [-1,1].forEach(s=>{
    const ear = mesh(new THREE.SphereGeometry(0.034,8,8), sk);
    ear.position.set(s*0.17, 1.4, 0);
    g.add(ear);
  });

  [-1,1].forEach(s=>{
    const ew = mesh(new THREE.SphereGeometry(0.027,8,8), mat(0xf0eae4,0.5));
    ew.position.set(s*0.063, 1.415, 0.158);
    g.add(ew);
    const ep = mesh(new THREE.SphereGeometry(0.018,8,8), mat(0x080810,0.2));
    ep.position.set(s*0.063, 1.415, 0.17);
    g.add(ep);
  });

  const nose = mesh(new THREE.SphereGeometry(0.022,6,6), sk);
  nose.position.set(0, 1.375, 0.172);
  g.add(nose);

  if(female){
    const top = mesh(new THREE.SphereGeometry(0.185,16,12), ha);
    top.scale.set(1,0.6,1);
    top.position.y = 1.508;
    g.add(top);
    [-1,1].forEach(s=>{
      const side = mesh(new THREE.CylinderGeometry(0.072,0.05,0.52,8), ha);
      side.position.set(s*0.145, 1.22, -0.04);
      g.add(side);
    });
    const bk = mesh(new THREE.CylinderGeometry(0.155,0.1,0.56,12), ha);
    bk.position.set(0,1.22,-0.05);
    g.add(bk);
  } else {
    const cap = mesh(new THREE.SphereGeometry(0.182,16,10), ha);
    cap.scale.set(1,0.42,1);
    cap.position.y = 1.53;
    g.add(cap);
  }

  if(cfg.id === 2){
    const gm = mat(0x223344, 0.25, 0.85);
    [-1,1].forEach(s=>{
      const frame = mesh(new THREE.TorusGeometry(0.04,0.007,7,14), gm);
      frame.rotation.y = Math.PI/2;
      frame.position.set(s*0.063, 1.42, 0.165);
      g.add(frame);
    });
    const br = mesh(new THREE.CylinderGeometry(0.004,0.004,0.06,5), gm);
    br.rotation.z = Math.PI/2;
    br.position.set(0, 1.42, 0.173);
    g.add(br);
  }

  [-1,1].forEach((s,idx)=>{
    const arm = mesh(new THREE.CylinderGeometry(0.055,0.065,0.44,8), su);
    arm.rotation.z = s*0.18;
    arm.rotation.x = 0.32;
    arm.position.set(s*0.26, 0.9, 0.14);
    g.add(arm);
    const hand = mesh(new THREE.SphereGeometry(0.052,8,8), sk);
    hand.scale.set(0.9,0.58,1.1);
    hand.position.set(s*0.295, 0.775, 0.45);
    g.add(hand);
  });

  [-1,1].forEach(s=>{
    const th = mesh(new THREE.CylinderGeometry(0.082,0.076,0.5,8), su);
    th.rotation.x = Math.PI/2;
    th.position.set(s*0.12, 0.43, 0.28);
    g.add(th);
  });

  if(cfg.id === 2){
    const lbBase = mesh(new THREE.BoxGeometry(0.36,0.024,0.28), mat(0x2a3850,0.3,0.55));
    lbBase.position.set(0, 0.827, -0.56);
    g.add(lbBase);
    const lbScreen = mesh(new THREE.BoxGeometry(0.34,0.22,0.014), mat(0x0a1520,0.2,0.1));
    lbScreen.position.set(0, 0.96, -0.47);
    lbScreen.rotation.x = -0.55;
    g.add(lbScreen);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.18),
      new THREE.MeshBasicMaterial({color:0x0a4020, transparent:true, opacity:0.7}));
    scr.position.set(0,0.965,-0.463);
    scr.rotation.x = -0.55;
    g.add(scr);
  }

  return g;
}

function buildBeacon(cfg){
  const g = new THREE.Group();
  const pm = mat(0x3a4870, 0.22, 0.82);

  const base = mesh(new THREE.CylinderGeometry(0.1,0.13,0.05,14), pm);
  base.position.y = 0.025;
  g.add(base);

  const pole = mesh(new THREE.CylinderGeometry(0.017,0.02,1.78,8), pm);
  pole.position.y = 0.92;
  g.add(pole);

  const collar = mesh(new THREE.CylinderGeometry(0.035,0.03,0.055,10), pm);
  collar.position.y = 1.81;
  g.add(collar);

  const shadeMat = new THREE.MeshStandardMaterial({
    color:0x5a6882, roughness:0.18, metalness:0.78, side:THREE.DoubleSide
  });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.21,0.3,18,1,true), shadeMat);
  shade.rotation.x = Math.PI;
  shade.position.y = 1.78;
  g.add(shade);

  const disc = mesh(new THREE.CircleGeometry(0.022,10), pm);
  disc.rotation.x = -Math.PI/2;
  disc.position.y = 1.935;
  g.add(disc);

  const glowMat = new THREE.MeshBasicMaterial({
    color: cfg.beaconColor, transparent:true, opacity:0, side:THREE.FrontSide
  });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.16,16), glowMat);
  glow.rotation.x = -Math.PI/2;
  glow.position.y = 1.73;
  g.add(glow);

  const coneMat = new THREE.MeshBasicMaterial({
    color: cfg.beaconColor, transparent:true, opacity:0,
    side:THREE.BackSide, depthWrite:false
  });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55,1.6,18,1,true), coneMat);
  cone.rotation.x = Math.PI;
  cone.position.y = 1.0;
  g.add(cone);

  const spotMat = new THREE.MeshBasicMaterial({
    color:cfg.beaconColor, transparent:true, opacity:0, depthWrite:false
  });
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.45,20), spotMat);
  spot.rotation.x = -Math.PI/2;
  spot.position.y = 0.005;
  g.add(spot);

  const light = new THREE.PointLight(cfg.beaconColor, 0, 7);
  light.position.y = 1.72;
  g.add(light);

  return {group:g, light, glowMat, coneMat, spotMat};
}

const charGroup = new THREE.Group();
charGroup.visible = false;
scene.add(charGroup);

const agObjs = AGENTS.map(cfg => {
  const rad = (cfg.angle * Math.PI) / 180;
  const px = CHAR_R * Math.sin(rad);
  const pz = CHAR_R * Math.cos(rad);
  const ry = Math.atan2(px, pz) + Math.PI;

  const chair = buildChair();
  chair.position.set(px, 0, pz);
  chair.rotation.y = ry;
  charGroup.add(chair);

  const human = buildHuman(cfg);
  human.position.set(px, 0, pz);
  human.rotation.y = ry;
  charGroup.add(human);

  const rightRad = rad + Math.PI/2;
  const bpx = px + Math.sin(rightRad)*0.65 + Math.sin(rad)*0.85;
  const bpz = pz + Math.cos(rightRad)*0.65 + Math.cos(rad)*0.85;

  const beacon = buildBeacon(cfg);
  beacon.group.position.set(bpx, 0, bpz);
  charGroup.add(beacon.group);

  bLights[cfg.id].position.set(bpx, 1.72, bpz);

  return {chair, human, beacon, cfg, px, pz};
});

const PCNT = 220;
const pGeo = new THREE.BufferGeometry();
const pArr = new Float32Array(PCNT*3);
const pVel = new Float32Array(PCNT);
for(let i=0;i<PCNT;i++){
  pArr[i*3]   = (Math.random()-.5)*16;
  pArr[i*3+1] = Math.random()*4.5;
  pArr[i*3+2] = (Math.random()-.5)*16;
  pVel[i]     = 0.0004 + Math.random()*0.0006;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pArr,3));
const pMesh = new THREE.Points(pGeo,
  new THREE.PointsMaterial({color:0x4a6080,size:0.022,transparent:true,opacity:0.3,sizeAttenuation:true})
);
scene.add(pMesh);
