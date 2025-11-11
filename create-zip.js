const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Create output stream
const output = fs.createWriteStream('xano-geometry-game.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Created xano-geometry-game.zip (${archive.pointer()} bytes)`);
  console.log('✅ All paths use forward slashes - Linux compatible!');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add files with explicit forward-slash paths
const staticDir = './static';

// Add root files
archive.file(path.join(staticDir, 'index.html'), { name: 'index.html' });
archive.file(path.join(staticDir, 'package.json'), { name: 'package.json' });
archive.file(path.join(staticDir, 'vite.config.js'), { name: 'vite.config.js' });

// Add src directory
archive.directory(path.join(staticDir, 'src'), 'src', (entry) => {
  // Ensure forward slashes in the archive
  entry.name = entry.name.replace(/\\/g, '/');
  return entry;
});

// Add public directory
archive.directory(path.join(staticDir, 'public'), 'public', (entry) => {
  entry.name = entry.name.replace(/\\/g, '/');
  return entry;
});

archive.finalize();

