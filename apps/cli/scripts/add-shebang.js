const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dist', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

if (!content.startsWith('#!/usr/bin/env node\n')) {
  const newContent = '#!/usr/bin/env node\n' + content;
  fs.writeFileSync(filePath, newContent);
  console.log('Added shebang to dist/index.js');
} else {
  console.log('Shebang already exists');
}
