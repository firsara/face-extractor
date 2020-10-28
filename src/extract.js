import fs from 'fs';
import path from 'path';
import FileType from 'file-type';

import UnknownFileTypeError from './errors/UnknownFileTypeError';
import convertDocument from './processes/convertDocument';
import extractImagesFromPDF from './processes/extractImagesFromPDF';
import extractFacesFromImage from './processes/extractFacesFromImage';

async function extractFromDocument(file, options, temporaryDirectory) {
  const target = path.join(temporaryDirectory, 'converted-document.pdf');

  console.log(`\nconverting document "${file}" to pdf "${target}"`);

  const documentFile = await convertDocument(file, target);

  return await extractFromPDF(documentFile, options, temporaryDirectory);
}

async function extractFromPDF(file, options, temporaryDirectory) {
  const target = path.join(temporaryDirectory, 'pdf-images');

  console.log(`\nextracting images from pdf "${file}" to directory ${target}`);

  const images = await extractImagesFromPDF(file, target);

  return await Promise.all(
    images.map((image, index) =>
      extractFromImage(image, options, temporaryDirectory, index),
    ),
  );
}

async function extractFromImage(file, options, temporaryDirectory, prefix = 0) {
  console.log(`\nextracting faces from image "${file}"`);

  const faces = await extractFacesFromImage(file, {
    square: options.square,
    pad: options.pad,
    background: options.background.rgba,
  });

  console.log('\n');

  faces.forEach((face, index) => {
    const outputFile = path.join(
      options.output.path,
      `face-${prefix}-${index}.png`,
    );

    console.log(`writing face to "${outputFile}"`);

    fs.writeFileSync(outputFile, face);
  });
}

export default async function extract(options, temporaryDirectory) {
  const fileExtension = path.extname(options.input.path).toLowerCase();
  const fileType = await FileType.fromFile(options.input.path);

  switch (fileType.ext) {
    case 'cfb':
      // NOTE: cfb file type could be doc, xls, ppt, msi
      if (fileExtension !== '.doc') {
        throw new UnknownFileTypeError(
          options.input.path,
          fileType,
          fileExtension,
        );
      }

      return extractFromDocument(
        options.input.path,
        options,
        temporaryDirectory,
      );
    case 'docx':
    case 'odt':
      return extractFromDocument(
        options.input.path,
        options,
        temporaryDirectory,
      );
    case 'pdf':
      return extractFromPDF(options.input.path, options, temporaryDirectory);
    case 'jpg':
    case 'png':
      return extractFromImage(options.input.path, options, temporaryDirectory);
    default:
      throw new UnknownFileTypeError(
        options.input.path,
        fileType,
        fileExtension,
      );
  }
}
