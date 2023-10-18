import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { degToRad } from "three/src/math/MathUtils";

function ensureEven(num) {
  return num % 2 === 0 ? num : num + 1;
}

const width = ensureEven(window.innerWidth);
const height = ensureEven(window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(width, height);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 0, 30);
camera.fov = 90;

camera.aspect = width / height;
camera.updateProjectionMatrix();

const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(0, 8, 6);
scene.add(light);

const loader = new OBJLoader();

const baseURL = "http://localhost:8000/omotion/";
let frameCounter = 0;
let currentObject = null;

function loadAndSaveFrame(frameNum) {
  const paddedFrameNum = String(frameNum).padStart(4, "0");
  const filename = `frame${paddedFrameNum}.obj`;

  fetch(baseURL + filename)
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No more frames to load.");
        }
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      if (currentObject) {
        scene.remove(currentObject);
      }
      const object = loader.parse(data);

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          geometry.computeBoundingBox();
          const centroid = new THREE.Vector3();
          geometry.boundingBox.getCenter(centroid);
          geometry.translate(-centroid.x, -centroid.y, -centroid.z);
        }
      });

      scene.add(object);
      currentObject = object;
      animate();

      const img = renderer.domElement.toDataURL("image/png");
      downloadImage(img, `frame${paddedFrameNum}.png`);

      frameCounter++;
      loadAndSaveFrame(frameCounter);
    })
    .catch((error) => {
      console.log(
        "There was an error with the fetch operation: ",
        error.message
      );
    });
}

function downloadImage(data, filename) {
  const a = document.createElement("a");
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

loadAndSaveFrame(frameCounter);
