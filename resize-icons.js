const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
};

async function resizeIcons() {
    const sourceIcon = path.join(__dirname, 'resources', 'icon.png');
    const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

    for (const [dir, size] of Object.entries(sizes)) {
        const targetDir = path.join(androidResDir, dir);
        const targetFile = path.join(targetDir, 'ic_launcher.png');

        try {
            await sharp(sourceIcon)
                .resize(size, size)
                .toFile(targetFile);
            console.log(`Created ${size}x${size} icon in ${dir}`);
        } catch (error) {
            console.error(`Error processing ${dir}:`, error);
        }
    }
}

resizeIcons().catch(console.error); 