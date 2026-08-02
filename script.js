// script.js (module) - Three.js 3D scene + candle blow-out + confetti
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const musicToggle = document.getElementById('musicToggle');
const surpriseModal = document.getElementById('surpriseModal');
const closeModalButton = document.querySelector('.close-modal');
const giftButton = document.querySelector('.gift-button');
const revealItems = document.querySelectorAll('.reveal');
const countDownEls = {
  days: document.querySelector('[data-days]'),
  hours: document.querySelector('[data-hours]'),
  minutes: document.querySelector('[data-minutes]'),
  seconds: document.querySelector('[data-seconds]')
};

const birthdayAudio = new Audio('assets/music/birthday.mp3');
birthdayAudio.loop = true;
birthdayAudio.volume = 0.28;

let isPlaying = false;

async function toggleMusic() {
  try {
    if (!isPlaying) {
      await birthdayAudio.play();
      isPlaying = true;
      musicToggle.textContent = '❚❚ Music';
    } else {
      birthdayAudio.pause();
      birthdayAudio.currentTime = 0;
      isPlaying = false;
      musicToggle.textContent = '♫ Music';
    }
  } catch (error) {
    console.warn('Audio playback is unavailable in this browser or file path.', error);
    musicToggle.textContent = '♫ Music';
    isPlaying = false;
  }
}

function openModal() {
  surpriseModal.classList.add('visible');
  surpriseModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  surpriseModal.classList.remove('visible');
  surpriseModal.setAttribute('aria-hidden', 'true');
}

