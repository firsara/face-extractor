# face-extractor

extract faces as png images from files

## Installation

```sh
npm install face-extractor --save
```

## Usage

#### Doc

```sh
face-extractor input-file.doc
```

#### PDF

```sh
face-extractor input-file.pdf
```

#### Image

```sh
face-extractor input-file.png
```

### Supported File types

- doc
- docx
- pdf
- png
- jpeg
- jpg

# TODO

write routine that retries 3-5 times if face-detect exits with error code 2 or process is stuck for more than 30 seconds
