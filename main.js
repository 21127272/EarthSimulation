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

document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 8;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

// TEXTURES
const loader = new THREE.TextureLoader();

const earthDay = loader.load('./textures/earth_day.jpg');
const earthNormal = loader.load('./textures/earth_normal.png');
const earthSpecular = loader.load('./textures/earth_specular.png');
const earthClouds = loader.load('./textures/earth_clouds.jpg');

earthDay.colorSpace = THREE.SRGBColorSpace;
earthClouds.colorSpace = THREE.SRGBColorSpace;

// EARTH
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
        map: earthDay,
        normalMap: earthNormal,
        specularMap: earthSpecular,
        specular: new THREE.Color(0x333333),
        shininess: 15
    })
);
scene.add(earth);

// CLOUDS
const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, 64, 64),
    new THREE.MeshLambertMaterial({
        map: earthClouds,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
    })
);
scene.add(clouds);

// ATMOSPHERE
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 64, 64),
    new THREE.MeshBasicMaterial({
        color: 0x4da6ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    })
);
scene.add(atmosphere);

// GUI
const gui = new GUI();
const params = {
    earthRotation: 0.01,
    cloudRotation: 0.015,
    cloudOpacity: 0.5
};

gui.add(params, 'earthRotation', 0, 0.05, 0.001).name('Earth Rotation');
gui.add(params, 'cloudRotation', 0, 0.05, 0.001).name('Cloud Rotation');
gui.add(params, 'cloudOpacity', 0, 1, 0.01)
    .name('Cloud Opacity')
    .onChange(v => clouds.material.opacity = v);

// ANIMATE
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
});
