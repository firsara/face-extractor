import fs from 'fs';
import path from 'path';
import FileType from 'file-type';

import UnknownFileTypeError from './errors/UnknownFileTypeError';
import convertDocument from './processes/convertDocument';
import extractImagesFromPDF from './processes/extractImagesFromPDF';
import extractFacesFromImage from './processes/extractFacesFromImage';

async function extractFromDocument(file, temporaryDirectory) {
  const target = path.join(temporaryDirectory, 'converted-document.pdf');

  console.log(`\nconverting document "${file}" to pdf "${target}"`);

  const documentFile = await convertDocument(file, target);

  return await extractFromPDF(documentFile, temporaryDirectory);
}

async function extractFromPDF(file, temporaryDirectory) {
  const target = path.join(temporaryDirectory, 'pdf-images');

  console.log(`\nextracting images from pdf "${file}" to directory ${target}`);

  const images = await extractImagesFromPDF(file, target);

  return await Promise.all(
    images.map((image) => extractFromImage(image, temporaryDirectory)),
  );
}

async function extractFromImage(file, temporaryDirectory) {
  console.log(`\nextracting faces from image "${file}"`);

  // TODO: make output folder and square / offset as options
  const faces = await extractFacesFromImage(file, {
    square: true,
    offset: 50,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  faces.forEach((face, index) =>
    fs.writeFileSync(
      `/Users/firsara/Downloads/test/faces/face-${index}.png`,
      face,
    ),
  );
}

export default async function extract(file, temporaryDirectory) {
  const fileExtension = path.extname(file).toLowerCase();
  const fileType = await FileType.fromFile(file);

  // TODO: try to support open office documents!
  switch (fileType.ext) {
    case 'cfb':
      // NOTE: cfb file type could be doc, xls, ppt, msi
      if (fileExtension !== '.doc') {
        throw new UnknownFileTypeError(file, fileType, fileExtension);
      }

      return extractFromDocument(file, temporaryDirectory);
    case 'docx':
      return extractFromDocument(file, temporaryDirectory);
    case 'pdf':
      return extractFromPDF(file, temporaryDirectory);
    case 'jpg':
    case 'png':
      return extractFromImage(file, temporaryDirectory);
    default:
      throw new UnknownFileTypeError(file, fileType, fileExtension);
  }
}
