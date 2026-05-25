const lbar    = document.getElementById('lbar');
const lstatus = document.getElementById('lstatus');
const loadEl  = document.getElementById('loading');
const statuses = ['Initializing agents…','Calibrating threat models…','Building adversarial graph…',
  'Deploying Sentinel…','Activating Adversary…','Syncing Builder…','Connecting Oracle…','Council ready.'];
let lpct=0, lidx=0;
const lInt = setInterval(()=>{
  lpct = Math.min(100, lpct + Math.random()*18+4);
  lbar.style.width = lpct+'%';
  lidx = Math.floor(lpct/100*statuses.length);
  lstatus.textContent = statuses[Math.min(lidx,statuses.length-1)];
  if(lpct>=100){
    clearInterval(lInt);
    setTimeout(()=>{ loadEl.classList.add('out'); setTimeout(()=>loadEl.style.display='none',1200); },450);
  }
},200);

window.addEventListener('resize',()=>{
  camera.aspect = W()/H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(),H());
});

let inCinematic   = false;
let cineTriggered = false;
let cineTime      = 0;
let activeAgent   = -2;
let lastRAF       = 0;

const heroEl   = document.getElementById('hero');
const cineEl   = document.getElementById('cine');
const cineDots = document.getElementById('cine-dots');
const cineSkip = document.getElementById('cine-skip');
const tovEl    = document.getElementById('tov');
const progEl   = document.getElementById('prog');
const sectEl   = document.getElementById('sections');
const barFill  = document.getElementById('cn-bar-fill');

function smoothstep(t){ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); }
function lerp3(a,b,t){
  const s=smoothstep(t);
  return [a[0]+(b[0]-a[0])*s, a[1]+(b[1]-a[1])*s, a[2]+(b[2]-a[2])*s];
}

function getCamState(t){
  const looped = ((t%LOOP)+LOOP)%LOOP;
  let k1=KF[KF.length-1], k2=KF[0];
  for(let i=0;i<KF.length-1;i++){
    if(looped>=KF[i].t && looped<KF[i+1].t){ k1=KF[i]; k2=KF[i+1]; break; }
  }
  const dur=k2.t-k1.t, f=dur>0?(looped-k1.t)/dur:0;
  return { pos:lerp3(k1.pos,k2.pos,f), look:lerp3(k1.look,k2.look,f), ag:f>0.35?k2.ag:k1.ag };
}

function setActiveAgent(id){
  if(id===activeAgent) return;
  activeAgent = id;

  bLights.forEach((l,i)=>{ l.intensity = id===-1 ? 0.12 : (i===id ? 4.0 : 0.06); });
  agObjs.forEach((ao,i)=>{
    const on = i===id;
    ao.beacon.glowMat.opacity  = on ? 0.65 : (id===-1 ? 0.06 : 0.01);
    ao.beacon.coneMat.opacity  = on ? 0.07 : 0.004;
    ao.beacon.spotMat.opacity  = on ? 0.1  : 0.005;
    ao.beacon.light.intensity  = on ? 4.0  : (id===-1 ? 0.12 : 0.04);
  });

  document.querySelectorAll('.cdot').forEach((d,i)=>{
    d.classList.toggle('active', i===id);
    d.classList.toggle('done', id>-1 && i<id);
  });

  const cnEls = document.querySelectorAll('.cn-el');
  cnEls.forEach(e=>e.style.opacity=0);
  if(id>=0){
    const a=AGENTS[id];
    setTimeout(()=>{
      document.getElementById('cn-num').textContent  = a.num;
      document.getElementById('cn-name').textContent = a.name;
      document.getElementById('cn-role').textContent = a.role;
      document.getElementById('cn-desc').textContent = a.desc;
      cnEls.forEach((e,i)=>{ setTimeout(()=>e.style.opacity=1, i*80); });
      barFill.style.transition='none';
      barFill.style.width='0%';
      requestAnimationFrame(()=>{
        barFill.style.transition='width 6.5s linear';
        barFill.style.width='100%';
      });
    },280);
  }
}

