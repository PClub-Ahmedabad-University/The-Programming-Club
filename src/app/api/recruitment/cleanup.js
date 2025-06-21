const fs = require('fs');
const path = require('path');

const directoriesToRemove = [
    path.join(__dirname, 'recruitment/[roleId]'),
    path.join(__dirname, 'recruitment/[id]')
];

directoriesToRemove.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`Removing directory: ${dir}`);
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

console.log('Cleanup complete!');