musicToggle.addEventListener('click', toggleMusic);
giftButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
surpriseModal.addEventListener('click', (event) => {
  if (event.target === surpriseModal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.2 }
);
revealItems.forEach((item) => observer.observe(item));

function getNextBirthdayDate() {
  const today = new Date();
  // Edit if you want a custom date (month is 0-indexed)
  const nextBirthday = new Date(today.getFullYear(), 8, 15, 0, 0, 0);
  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  return nextBirthday;
}

function updateCountdown() {
  const targetDate = getNextBirthdayDate();
  const now = new Date();
  const difference = targetDate - now;

  if (difference <= 0) {
    countDownEls.days.textContent = '00';
    countDownEls.hours.textContent = '00';
    countDownEls.minutes.textContent = '00';
    countDownEls.seconds.textContent = '00';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  countDownEls.days.textContent = String(days).padStart(2, '0');
  countDownEls.hours.textContent = String(hours).padStart(2, '0');
  countDownEls.minutes.textContent = String(minutes).padStart(2, '0');
  countDownEls.seconds.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* -----------------------------
   Confetti (canvas overlay)
   ----------------------------- */
class Confetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.lastTime = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth * devicePixelRatio;
    this.canvas.height = window.innerHeight * devicePixelRatio;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  start(amount = 140) {
    if (window.innerWidth <= 420) return; // skip on tiny screens
    this.particles = [];
    for (let i = 0; i < amount; i++) {
      this.particles.push(this._createParticle());
    }
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._tick.bind(this));
  }

  _createParticle() {
    const colors = ['#ff7ecb', '#ffd166', '#b88cff', '#ffc9b9', '#7c56ff', '#ff5ca8'];
    return {
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 10,
      h: 8 + Math.random() * 10,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 6,
      r: Math.random() * 360,
      vr: -6 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: Math.random() * 0.6
    };
  }

  _tick(now) {
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this._update(dt);
    this._draw();
    if (this.running && this.particles.length) {
      requestAnimationFrame(this._tick.bind(this));
    } else {
      this.running = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  _update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx + Math.sin(p.y * 0.01) * p.drift;
      p.y += p.vy;
      p.r += p.vr * dt * 20;
      p.vy += 9.8 * dt * 0.2; // gravity
      if (p.y > window.innerHeight + 50) this.particles.splice(i, 1);
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.r * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }
}

/* -----------------------------
   Three.js 3D Scene
   ----------------------------- */

const container = document.getElementById('threeContainer');
const confettiCanvas = document.getElementById('confettiCanvas');
const confetti = new Confetti(confettiCanvas);

let renderer, scene, camera, controls;
let clock = new THREE.Clock();
let pointer = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let flameMeshes = []; // track flame meshes
let flameLights = new Map();
let flameState = new Map(); // mesh.id -> { lit: true, progress: 1 }
let blowSound = null;

// Try to load optional blow sound (if you add assets/sounds/blow.mp3)
try {
  blowSound = new Audio('assets/sounds/blow.mp3');
  blowSound.volume = 0.7;
} catch (e) {
  blowSound = null;
}

init3D();
animate();

function init3D() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // allow pointer events on canvas
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'pointer';

  // scene & camera
  scene = new THREE.Scene();
  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  // lights
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x080820, 0.7);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xfff0cc, 1.0);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  // ground (invisible)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0e0a14, opacity: 0, transparent: true });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.4;
  scene.add(ground);

  // Add cake group
  const cake = new THREE.Group();
  scene.add(cake);

  // cake body
  const bodyGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.9, 64);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffd8eb,
    metalness: 0.05,
    roughness: 0.45
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -0.6;
  cake.add(body);

  // cake top
  const topGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.16, 64);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0xfff2c2,
    metalness: 0.02,
    roughness: 0.3
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = -0.13;
  cake.add(top);

  // candles
  const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16);
  const candleMat = new THREE.MeshStandardMaterial({ color: 0xf7f7ff, roughness: 0.2 });
  const candlePositions = [-0.6, 0, 0.6];
  candlePositions.forEach((x, i) => {
    const c = new THREE.Mesh(candleGeo, candleMat);
    c.position.set(x, -0.0, 0);
    cake.add(c);

    // flame (use small sphere + emissive material)
    const flameGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb84d });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(x, 0.25, 0);
    flame.userData.type = 'flame';
    flame.userData.index = i;
    flameMeshes.push(flame);
    cake.add(flame);

    // small point light for warmth
    const fLight = new THREE.PointLight(0xffaa33, 0.9, 3);
    fLight.position.copy(flame.position);
    scene.add(fLight);
    flameLights.set(flame.id, fLight);
    flameState.set(flame.id, { lit: true, progress: 1 });
  });

  cake.position.set(0, -0.2, 0);
  cake.rotation.y = Math.PI * 0.05;

  // balloons
  const balloonGroup = new THREE.Group();
  scene.add(balloonGroup);
  const balloonColors = [0xff7ecb, 0xffd166, 0xb88cff];
  for (let i = 0; i < 6; i++) {
    const bGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const bMat = new THREE.MeshStandardMaterial({
      color: balloonColors[i % balloonColors.length],
      metalness: 0.25,
      roughness: 0.2
    });
    const balloon = new THREE.Mesh(bGeo, bMat);
    balloon.position.set((Math.random() - 0.5) * 3.6, -0.2 + Math.random() * 1.8, -1.0 + Math.random() * 2.4);
    balloon.scale.set(1, 1.1 + Math.random() * 0.3, 1);
    balloon.userData.baseY = balloon.position.y;
    balloon.userData.speed = 0.6 + Math.random() * 0.9;
    balloon.userData.type = 'balloon';
    balloonGroup.add(balloon);

    // string as a simple line
    const points = [];
    points.push(new THREE.Vector3(balloon.position.x, balloon.position.y - 0.36, balloon.position.z));
    points.push(new THREE.Vector3(balloon.position.x, balloon.position.y - 1.1, balloon.position.z + 0.02));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const l = new THREE.Line(lineGeo, lineMat);
    balloonGroup.add(l);
  }

  // small spark particles
  const particleCount = 80;
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    pPositions[idx] = (Math.random() - 0.5) * 6;
    pPositions[idx + 1] = Math.random() * 2 + 0.2;
    pPositions[idx + 2] = (Math.random() - 0.5) * 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xffd166,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Controls (desktop)
  const isMobile = /Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent) || window.innerWidth <= 780;
  if (!isMobile) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.8;
    controls.maxDistance = 8;
    controls.enablePan = false;
  }

  // pointer move for parallax
  window.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  });

  // click / tap to blow flames
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  window.addEventListener('resize', onWindowResize);
  onWindowResize();
}

