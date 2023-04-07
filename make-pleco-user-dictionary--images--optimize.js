const inputFolder = './srghma-chinese-r12345-images';
const outputFolder = './srghma-chinese-r12345-images-optimized';

const sharp = require('sharp');
const fs = require('fs');
const { promisify } = require('util');
const chunkSize = 10;

if (!fs.existsSync(outputFolder)){
    fs.mkdirSync(outputFolder);
}

async function optimizeImage(file) {
  const inputFile = `${inputFolder}/${file}`;
  const outputFile = `${outputFolder}/${file}`;
  const inputSize = fs.statSync(inputFile).size;
  try {
    await sharp(inputFile).toFile(outputFile);
    const outputSize = fs.statSync(outputFile).size;
    const percentOptimized = 100 - Math.round((outputSize / inputSize) * 100);
    console.log(`Optimized ${file}: ${percentOptimized}% saved`);
    return true;
  } catch (error) {
    console.error(`Error optimizing ${file}: ${error.message}`);
    return false;
  }
}

async function processChunk(files) {
  const promises = files.map(file => optimizeImage(file));
  const results = await Promise.all(promises);
  const errors = results.filter(result => !result);
  const success = results.length - errors.length;
  console.log(`Processed ${success} images, ${errors.length} errors`);
  return errors;
}

async function optimizeImages() {
  const readdir = promisify(fs.readdir);
  const files = await readdir(inputFolder);

  const imageFiles = files.filter(file => {
    const ext = file.split('.').pop().toLowerCase();
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
  });

  const chunks = [];
  for (let i = 0; i < imageFiles.length; i += chunkSize) {
    const chunk = imageFiles.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  let errors = [];
  for (const chunk of chunks) {
    const chunkErrors = await processChunk(chunk);
    errors = errors.concat(chunkErrors);
  }

  console.log('All images optimized!');
}

optimizeImages();

