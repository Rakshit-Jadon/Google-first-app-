document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('goku-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; 
    H = window.innerHeight;
    canvas.width = W * dpr; 
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let emotion = 'idle';
  let t = 0;

  const PALETTE = {
    skin: '#f5c18a', skinD: '#e8a86a', skinDD: '#d4904a',
    orange: '#f07820', orangeL: '#f59030', orangeD: '#c05010',
    blue: '#2040c0', blueD: '#102090', blueL: '#3060e0',
    black: '#151520', hair: '#101018',
    white: '#f0f0f8', gold: '#ffd040', goldD: '#e0a810',
    eye: '#2a1a08', belt: '#1830a8',
    shadow: 'rgba(0,0,0,0.35)'
  };

  function lerp(a,b,t){ return a + (b-a)*t; }
  function easeInOut(t){ return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function sin(x){ return Math.sin(x); }
  function cos(x){ return Math.cos(x); }

  const EMOTIONS = {
    idle:   { name:'IDLE',   aura:0,   auraColor:'gold',  bodyBob:1,   headTilt:0,  eyeOpen:1,    mouthOpen:0,  mouthW:0.5, blushR:0, sweatDrop:0, powerAura:0 },
    talk:   { name:'TALK',   aura:0.2, auraColor:'blue',  bodyBob:0.7, headTilt:0.05, eyeOpen:0.85, mouthOpen:0.6, mouthW:0.8, blushR:0, sweatDrop:0, powerAura:0 },
    laugh:  { name:'LAUGH',  aura:0.1, auraColor:'gold',  bodyBob:1.6, headTilt:0.1, eyeOpen:0.3,  mouthOpen:0.9, mouthW:1,   blushR:1, sweatDrop:0, powerAura:0 },
    nod:    { name:'NOD',    aura:0.05,auraColor:'blue',  bodyBob:0.3, headTilt:0.2,  eyeOpen:0.9,  mouthOpen:0.2, mouthW:0.6, blushR:0, sweatDrop:0, powerAura:0 },
    angry:  { name:'ANGRY',  aura:0.9, auraColor:'gold',  bodyBob:0.5, headTilt:-0.05, eyeOpen:0.7, mouthOpen:0.5, mouthW:0.7, blushR:0, sweatDrop:0, powerAura:1 },
    attack: { name:'ATTACK', aura:1,   auraColor:'both',  bodyBob:0.2, headTilt:-0.1, eyeOpen:1,   mouthOpen:0.7, mouthW:0.9, blushR:0, sweatDrop:0, powerAura:1 },
  };

  let curE = EMOTIONS.idle, tgtE = EMOTIONS.idle, blendT = 1;

  function getE(k){ return lerp(curE[k], tgtE[k], easeInOut(Math.min(blendT,1))); }

  function setEmotion(e) {
    if (!EMOTIONS[e]) e = 'idle';
    if (emotion === e) return;
    curE = { ...curE };
    Object.keys(EMOTIONS.idle).forEach(k => { if(typeof curE[k]==='number') curE[k] = getE(k); });
    tgtE = EMOTIONS[e]; emotion = e; blendT = 0;
  }

  // Poll for global action from app.js
  window.gokuCurrentAction = 'idle';
  setInterval(() => {
    let action = window.gokuCurrentAction || 'idle';
    
    // Map Gemini logic actions to our Canvas EMOTIONS
    if (action === 'look_around') action = 'idle';
    if (!EMOTIONS[action]) action = 'idle';

    if (action !== emotion) {
      setEmotion(action);
    }
  }, 100);

  function drawAura(cx, cy, radius, strength, color, time) {
    if (strength < 0.01) return;
    const pulses = 4;
    for (let p = 0; p < pulses; p++) {
      const phase = (time * 1.8 + p / pulses) % 1;
      const r = radius * (0.8 + phase * 0.9);
      const alpha = strength * (1 - phase) * 0.35;
      const grad = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, r);
      if (color === 'gold' || color === 'both') {
        grad.addColorStop(0, `rgba(255,220,40,${alpha * 1.2})`);
        grad.addColorStop(0.5, `rgba(255,180,20,${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(255,200,0,0)');
      } else {
        grad.addColorStop(0, `rgba(100,160,255,${alpha * 1.2})`);
        grad.addColorStop(0.5, `rgba(60,120,255,${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(80,140,255,0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(cx, cy - 20, r, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (color === 'both') {
      for (let p = 0; p < pulses; p++) {
        const phase = (time * 2.2 + p / pulses + 0.5) % 1;
        const r = radius * (0.6 + phase * 0.7);
        const alpha = strength * (1 - phase) * 0.2;
        const grad = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, r);
        grad.addColorStop(0, `rgba(100,180,255,${alpha})`);
        grad.addColorStop(1, 'rgba(80,160,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.ellipse(cx, cy - 20, r, r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawGroundGlow(cx, cy, strength) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    grad.addColorStop(0, `rgba(255,200,40,${0.12 * strength})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(cx, cy, 120, 28, 0, 0, Math.PI * 2); ctx.fill();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function draw() {
    t += 0.016;
    blendT = Math.min(1, blendT + 0.045);

    const auraStr = getE('aura');
    const bodyBob = getE('bodyBob');
    const headTilt = getE('headTilt');
    const eyeOpen = getE('eyeOpen');
    const mouthOpen = getE('mouthOpen');
    const mouthW = getE('mouthW');
    const blushR = getE('blushR');
    const powerAura = getE('powerAura');
    const auraColor = tgtE.auraColor;

    const bobY = sin(t * 2.2) * 5 * bodyBob;
    const breathX = sin(t * 1.4) * 1.5;

    ctx.clearRect(0, 0, W, H);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#08101f');
    bgGrad.addColorStop(1, '#040810');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5 + 50) % W);
      const sy = ((i * 93.7 + 20) % (H * 0.75));
      const br = 0.3 + 0.7 * ((sin(t * 1.1 + i) + 1) / 2);
      ctx.fillStyle = `rgba(200,220,255,${0.15 + br * 0.25})`;
      ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    const cx = W / 2, cy = H * 0.45; // slightly higher up

    // Ground shadow
    drawGroundGlow(cx, cy + 130, Math.max(auraStr, powerAura));
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cx, cy + 138, 60, 10, 0, 0, Math.PI * 2); ctx.fill();

    // Power aura (large, behind)
    if (powerAura > 0.05) {
      drawAura(cx, cy - 40, 160, powerAura, auraColor, t);
      // Lightning streaks
      ctx.save(); ctx.globalAlpha = powerAura * 0.6;
      for (let i = 0; i < 5; i++) {
        const ang = t * 3 + i * (Math.PI * 2 / 5);
        const x1 = cx + cos(ang) * 50, y1 = cy - 60 + sin(ang) * 30;
        const x2 = cx + cos(ang) * 120, y2 = cy - 60 + sin(ang) * 70;
        ctx.strokeStyle = auraColor === 'both'
          ? (i % 2 === 0 ? '#ffd040' : '#60a0ff')
          : (auraColor === 'gold' ? '#ffd040' : '#60a0ff');
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2-x1)*0.3 + cos(ang+1)*15, y1 + (y2-y1)*0.3 + sin(ang+1)*10);
        ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.restore();
    }

    // Small aura glow
    if (auraStr > 0.05) drawAura(cx, cy + 40, 90, auraStr * 0.5, auraColor, t * 0.8);

    ctx.save();
    ctx.translate(cx, cy + bobY);

    // === BODY ===
    const isAttack = emotion === 'attack';
    const armSwing = isAttack ? sin(t * 8) * 0.4 : sin(t * 1.5) * 0.05;

    // Legs
    ctx.fillStyle = PALETTE.blue;
    // Left leg
    ctx.save(); ctx.translate(-14, 100);
    if (isAttack) ctx.rotate(sin(t * 8 + 1) * 0.15);
    roundRect(-13, 0, 26, 55, 6); ctx.fill();
    // Boot
    ctx.fillStyle = PALETTE.orange;
    roundRect(-13, 50, 28, 22, 5); ctx.fill();
    ctx.fillStyle = PALETTE.black;
    roundRect(-14, 65, 30, 10, 4); ctx.fill();
    ctx.restore();
    // Right leg
    ctx.fillStyle = PALETTE.blue;
    ctx.save(); ctx.translate(14, 100);
    if (isAttack) ctx.rotate(sin(t * 8 + 2) * 0.12);
    roundRect(-13, 0, 26, 55, 6); ctx.fill();
    ctx.fillStyle = PALETTE.orange;
    roundRect(-13, 50, 28, 22, 5); ctx.fill();
    ctx.fillStyle = PALETTE.black;
    roundRect(-14, 65, 30, 10, 4); ctx.fill();
    ctx.restore();

    // Torso
    ctx.fillStyle = PALETTE.orange;
    roundRect(-34 + breathX * 0.3, 20, 68, 82, 10); ctx.fill();
    // Gi chest stripe
    ctx.fillStyle = PALETTE.blue;
    roundRect(-12, 20, 24, 30, 4); ctx.fill();
    // Belt
    ctx.fillStyle = PALETTE.belt;
    roundRect(-36, 92, 72, 14, 4); ctx.fill();
    // Belt buckle
    ctx.fillStyle = PALETTE.gold;
    roundRect(-10, 94, 20, 10, 3); ctx.fill();

    // Wristbands
    ctx.fillStyle = PALETTE.white;
    roundRect(-60, 80, 16, 10, 3); ctx.fill();
    roundRect(44, 80, 16, 10, 3); ctx.fill();

    // Left arm
    ctx.save(); ctx.translate(-50, 35);
    ctx.rotate(-armSwing * 0.5 + (emotion === 'laugh' ? sin(t * 4) * 0.2 : 0));
    ctx.fillStyle = PALETTE.orange;
    roundRect(-10, 0, 20, 45, 8); ctx.fill();
    ctx.fillStyle = PALETTE.skin;
    roundRect(-10, 40, 22, 30, 8); ctx.fill();
    if (isAttack) {
      // Punch fist
      ctx.fillStyle = PALETTE.skin;
      roundRect(-10, 65, 24, 20, 6); ctx.fill();
    }
    ctx.restore();

    // Right arm
    ctx.save(); ctx.translate(50, 35);
    ctx.rotate(armSwing * 0.5 + (emotion === 'talk' ? sin(t * 3) * 0.1 : 0));
    ctx.fillStyle = PALETTE.orange;
    roundRect(-10, 0, 20, 45, 8); ctx.fill();
    ctx.fillStyle = PALETTE.skin;
    roundRect(-10, 40, 22, 30, 8); ctx.fill();
    ctx.restore();

    // === HEAD ===
    ctx.save();
    const nodAngle = emotion === 'nod' ? sin(t * 4) * 0.28 : 0;
    ctx.translate(0, -20);
    ctx.rotate(headTilt * 0.8 + nodAngle);

    // Neck
    ctx.fillStyle = PALETTE.skin;
    roundRect(-10, -5, 20, 25, 5); ctx.fill();

    // Head base
    ctx.fillStyle = PALETTE.skin;
    roundRect(-38, -65, 76, 70, 16); ctx.fill();

    // Ear L
    ctx.fillStyle = PALETTE.skinD;
    ctx.beginPath(); ctx.ellipse(-40, -35, 8, 11, 0, 0, Math.PI*2); ctx.fill();
    // Ear R
    ctx.beginPath(); ctx.ellipse(40, -35, 8, 11, 0, 0, Math.PI*2); ctx.fill();

    // === HAIR ===
    ctx.fillStyle = PALETTE.hair;
    // Hair base
    roundRect(-40, -68, 80, 30, 8); ctx.fill();

    function spike(x, y, w, h, lean) {
      ctx.beginPath();
      ctx.moveTo(x - w/2, y);
      ctx.lineTo(x + w/2, y);
      ctx.lineTo(x + w/3 + lean, y - h);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = PALETTE.hair;
    spike(-22, -66, 22, 52, -5);
    spike(-6,  -66, 20, 62, 2);
    spike(10,  -66, 22, 56, 6);
    spike(24,  -65, 18, 44, 8);
    spike(-32, -64, 16, 36, -8);
    // Front hair
    ctx.beginPath();
    ctx.moveTo(-38, -45); ctx.lineTo(-20, -68); ctx.lineTo(0, -62); ctx.lineTo(20, -68); ctx.lineTo(38, -45); ctx.lineTo(30, -48); ctx.lineTo(0, -55); ctx.lineTo(-30, -48);
    ctx.closePath(); ctx.fill();

    // Side spikes
    spike(-45, -55, 14, 28, -10);
    spike(45,  -55, 14, 26, 10);

    // Golden aura hair (SSJ effect for angry/attack)
    if (powerAura > 0.3) {
      ctx.globalAlpha = powerAura * 0.6 * (0.7 + 0.3 * sin(t * 5));
      ctx.fillStyle = '#ffd040';
      spike(-22, -66, 22, 58, -5);
      spike(-6,  -66, 20, 70, 2);
      spike(10,  -66, 22, 64, 6);
      spike(24,  -65, 18, 50, 8);
      ctx.globalAlpha = 1;
    }

    // === FACE ===
    // Eyebrows
    const browFurrow = emotion === 'angry' || emotion === 'attack' ? 6 : 0;
    ctx.strokeStyle = PALETTE.hair; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-26, -43 - browFurrow * 0.3); ctx.lineTo(-8, -46 - browFurrow); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(26, -43 - browFurrow * 0.3); ctx.lineTo(8, -46 - browFurrow); ctx.stroke();

    // Eyes
    const eyeH = 9 * eyeOpen;
    const eyeY = -36;
    // Left eye
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath(); ctx.ellipse(-17, eyeY, 10, Math.max(1, eyeH), 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = PALETTE.eye;
    ctx.beginPath(); ctx.ellipse(-17, eyeY + eyeH*0.05, 5, Math.max(0.5, eyeH*0.65), 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath(); ctx.arc(-14, eyeY - 2, 2, 0, Math.PI*2); ctx.fill();
    // Right eye
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath(); ctx.ellipse(17, eyeY, 10, Math.max(1, eyeH), 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = PALETTE.eye;
    ctx.beginPath(); ctx.ellipse(17, eyeY + eyeH*0.05, 5, Math.max(0.5, eyeH*0.65), 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath(); ctx.arc(20, eyeY - 2, 2, 0, Math.PI*2); ctx.fill();

    // Blush (laugh)
    if (blushR > 0) {
      ctx.fillStyle = `rgba(240,130,130,${blushR * 0.45})`;
      ctx.beginPath(); ctx.ellipse(-24, -26, 9, 6, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(24, -26, 9, 6, 0, 0, Math.PI*2); ctx.fill();
    }

    // Nose
    ctx.fillStyle = PALETTE.skinDD;
    ctx.beginPath(); ctx.ellipse(0, -20, 4, 3, 0, 0, Math.PI*2); ctx.fill();

    // Mouth
    const mW = 18 * mouthW, mH = 10 * mouthOpen;
    if (emotion === 'laugh') {
      ctx.fillStyle = PALETTE.black;
      ctx.beginPath();
      ctx.moveTo(-mW/2, -10);
      ctx.quadraticCurveTo(0, -10 + mH * 1.6, mW/2, -10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = PALETTE.white;
      ctx.beginPath(); ctx.ellipse(-5, -9 + mH*0.5, 4, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, -9 + mH*0.5, 4, 3, 0, 0, Math.PI*2); ctx.fill();
    } else if (emotion === 'angry' || emotion === 'attack') {
      ctx.strokeStyle = PALETTE.black; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-mW/2, -8 + mH*0.3); ctx.lineTo(mW/2, -8 + mH*0.3); ctx.stroke();
      if (mouthOpen > 0.3) {
        ctx.fillStyle = PALETTE.black;
        ctx.beginPath();
        ctx.moveTo(-mW/2, -8); ctx.lineTo(mW/2, -8);
        ctx.lineTo(mW/2, -8 + mH); ctx.lineTo(-mW/2, -8 + mH);
        ctx.closePath(); ctx.fill();
      }
      // Anger vein
      ctx.strokeStyle = '#cc2020'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(28, -58); ctx.lineTo(34, -54); ctx.lineTo(30, -50); ctx.stroke();
    } else {
      ctx.strokeStyle = PALETTE.skinDD; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-mW/2, -9);
      ctx.quadraticCurveTo(0, -9 + mH * 0.8 + 4, mW/2, -9);
      ctx.stroke();
    }

    // Talk effect: speech dots
    if (emotion === 'talk') {
      const dotPhase = (t * 3) % 3;
      for (let d = 0; d < 3; d++) {
        const active = Math.floor(dotPhase) === d;
        ctx.fillStyle = active ? '#60a0ff' : 'rgba(100,140,255,0.3)';
        ctx.beginPath(); ctx.arc(52 + d * 12, -70 + (active ? -4 : 0), 4, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(60,80,200,0.2)';
      ctx.beginPath(); ctx.moveTo(40, -60); ctx.lineTo(52, -70); ctx.lineTo(44, -62); ctx.fill();
    }

    // Nod indicator
    if (emotion === 'nod') {
      ctx.strokeStyle = 'rgba(100,200,100,0.6)'; ctx.lineWidth = 2;
      const checkT = sin(t * 4);
      ctx.beginPath(); ctx.moveTo(48, -50); ctx.lineTo(55, -44); ctx.lineTo(65, -58);
      ctx.globalAlpha = (checkT + 1) / 2;
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    // Sweat drop
    if (emotion === 'nod') {
      ctx.fillStyle = '#60aaff';
      ctx.beginPath(); ctx.arc(-44, -30, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-44, -25); ctx.lineTo(-40, -15); ctx.lineTo(-48, -15); ctx.closePath(); ctx.fill();
    }

    ctx.restore(); // head

    // Tail
    ctx.save(); ctx.translate(38, 60);
    const tailWag = sin(t * 2.5 + (isAttack ? t * 3 : 0)) * 20;
    ctx.strokeStyle = PALETTE.skinD; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, -10 + tailWag*0.3, 30 + tailWag, -30 + tailWag, 20 + tailWag*0.7, -50 + tailWag*0.3);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.skinDD; ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // main translate

    // Attack energy blast
    if (isAttack) {
      const blastPhase = (sin(t * 6) + 1) / 2;
      const bx = cx + 95 + blastPhase * 20, by = cy - 20;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 40 + blastPhase * 20);
      grad.addColorStop(0, `rgba(255,255,200,${0.9})`);
      grad.addColorStop(0.3, `rgba(255,220,40,${0.7})`);
      grad.addColorStop(1, 'rgba(255,200,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(bx, by, 40 + blastPhase * 20, 20 + blastPhase * 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Beam
      const beamGrad = ctx.createLinearGradient(cx + 60, by, bx - 30, by);
      beamGrad.addColorStop(0, 'rgba(255,220,40,0)');
      beamGrad.addColorStop(1, `rgba(255,220,40,${0.4 + blastPhase * 0.3})`);
      ctx.fillStyle = beamGrad;
      ctx.fillRect(cx + 60, by - 6, bx - cx - 90, 12);
    }
  }

  function loop() { draw(); requestAnimationFrame(loop); }
  loop();
});
