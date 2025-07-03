
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import sun2Texture from './img/sun2.png';
import mercuryTexture from './img/mercury.jpg';
import venusTexture from './img/venus.jpg';
import earthTexture from './img/earth.jpg';
import marsTexture from './img/mars.jpg';
import jupiterTexture from './img/jupiter.jpg';
import saturnTexture from './img/saturn.jpg';
import saturnRingTexture from './img/saturn_ring.png';
import uranusTexture from './img/uranus.jpg';
import uranusRingTexture from './img/uranus ring.png';
import neptuneTexture from './img/neptune.jpg';
import plutoTexture from './img/pluto.jpg';

// Scene and Camera Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 140, 140);
orbit.update();

scene.add(new THREE.AmbientLight(0x333333));
const textureLoader = new THREE.TextureLoader();

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(16, 30, 30),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(sun2Texture) })
);
scene.add(sun);

// Create Orbits
const orbits = [];
function createOrbit(radius) {
  const geo = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -0.5 * Math.PI;
  scene.add(ring);
  orbits.push(ring);
}
[28, 44, 62, 78, 100, 138, 176, 200, 216].forEach(createOrbit);

// Planets
function createPlanet(name, size, texture, position, ring = null, speed = 0.01) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.MeshBasicMaterial({ map: textureLoader.load(texture) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = position;
  mesh.name = name;

  const obj = new THREE.Object3D();
  obj.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
    obj.add(ringMesh);
  }

  scene.add(obj);
  return { name, mesh, obj, orbitalSpeed: speed };
}

const planets = {
  mercury: createPlanet('Mercury', 3.2, mercuryTexture, 28, null, 0.04),
  venus: createPlanet('Venus', 5.8, venusTexture, 44, null, 0.015),
  earth: createPlanet('Earth', 6, earthTexture, 62, null, 0.01),
  mars: createPlanet('Mars', 4, marsTexture, 78, null, 0.008),
  jupiter: createPlanet('Jupiter', 12, jupiterTexture, 100, null, 0.002),
  saturn: createPlanet('Saturn', 10, saturnTexture, 138, { innerRadius: 10, outerRadius: 20, texture: saturnRingTexture }, 0.00029),
  uranus: createPlanet('Uranus', 7, uranusTexture, 176, { innerRadius: 7, outerRadius: 12, texture: uranusRingTexture }, 0.00034),
  neptune: createPlanet('Neptune', 7, neptuneTexture, 200, null, 0.00051),
  pluto: createPlanet('Pluto', 2.8, plutoTexture, 216, null, 0.00067),
};

// Starfield
const starGeo = new THREE.BufferGeometry();
const starPositions = [], starVelocities = [];
for (let i = 0; i < 3000; i++) {
  starPositions.push((Math.random() - 0.5) * 2000);
  starPositions.push((Math.random() - 0.5) * 2000);
  starPositions.push((Math.random() - 0.5) * 2000);
  starVelocities.push({ x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5, z: (Math.random() - 0.5) * 0.5 });
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
starGeo.velocities = starVelocities;
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
const stars = new THREE.Points(starGeo, starMaterial);
scene.add(stars);

function animateStars() {
  const pos = starGeo.attributes.position.array;
  const vel = starGeo.velocities;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] += vel[i / 3].x;
    pos[i + 1] += vel[i / 3].y;
    pos[i + 2] += vel[i / 3].z;
    if (Math.abs(pos[i]) > 1000) pos[i] = (Math.random() - 0.5) * 2000;
    if (Math.abs(pos[i + 1]) > 1000) pos[i + 1] = (Math.random() - 0.5) * 2000;
    if (Math.abs(pos[i + 2]) > 1000) pos[i + 2] = (Math.random() - 0.5) * 2000;
  }
  starGeo.attributes.position.needsUpdate = true;
}

