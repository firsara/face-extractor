# face-extractor

extract faces as png images from files

## Installation

#### Install dependencies

##### OSX

```sh
brew install pkg-config cairo pango libpng jpeg giflib librsvg unoconv
```

##### Ubuntu

```sh
sudo apt-get install pkg-config libcairo2-dev libpango-1.0-0 libpng-dev libjpeg-dev libgif-dev librsvg2-bin unoconv
```

#### Install from npm registry

```sh
npm install -g face-extractor
```

## Usage

```sh
face-extractor /path/to/file.docx --output /path/to/output/folder --tensorflow --background "rgba(0, 0, 0, 0)" --square --pad 100
```

this will extract all detected faces in all images in given document and save them to `/path/to/output/folder/face-${imageIndex}-${faceIndex}.png`

### Using Tensorflow

If you want to use tensorflow native bindings you have to install them globally like so:

```sh
npm install -g @tensorflow/tfjs-node@1.7.4
```

Note that we have to specify version lower than 2 because `face-api.js` is not compatible with newer versions of tensorflow.

## Options

- `--input` **(Required)**:  a string pointing to the desired input file
- `--output` **(Required)**:  a string pointing to the desired output folder
- `--background`: a string representing the desired background color (if extracted face needs to be filled with a background). i.e. `#000`, `rgba(255, 100, 50, 0.5)`, etc.
- `--square`: if passed, extracts a square image from detected faces
- `--pad`: a number, defining how much spacing should be added around the detected face (value is defined as a percentage, based on the size of the detected face. i.e. a value of `100` would add double the width and height to the image than it is actually detected)
- `--tensorflow`: if passed, uses native bindings (speeds things up dramatically)

### Supported File types

- doc
- docx
- odt
- pdf
- png
- jpeg
- jpg
