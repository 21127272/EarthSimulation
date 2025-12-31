console.log('MAIN JS LOADED');

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import GUI from 'https://unpkg.com/lil-gui@0.19/dist/lil-gui.esm.min.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 0, 4);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 8;

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(5, 3, 5);
sunLight.castShadow = true;
scene.add(sunLight);

// TEXTURES
const loader = new THREE.TextureLoader();

const earthDay = loader.load('./textures/earth_day.jpg');
const earthNormal = loader.load('./textures/earth_normal.png');
const earthSpecular = loader.load('./textures/earth_specular.png');
const earthClouds = loader.load('./textures/earth_clouds.jpg');

// Color space
earthDay.colorSpace = THREE.SRGBColorSpace;
earthClouds.colorSpace = THREE.SRGBColorSpace;
earthNormal.colorSpace = THREE.NoColorSpace;
earthSpecular.colorSpace = THREE.NoColorSpace;

// Giảm tải GPU
[earthDay, earthNormal, earthSpecular, earthClouds].forEach(tex => {
    tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
});

// EARTH
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthDay,
    normalMap: earthNormal,
    normalScale: new THREE.Vector2(1, 1),
    specularMap: earthSpecular,
    specular: new THREE.Color(0x333333),
    shininess: 15
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.castShadow = true;
earth.receiveShadow = true;
scene.add(earth);

// CLOUDS
const cloudGeometry = new THREE.SphereGeometry(1.03, 64, 64);

const cloudMaterial = new THREE.MeshLambertMaterial({
    map: earthClouds,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
});

const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// ATMOSPHERE
const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4da6ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
});

const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// GUI
const gui = new GUI();

const params = {
    earthRotation: 0.01,
    cloudRotation: 0.015,
    cloudOpacity: 0.5,
    sunIntensity: 2.0,
    atmosphereOpacity: 0.15
};

gui.add(params, 'earthRotation', 0, 0.05, 0.001).name('Earth Rotation');
gui.add(params, 'cloudRotation', 0, 0.05, 0.001).name('Cloud Rotation');

gui.add(params, 'cloudOpacity', 0, 1, 0.01)
    .name('Cloud Opacity')
    .onChange(v => cloudMaterial.opacity = v);

gui.add(params, 'sunIntensity', 0, 5, 0.1)
    .name('Sun Intensity')
    .onChange(v => sunLight.intensity = v);

gui.add(params, 'atmosphereOpacity', 0, 0.5, 0.01)
    .name('Atmosphere')
    .onChange(v => atmosphere.material.opacity = v);

// CONTEXT LOST HANDLING
renderer.domElement.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    console.warn('WebGL context lost');
});

renderer.domElement.addEventListener('webglcontextrestored', () => {
    console.warn('WebGL context restored');
});

// ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y += params.earthRotation;
    clouds.rotation.y += params.cloudRotation;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
