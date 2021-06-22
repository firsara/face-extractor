import fs from 'fs';
import rimraf from 'rimraf';
import { PNG } from 'pngjs';
import pako from 'pako';
import { PDFDocumentFactory, PDFName, PDFRawStream } from 'pdf-lib';

const PngColorTypes = {
  Grayscale: 0,
  Rgb: 2,
  GrayscaleAlpha: 4,
  RgbAlpha: 6,
};

const ComponentsPerPixelOfColorType = {
  [PngColorTypes.Rgb]: 3,
  [PngColorTypes.Grayscale]: 1,
  [PngColorTypes.RgbAlpha]: 4,
  [PngColorTypes.GrayscaleAlpha]: 2,
};

function savePng(image) {
  return new Promise((resolve, reject) => {
    const isGrayscale = image.colorSpace === PDFName.from('DeviceGray');
    const colorPixels = pako.inflate(image.data);
    const alphaPixels = image.alphaLayer
      ? pako.inflate(image.alphaLayer.data)
      : undefined;

    const colorType =
      isGrayscale && alphaPixels
        ? PngColorTypes.GrayscaleAlpha
        : !isGrayscale && alphaPixels
        ? PngColorTypes.RgbAlpha
        : isGrayscale
        ? PngColorTypes.Grayscale
        : PngColorTypes.Rgb;

    const colorByteSize = 1;
    const width = image.width * colorByteSize;
    const height = image.height * colorByteSize;
    const inputHasAlpha = [
      PngColorTypes.RgbAlpha,
      PngColorTypes.GrayscaleAlpha,
    ].includes(colorType);

    const png = new PNG({
      width,
      height,
      colorType,
      inputColorType: colorType,
      inputHasAlpha,
    });

    const componentsPerPixel = ComponentsPerPixelOfColorType[colorType];
    png.data = new Uint8Array(width * height * componentsPerPixel);

    let colorPixelIdx = 0;
    let pixelIdx = 0;

    while (pixelIdx < png.data.length) {
      if (colorType === PngColorTypes.Rgb) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
      } else if (colorType === PngColorTypes.RgbAlpha) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        // NOTE: normalize to 100% transparent or 100% opaque, no half-transparencies allowed
        png.data[pixelIdx++] = alphaPixels[colorPixelIdx - 1] > 0 ? 255 : 0;
      } else if (colorType === PngColorTypes.Grayscale) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
      } else if (colorType === PngColorTypes.GrayscaleAlpha) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        // NOTE: normalize to 100% transparent or 100% opaque, no half-transparencies allowed
        png.data[pixelIdx++] = alphaPixels[colorPixelIdx - 1] > 0 ? 255 : 0;
      } else {
        throw new Error(`Unknown colorType=${colorType}`);
      }
    }

    const buffer = [];
    png
      .pack()
      .on('data', (data) => buffer.push(...data))
      .on('end', () => resolve(Buffer.from(buffer)))
      .on('error', (err) => reject('err'));
  });
}

export default async function extractImagesFromPDF(file, outputDirectory) {
  const pdfDoc = PDFDocumentFactory.load(fs.readFileSync(file));

  // Define some variables we'll use in a moment
  const imagesInDoc = [];
  let objectIdx = 0;

  // (1) Find all the image objects in the PDF
  // (2) Extract useful info from them
  // (3) Push this info object to `imageInDoc` array
  pdfDoc.index.index.forEach((pdfObject, ref) => {
    objectIdx += 1;

    if (!(pdfObject instanceof PDFRawStream)) return;

    const { lookupMaybe } = pdfDoc.index;
    const { dictionary: dict } = pdfObject;

    const smaskRef = dict.getMaybe('SMask');
    const colorSpace = lookupMaybe(dict.getMaybe('ColorSpace'));
    const subtype = lookupMaybe(dict.getMaybe('Subtype'));
    const width = lookupMaybe(dict.getMaybe('Width'));
    const height = lookupMaybe(dict.getMaybe('Height'));
    const name = lookupMaybe(dict.getMaybe('Name'));
    const bitsPerComponent = lookupMaybe(dict.getMaybe('BitsPerComponent'));
    const filter = lookupMaybe(dict.getMaybe('Filter'));

    if (subtype === PDFName.from('Image')) {
      imagesInDoc.push({
        ref,
        smaskRef,
        colorSpace,
        name: name ? name.key : `Object${objectIdx}`,
        width: width.number,
        height: height.number,
        bitsPerComponent: bitsPerComponent.number,
        data: pdfObject.content,
        type: filter === PDFName.from('DCTDecode') ? 'jpg' : 'png',
      });
    }
  });

  // Find and mark SMasks as alpha layers
  imagesInDoc.forEach((image) => {
    if (image.type === 'png' && image.smaskRef) {
      const smaskImg = imagesInDoc.find(({ ref }) => ref === image.smaskRef);
      smaskImg.isAlphaLayer = true;
      image.alphaLayer = image;
    }
  });

  // Create a new page
  const page = pdfDoc.createPage([700, 700]);

  // Add images to the page
  imagesInDoc.forEach((image) => {
    page.addImageObject(image.name, image.ref);
  });

  // Log info about the images we found in the PDF
  console.log('\n===== Images in PDF =====');
  imagesInDoc.forEach((image) => {
    console.log(
      '\nName:',
      image.name,
      '\nType:',
      image.type,
      '\nColor Space:',
      image.colorSpace.toString(),
      '\nHas Alpha Layer?',
      image.alphaLayer ? true : false,
      '\nIs Alpha Layer?',
      image.isAlphaLayer || false,
      '\nWidth:',
      image.width,
      '\nHeight:',
      image.height,
      '\nBits Per Component:',
      image.bitsPerComponent,
      '\nData:',
      `Uint8Array(${image.data.length})`,
      '\nRef:',
      image.ref.toString(),
    );
  });

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  rimraf.sync(`./${outputDirectory}/*.{jpg,png}`);

  let idx = 0;
  const extractedImages = [];

  console.log();

  for (const img of imagesInDoc) {
    if (!img.isAlphaLayer) {
      try {
        const imageData = img.type === 'jpg' ? img.data : await savePng(img);
        const outputFile = `${outputDirectory}/out${idx + 1}.png`;
        console.log(`extracting image: ${outputFile}`);
        fs.writeFileSync(outputFile, imageData);
        idx += 1;

        extractedImages.push(outputFile);
      } catch (err) {
        console.log();
        console.error('error while trying to extract image');
        console.error(err);
        console.log();
      }
    }
  }

  console.log();
  console.log(`Images written to "${outputDirectory}"`);
  console.log();

  return extractedImages;
}
