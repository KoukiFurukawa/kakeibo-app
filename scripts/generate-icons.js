// PWAアイコン生成スクリプト
// このファイルは開発用です。実際のプロジェクトでは適切なアイコンファイルを配置してください。

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const generateSVGIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  
  <!-- Calculator Icon -->
  <rect x="${size * 0.25}" y="${size * 0.1875}" width="${size * 0.5}" height="${size * 0.625}" rx="${size * 0.03125}" fill="white"/>
  
  <!-- Screen -->
  <rect x="${size * 0.296875}" y="${size * 0.234375}" width="${size * 0.40625}" height="${size * 0.15625}" rx="${size * 0.015625}" fill="#1f2937"/>
  <text x="${size * 0.5}" y="${size * 0.33203125}" text-anchor="middle" fill="white" font-family="monospace" font-size="${size * 0.046875}">¥</text>
  
  <!-- Buttons -->
  <circle cx="${size * 0.3515625}" cy="${size * 0.46875}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.46875}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  <circle cx="${size * 0.6484375}" cy="${size * 0.46875}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  
  <circle cx="${size * 0.3515625}" cy="${size * 0.56640625}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.56640625}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  <circle cx="${size * 0.6484375}" cy="${size * 0.56640625}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  
  <circle cx="${size * 0.3515625}" cy="${size * 0.6640625}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.6640625}" r="${size * 0.0390625}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="${size * 0.00390625}"/>
  <circle cx="${size * 0.6484375}" cy="${size * 0.6640625}" r="${size * 0.0390625}" fill="#10b981" stroke="#059669" stroke-width="${size * 0.00390625}"/>
</svg>`;

// アイコンディレクトリが存在しない場合は作成
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 各サイズのSVGファイルを生成
sizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Generated ${filename}`);
});

console.log('PWAアイコンの生成が完了しました！');
console.log('注意: これは開発用の簡易アイコンです。本番環境では適切にデザインされたアイコンを使用してください。');
