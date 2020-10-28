// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// TODO: install and get to work
// import '@tensorflow/tfjs-node';

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import sharp from 'sharp';
import sizeOf from 'image-size';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import canvas from 'canvas';
import * as faceapi from 'face-api.js';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const asyncSizeOf = promisify(sizeOf);

async function detectFacesFromImage(imagePath) {
  const imageData = fs.readFileSync(imagePath);

  const img = new Image(); // Create a new Image
  img.src = imageData;

  // Initialiaze a new Canvas with the same dimensions
  // as the image, and get a 2D drawing context for it.
  const canvas = new Canvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(
    path.join(__dirname, '..', '..', 'models'),
  );

  const faces = await faceapi.detectAllFaces(
    canvas,
    new faceapi.SsdMobilenetv1Options(),
  );

  return faces;
}

async function getFaceFromImage(imagePath, face, opts) {
  const imageDimensions = await asyncSizeOf(imagePath);

  const x = Math.floor(face.box.x);
  const y = Math.floor(face.box.y);
  const width = Math.ceil(face.box.width);
  const height = Math.ceil(face.box.height);

  const longestSide = Math.max(width, height);
  const pad = Math.ceil((longestSide / 100) * opts.pad);

  const horizontalSize = opts.square ? longestSide : width;
  const verticalSize = opts.square ? longestSide : height;
  const startX = x - Math.round((horizontalSize - width) / 2);
  const startY = y - Math.round((verticalSize - height) / 2);

  const targetLeft = startX - pad;
  const targetTop = startY - pad;
  const targetWidth = horizontalSize + pad * 2;
  const targetHeight = verticalSize + pad * 2;

  const actualLeft = Math.max(0, targetLeft);
  const actualTop = Math.max(0, targetTop);
  const actualWidth =
    actualLeft + targetWidth > imageDimensions.width
      ? imageDimensions.width - actualLeft
      : targetWidth;

  const actualHeight =
    actualTop + targetHeight > imageDimensions.height
      ? imageDimensions.height - actualTop
      : targetHeight;

  const extendLeft = Math.abs(targetLeft - actualLeft);
  const extendTop = Math.abs(targetTop - actualTop);
  const extendRight = Math.abs(targetWidth - actualWidth - extendLeft); // TODO: check this
  const extendBottom = Math.abs(targetHeight - actualHeight - extendTop); // TODO: check this

  console.log(`
getting face from image ${imagePath}:

score: ${face.score}
x: ${x}
y: ${y}
width: ${width}
height: ${height}

square: ${opts.square ? 'true' : 'false'}
pad: ${pad}
background: ${JSON.stringify(opts.background)}
`);

  return await sharp(imagePath)
    .extract({
      left: actualLeft,
      top: actualTop,
      width: actualWidth,
      height: actualHeight,
    })
    .extend({
      left: extendLeft,
      top: extendTop,
      right: extendRight,
      bottom: extendBottom,
      background: opts.background,
    })
    .png()
    .toBuffer();
}

const defaultOptions = {
  square: false,
  pad: 20, // NOTE: pad is a percentage value from 0 to 100
  background: { r: 0, g: 0, b: 0, alpha: 0 },
};

export default async function extractFacesFromImage(
  imagePath,
  options = defaultOptions,
) {
  const opts = Object.assign(defaultOptions, options);
  const faces = await detectFacesFromImage(imagePath);

  return await Promise.all(
    faces.map((face) => getFaceFromImage(imagePath, face, opts)),
  );
}
