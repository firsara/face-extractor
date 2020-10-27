// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// TODO: install and get to work
// import '@tensorflow/tfjs-node';

import fs from 'fs';
import path from 'path';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import canvas from 'canvas';
import * as faceapi from 'face-api.js';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

export default async function extractFacesFromImage(imagePath) {
  const imageData = fs.readFileSync(imagePath);

  const img = new Image(); // Create a new Image
  img.src = imageData;

  // Initialiaze a new Canvas with the same dimensions
  // as the image, and get a 2D drawing context for it.
  const canvas = new Canvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(
    path.join(__dirname, '..', '..', 'models'),
  );

  const faces = await faceapi.detectAllFaces(
    canvas,
    new faceapi.SsdMobilenetv1Options(),
  );

  return faces;
}