function startCinematic(){
  if(cineTriggered) return;
  cineTriggered = true;
  inCinematic   = true;

  heroEl.style.opacity = '0';
  heroEl.style.pointerEvents = 'none';

  tovEl.style.opacity = '1';
  setTimeout(()=>{
    charGroup.visible = true;
    cineTime = 0;
    setTimeout(()=>{
      tovEl.style.opacity = '0';
      cineEl.style.opacity = '1';
      cineDots.style.opacity = '1';
      cineSkip.classList.add('show');
    },500);
  },350);
}

function endCinematic(){
  inCinematic = false;
  cineEl.style.opacity  = '0';
  cineDots.style.opacity= '0';
  cineSkip.classList.remove('show');
  bLights.forEach(l=>l.intensity=0);
  agObjs.forEach(ao=>{
    ao.beacon.glowMat.opacity=0;
    ao.beacon.coneMat.opacity=0;
    ao.beacon.spotMat.opacity=0;
    ao.beacon.light.intensity=0;
  });
}

cineSkip.addEventListener('click',()=>{
  endCinematic();
  window.scrollTo({top: document.getElementById('driver').offsetHeight+80, behavior:'smooth'});
});

let heroCamAngle = 0;

window.addEventListener('scroll',()=>{
  const sy = window.scrollY;
  const vh = window.innerHeight;
  const frac = sy/vh;

  const secTop = document.getElementById('driver').offsetHeight;
  const secFrac = Math.max(0,(sy-secTop)/Math.max(1,sectEl.offsetHeight));
  progEl.style.width = (secFrac*100)+'%';

  if(frac < 0.4){
    heroEl.style.opacity = Math.max(0,1-frac*3).toString();
    if(inCinematic) endCinematic();
  } else if(frac >= 0.4 && !cineTriggered){
    startCinematic();
  }

  document.querySelectorAll('.reveal').forEach(el=>{
    if(el.getBoundingClientRect().top < vh*0.88) el.classList.add('vis');
  });
},{passive:true});

function animate(now){
  requestAnimationFrame(animate);
  const dt = Math.min((now-lastRAF)*0.001, 0.05);
  lastRAF = now;

  const pa = pGeo.attributes.position.array;
  for(let i=0;i<PCNT;i++){
    pa[i*3+1] += pVel[i];
    if(pa[i*3+1]>4.5) pa[i*3+1]=0;
  }
  pGeo.attributes.position.needsUpdate = true;
  pMesh.rotation.y += 0.00025;

  if(tableGroup.userData.holo) tableGroup.userData.holo.rotation.z += 0.003;

  if(inCinematic && activeAgent===-1){
    const pulse = (Math.sin(now*0.0012)+1)*0.5;
    bLights.forEach((l,i)=>{ l.intensity = 0.1 + pulse*0.08; });
  }

  if(inCinematic){
    cineTime += dt;

    const cs = getCamState(cineTime);

    camera.position.set(cs.pos[0], cs.pos[1], cs.pos[2]);
    camera.lookAt(cs.look[0], cs.look[1], cs.look[2]);

    const breath = Math.sin(now*0.00072)*0.007;
    const sway   = Math.cos(now*0.00054)*0.005;
    camera.position.y += breath;
    camera.position.x += sway;

    setActiveAgent(cs.ag);

  } else {
    heroCamAngle += dt * 0.036;
    camera.position.x = Math.sin(heroCamAngle) * 1.8;
    camera.position.y = 9.2 + Math.sin(now*0.0004)*0.4;
    camera.position.z = 3.2 + Math.cos(heroCamAngle*0.6)*0.9;
    camera.lookAt(0, 0.6, 0);
  }

  renderer.render(scene, camera);
}

animate(0);
