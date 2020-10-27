export default class UnknownFileTypeError extends Error {
  constructor(file, fileType, fileExtension) {
    super(
      `file type not supported:
file: "${file}"
ext: "${fileType.ext}"
mimeType: "${fileType.mime}"
extension: "${fileExtension}"`
    );
  }
}
