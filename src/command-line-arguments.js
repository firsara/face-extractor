import fs from 'fs';
import path from 'path';
import commandLineArgs from 'command-line-args';
import rgba from 'color-rgba';

class FileType {
  constructor(filepath) {
    this.path = path.resolve(filepath);
    this.exists = fs.existsSync(this.path);
  }
}

class FolderType {
  constructor(filepath) {
    this.path = path.resolve(filepath);
    this.exists =
      fs.existsSync(this.path) && fs.lstatSync(this.path).isDirectory();
  }
}

class BackgroundType {
  constructor(color) {
    this.color = color;

    const parsed = rgba(this.color);

    if (parsed && parsed.length === 4) {
      this.rgba = {
        r: parsed[0],
        g: parsed[1],
        b: parsed[2],
        alpha: parsed[3],
      };
    } else {
      this.rgba = { r: 0, g: 0, b: 0, alpha: 0 };
    }
  }
}

const options = commandLineArgs([
  {
    name: 'input',
    alias: 'i',
    defaultOption: true,
    type: (filename) => new FileType(filename),
  },
  {
    name: 'output',
    alias: 'o',
    type: (filename) => new FolderType(filename),
  },
  {
    name: 'square',
    alias: 's',
    type: Boolean,
    defaultValue: false,
  },
  {
    name: 'pad',
    alias: 'p',
    type: Number,
    defaultValue: 25,
  },
  {
    name: 'background',
    type: (color) => new BackgroundType(color),
    defaultValue: new BackgroundType('#fff'),
  },
]);

if (!(options.input && !!options.input.path)) {
  console.error('\ninput file must be specified!');
  console.error('\n> npm run extract cv.doc\n');
  process.exit(2);
}

if (!options.input.exists) {
  console.error(`file "${options.input.path}" does not exist`);
  process.exit(2);
}

if (!(options.output && !!options.output.path)) {
  console.error('\noutput directory must be specified!');
  console.error('\n> npm run extract cv.doc -o ~/output/directory\n');
  process.exit(2);
}

if (!options.output.exists) {
  console.error(`output directory "${options.output.path}" does not exist`);
  process.exit(2);
}

export default options;