function onPointerDown(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera({ x, y }, camera);
  const intersects = raycaster.intersectObjects(flameMeshes, true);
  if (intersects.length) {
    const mesh = intersects[0].object;
    const state = flameState.get(mesh.id);
    if (state && state.lit) {
      // extinguish the flame: mark and animate in render loop
      state.lit = false;
      state.start = performance.now();
      state.duration = 700 + Math.random() * 400;
      flameState.set(mesh.id, state);

      // optional blow sound
      try {
        if (blowSound) {
          blowSound.currentTime = 0;
          blowSound.play().catch(() => {});
        } else {
          // soft fallback: tiny click using WebAudio (short puff)
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = 200;
            g.gain.value = 0.02;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            o.stop(ctx.currentTime + 0.13);
          } catch (e) {}
        }
      } catch (err) {
        // ignore audio errors
      }

      checkAllFlames();
    }
  }
}

function checkAllFlames() {
  // if all flames are unlit, trigger confetti
  const anyLit = Array.from(flameState.values()).some((s) => s.lit);
  if (!anyLit) {
    confetti.start(220);
  }
}

function onWindowResize() {
  if (!renderer || !camera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

/* Animation loop */
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // cake group (rotate + float)
  scene.traverse((obj) => {
    if (obj.type === 'Group' && obj.children.some((c) => c.geometry && c.geometry.type === 'CylinderGeometry')) {
      obj.rotation.y = Math.sin(elapsed * 0.2) * 0.08;
      obj.position.y = -0.18 + Math.sin(elapsed * 0.6) * 0.02;
    }
  });

  // animate balloons
  scene.traverse((obj) => {
    if (obj.userData && obj.userData.type === 'balloon') {
      obj.position.y = obj.userData.baseY + Math.sin(elapsed * obj.userData.speed + obj.id) * 0.12;
      obj.position.x += Math.sin(elapsed * (0.12 + (obj.id % 3) * 0.03)) * 0.001;
    }
  });

  // animate particles (slight upward shimmer)
  const pts = scene.children.find((s) => s.type === 'Points');
  if (pts) {
    const positions = pts.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(elapsed * 0.6 + i) * 0.0005;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  }

  // animate flames (scale down when extinguishing)
  for (const mesh of flameMeshes) {
    const state = flameState.get(mesh.id);
    if (!state) continue;
    const light = flameLights.get(mesh.id);
    if (state.lit) {
      // subtle flicker
      const flicker = 0.9 + Math.sin(elapsed * 22 + mesh.id) * 0.08;
      mesh.scale.set(flicker, flicker, flicker);
      if (light) light.intensity = 0.9 + Math.sin(elapsed * 9 + mesh.id) * 0.15;
    } else {
      // extinguishing animation
      const now = performance.now();
      const t = Math.min(1, (now - (state.start || now)) / (state.duration || 600));
      const progress = 1 - easeOutCubic(t);
      mesh.scale.set(progress * 1, progress * 1, progress * 1);
      if (light) light.intensity = progress * 0.9;
      if (t >= 1) {
        // make invisible finally
        mesh.visible = false;
        if (light) {
          scene.remove(light);
          flameLights.delete(mesh.id);
        }
      }
    }
  }

  // Camera parallax
  const parallaxStrength = 0.35;
  const targetX = -pointer.x * parallaxStrength;
  const targetY = pointer.y * parallaxStrength * 0.7;
  camera.position.x += (targetX - camera.position.x) * 0.06;
  camera.position.y += (targetY - camera.position.y) * 0.06;
  camera.lookAt(0, -0.2, 0);

  if (controls) controls.update();
  renderer.render(scene, camera);
}

/* small easing */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
