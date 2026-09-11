const sharp = require('C:/Users/xtt20/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/sharp');
const DIR = 'C:/Users/xtt20/Downloads/文学史资料网页版/_shared/miku/';
const SRC = DIR + 'miku_banner_src.png';

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log('源图: ' + meta.width + 'x' + meta.height);

  // 横幅：保持 2.8:1，输出到 1600 宽（足够 2 倍屏），压成渐进式 JPEG
  await sharp(SRC)
    .resize(1600, 572, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(DIR + 'miku_banner.jpg');
  console.log('banner ok');

  // 移动端竖版：从右侧主体区域裁一个偏方的构图
  await sharp(SRC)
    .extract({ left: 900, top: 0, width: 1198, height: 750 })
    .resize(900, 560, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(DIR + 'miku_banner_m.jpg');
  console.log('banner_m ok');

  // 小徽标 / 图标用方形图：取主人物面部
  await sharp(SRC)
    .extract({ left: 1000, top: 60, width: 620, height: 620 })
    .resize(256, 256, { fit: 'cover' })
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(DIR + 'miku_face.jpg');
  console.log('face ok');
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
