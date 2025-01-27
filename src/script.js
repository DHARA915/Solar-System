import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import starTexture from './img/starss.jpg';
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

// Create Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Orbit Controls
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 140, 140);
orbit.update();

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Background Texture
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background = cubeTextureLoader.load([
//   starTexture,
//   starTexture,
//   starTexture,
//   starTexture,
//   starTexture,
//   starTexture,
// ]);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({ map: textureLoader.load(sun2Texture) });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Orbits
function createOrbit(radius) {
  const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -0.5 * Math.PI;
  scene.add(ring);
}

createOrbit(28);
createOrbit(44);
createOrbit(62);
createOrbit(78);
createOrbit(100);
createOrbit(138);
createOrbit(176);
createOrbit(200);
createOrbit(216);

// Planets
function createPlanet(size, texture, position, ring) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.MeshBasicMaterial({ map: textureLoader.load(texture) });
  const mesh = new THREE.Mesh(geo, mat);
  const obj = new THREE.Object3D();
  obj.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    obj.add(ringMesh);
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
  }

  scene.add(obj);
  mesh.position.x = position;
  return { mesh, obj };
}

const mercury = createPlanet(3.2, mercuryTexture, 28);
const venus = createPlanet(5.8, venusTexture, 44);
const earth = createPlanet(6, earthTexture, 62);
const mars = createPlanet(4, marsTexture, 78);
const jupiter = createPlanet(12, jupiterTexture, 100);
const saturn = createPlanet(10, saturnTexture, 138, {
  innerRadius: 10,
  outerRadius: 20,
  texture: saturnRingTexture,
});
const uranus = createPlanet(7, uranusTexture, 176, {
  innerRadius: 7,
  outerRadius: 12,
  texture: uranusRingTexture,
});
const neptune = createPlanet(7, neptuneTexture, 200);
const pluto = createPlanet(2.8, plutoTexture, 216);

// Stars
const starGeo = new THREE.BufferGeometry();
const positions = [];
const velocities = []; // Array to store velocities for each star

// Create stars with initial positions and velocities
for (let i = 0; i < 3000; i++) {
  positions.push((Math.random() - 0.5) * 2000); // X position
  positions.push((Math.random() - 0.5) * 2000); // Y position
  positions.push((Math.random() - 0.5) * 2000); // Z position
  velocities.push({
    x: (Math.random() - 0.5) * 0.5, // Random X velocity
    y: (Math.random() - 0.5) * 0.5, // Random Y velocity
    z: (Math.random() - 0.5) * 0.5, // Random Z velocity
  });
}

starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
starGeo.velocities = velocities; // Attach velocities to the geometry

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1, // Adjust star size
});
const stars = new THREE.Points(starGeo, starMaterial);
scene.add(stars);


// Animate
function animateStars() {
    const positions = starGeo.attributes.position.array;
    const velocities = starGeo.velocities;
  
    for (let i = 0; i < positions.length; i += 3) {
      // Update positions based on velocities
      positions[i] += velocities[i / 3].x; // X position
      positions[i + 1] += velocities[i / 3].y; // Y position
      positions[i + 2] += velocities[i / 3].z; // Z position
  
      // Reset position if the star moves out of bounds
      if (Math.abs(positions[i]) > 1000) positions[i] = (Math.random() - 0.5) * 2000;
      if (Math.abs(positions[i + 1]) > 1000) positions[i + 1] = (Math.random() - 0.5) * 2000;
      if (Math.abs(positions[i + 2]) > 1000) positions[i + 2] = (Math.random() - 0.5) * 2000;
    }
  
    // Notify Three.js that positions have changed
    starGeo.attributes.position.needsUpdate = true;
  }
  


function animate() {
  // Sun rotation
  sun.rotateY(0.004);

  // Planet self-rotation
  mercury.mesh.rotateY(0.004);
  venus.mesh.rotateY(0.002);
  earth.mesh.rotateY(0.02);
  mars.mesh.rotateY(0.018);
  jupiter.mesh.rotateY(0.04);
  saturn.mesh.rotateY(0.038);
  uranus.mesh.rotateY(0.03);
  neptune.mesh.rotateY(0.032);
  pluto.mesh.rotateY(0.008);

  // Planet orbit rotation
  mercury.obj.rotateY(0.04);
  venus.obj.rotateY(0.015);
  earth.obj.rotateY(0.01);
  mars.obj.rotateY(0.008);
  jupiter.obj.rotateY(0.002);
  saturn.obj.rotateY(0.00029);
  uranus.obj.rotateY(0.00034);
  neptune.obj.rotateY(0.00051);
  pluto.obj.rotateY(0.00067);

  // Animate stars
  animateStars();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Adjust Camera on Resize
function updateCameraPosition() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  if (aspectRatio < 1) {
    camera.position.set(-60, 100, 120);
  } else {
    camera.position.set(-90, 140, 140);
  }
  orbit.update();
}

updateCameraPosition();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraPosition();
});
