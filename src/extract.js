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

  return extractFromPDF(documentFile, temporaryDirectory);
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

  const faces = await extractFacesFromImage(file);

  console.log(faces);
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
