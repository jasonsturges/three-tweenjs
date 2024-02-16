import "./style.css";
import {
  BoxGeometry,
  CineonToneMapping,
  Clock,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import * as TWEEN from "@tweenjs/tween.js";

// Scene
const scene = new Scene();

// Camera
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  50,
  10000,
);
camera.position.z = 5;

// Renderer
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x090909);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = CineonToneMapping;
document.body.appendChild(renderer.domElement);

const count = 64;

// Materials
const materials: MeshStandardMaterial[] = [];
let f = 0xff / count;
for (let i = 0; i < count; i++) {
  const color = ((i * f) << 16) | ((i * f) << 8) | (i * f);
  materials.push(new MeshStandardMaterial({ color: color }));
}

// Objects
const models: Mesh<BoxGeometry, MeshStandardMaterial>[] = [];
const geometry = new BoxGeometry(20, 20, 20);
for (let i = 0; i < count; i++) {
  const material = materials[i];
  const cube = new Mesh(geometry, material);
  models.push(cube);
  scene.add(cube);
}

// Lights
const ambientLight = new DirectionalLight(0x9090aa);
ambientLight.position.set(-100, -300, -500).normalize();
scene.add(ambientLight);

const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(1, 1, 1);
scene.add(hemisphereLight);

// Animation
let timer = 0;
const clock = new Clock();
renderer.setAnimationLoop(() => {
  const time = clock.getElapsedTime();
  if (clock.elapsedTime > timer) {
    timer = clock.elapsedTime + Math.random() + 0.25;
    const time = (timer - clock.elapsedTime) * 1000 - 150;
    const sx = Math.random() * 3;
    const sy = Math.random() * 3;
    const sz = Math.random() * 2;
    const yaw = Math.random() * 1000;
    const pitch = Math.random() * 1200;
    const dist = Math.random() * 500 + 250;
    const lookAtZero = true;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const n = i / models.length - 0.5;
      const t = new Object3D();

      t.rotateX((pitch * n * Math.PI) / 180);
      t.rotateY((yaw * n * Math.PI) / 180);
      t.translateZ(dist);
      t.scale.set(sx, sy, sz);

      if (lookAtZero) {
        t.lookAt(new Vector3(1, 0, 0));
      }

      new TWEEN.Tween(model.position)
        .to(t.position, time)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
      new TWEEN.Tween(model.scale)
        .to(t.scale, time)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
      new TWEEN.Tween(model.rotation)
        .to(t.rotation, time)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }
  }

  camera.position.set(Math.sin(time) * 1000, 20, Math.cos(time) * 1000);
  camera.lookAt(new Vector3(0, 0, 0));

  TWEEN.update();

  renderer.render(scene, camera);
});

// Resize handler
const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", resize);
