# face-extractor

extract faces as png images from files

## Installation

#### Install dependencies

```sh
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Install from npm registry

```sh
npm install -g face-extractor
```

#### Install from git repo

```sh
npm install -g git+ssh://git@github.com/firsara/face-extractor.git
```

## Usage

```sh
face-extractor /path/to/file.docx --output /path/to/output/folder --background "rgba(0, 0, 0, 0)" --square --pad 100
```

this will extract all detected faces in all images in given document and save them to `/path/to/output/folder/face-${imageIndex}-${faceIndex}.png`

## Options

- `--input` **(Required)**:  a string pointing to the desired input file
- `--output` **(Required)**:  a string pointing to the desired output folder
- `--background`: a string representing the desired background color (if extracted face needs to be filled with a background). i.e. `#000`, `rgba(255, 100, 50, 0.5)`, etc.
- `--square`: if passed, extracts a square image from detected faces
- `--pad`: a number, defining how much spacing should be added around the detected face (value is defined as a percentage, based on the size of the detected face. i.e. a value of `100` would add double the width and height to the image than it is actually detected)

### Supported File types

- doc
- docx
- odt
- pdf
- png
- jpeg
- jpg
