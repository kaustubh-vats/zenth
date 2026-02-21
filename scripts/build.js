const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const outputZip = path.join(distDir, 'zenth.zip');

const includeEntries = [
  'icons',
  'images',
  'js',
  'styles',
  'svg',
  'manifest.json',
  'index.html',
  'styles.css',
  'style.css'
];

function addEntry(archive, entry) {
  const absPath = path.join(projectRoot, entry);
  if (!fs.existsSync(absPath)) return;

  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) {
    archive.directory(absPath, entry);
    return;
  }

  if (stat.isFile()) {
    archive.file(absPath, { name: entry });
  }
}

fs.mkdirSync(distDir, { recursive: true });
if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
}

const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Created: ${outputZip}`);
  console.log(`Size: ${archive.pointer()} bytes`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err.message);
    return;
  }
  throw err;
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
for (const entry of includeEntries) {
  addEntry(archive, entry);
}
archive.finalize();