// Tooltip
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '5px 10px';
tooltip.style.background = 'rgba(0,0,0,0.7)';
tooltip.style.color = 'white';
tooltip.style.borderRadius = '5px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.zIndex = '100';
document.body.appendChild(tooltip);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(planets).map(p => p.mesh));
  if (intersects.length > 0) {
    tooltip.style.display = 'block';
    tooltip.textContent = intersects[0].object.name;
    tooltip.style.left = e.clientX + 10 + 'px';
    tooltip.style.top = e.clientY + 10 + 'px';
  } else {
    tooltip.style.display = 'none';
  }
});

// Responsive Menu Button
const menuToggle = document.createElement('button');
menuToggle.textContent = '☰ Menu';
Object.assign(menuToggle.style, {
  position: 'absolute',
  top: '10px',
  left: '10px',
  zIndex: 101,
  padding: '10px',
  fontSize: '16px',
  border: 'none',
  borderRadius: '5px',
  background: 'rgba(0,0,0,0.7)',
  color: 'white',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  display: window.innerWidth > 768 ? 'none' : 'block',
});
document.body.appendChild(menuToggle);

// Control Panel
const panel = document.createElement('div');
Object.assign(panel.style, {
  position: 'absolute',
  top: '60px',
  left: '10px',
  padding: '15px',
  background: 'rgba(0,0,0,0.5)',
  borderRadius: '10px',
  maxHeight: '90vh',
  overflowY: 'auto',
  color: 'white',
  zIndex: 100,
  fontFamily: 'sans-serif',
  fontSize: '14px',
  width: '90vw',
  maxWidth: '300px',
  boxSizing: 'border-box',
  display: window.innerWidth > 768 ? 'block' : 'none',
});
document.body.appendChild(panel);

menuToggle.onclick = () => {
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    menuToggle.style.display = 'block';
    panel.style.display = 'block';
  } else {
    menuToggle.style.display = 'none';
    panel.style.display = 'block';
  }
});

// Sliders and Buttons
for (let key in planets) {
  const p = planets[key];
  const label = document.createElement('label');
  label.textContent = `${p.name} Speed`;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 0.05;
  slider.step = 0.0001;
  slider.value = p.orbitalSpeed;
  const value = document.createElement('span');
  value.textContent = ` ${slider.value}`;
  slider.oninput = () => {
    p.orbitalSpeed = parseFloat(slider.value);
    value.textContent = ` ${slider.value}`;
  };
  panel.append(label, slider, value, document.createElement('br'));
}

// Pause and Dark Mode
let paused = false;
const pauseBtn = document.createElement('button');
pauseBtn.textContent = '⏸ Pause';
pauseBtn.style.marginTop = '10px';
pauseBtn.style.width = '100%';
pauseBtn.style.padding = '10px';
pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
};
panel.appendChild(pauseBtn);

let darkMode = true;
const toggleBtn = document.createElement('button');
toggleBtn.textContent = '🌙 Toggle Dark/Light';
toggleBtn.style.marginTop = '10px';
toggleBtn.style.width = '100%';
toggleBtn.style.padding = '10px';
toggleBtn.onclick = () => {
  darkMode = !darkMode;
  scene.background = new THREE.Color(darkMode ? 0x000000 : 0xffffff);
  starMaterial.color.set(darkMode ? 0xffffff : 0x000000);
  orbits.forEach(o => o.material.color.set(darkMode ? 0xffffff : 0x000000));
  panel.style.background = darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)';
  panel.style.color = darkMode ? 'white' : 'black';
  tooltip.style.background = darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
  tooltip.style.color = darkMode ? 'white' : 'black';
};
panel.appendChild(toggleBtn);

// Animation Loop
function animate() {
  if (!paused) {
    sun.rotateY(0.004);
    for (let key in planets) {
      planets[key].mesh.rotateY(0.01);
      planets[key].obj.rotateY(planets[key].orbitalSpeed);
    }
    animateStars();
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Resize Camera
function updateCameraPosition() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.position.set(aspect < 1 ? -60 : -90, 140, 140);
  orbit.update();
}
updateCameraPosition();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraPosition();
});
