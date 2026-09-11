// 由 miku_banner_src.png（2098x750）重新裁切番茄钟横幅。
// 构图目标：主体初音的面部落在画面中偏右位置，左侧留出深水做文字区。
const sharp = require('C:/Users/xtt20/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/sharp');
const DIR = 'C:/Users/xtt20/Downloads/文学史资料网页版/_shared/miku/';
const SRC = DIR + 'miku_banner_src.png';

// 源图中主体面部大致范围（肉眼测量）：中心约 x=1480, y=430
const FACE_X = 1480, FACE_Y = 430;

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log('源图: ' + meta.width + 'x' + meta.height);

  const W = 1600, H = 640;           // 2.5:1，与 .miku-strip 容器比例接近
  const ar = W / H;

  // 先按容器比例取一个尽量大的窗口，再平移到包含面部的区域
  let cw = meta.width, ch = Math.round(cw / ar);
  if (ch > meta.height) { ch = meta.height; cw = Math.round(ch * ar); }

  // 让面部水平落在窗口的 58% 处（右侧主视觉），垂直落在 62% 处
  let left = Math.round(FACE_X - cw * 0.58);
  let top = Math.round(FACE_Y - ch * 0.62);

  // 夹取到合法范围
  left = Math.max(0, Math.min(meta.width - cw, left));
  top = Math.max(0, Math.min(meta.height - ch, top));

  console.log('裁剪窗口: ' + cw + 'x' + ch + ' @ ' + left + ',' + top);

  await sharp(SRC)
    .extract({ left, top, width: cw, height: ch })
    .resize(W, H, { fit: 'cover' })
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(DIR + 'miku_banner.jpg');
  console.log('banner ok -> ' + W + 'x' + H);

  // 移动端竖版：下方主体区域，比例更方一些
  await sharp(SRC)
    .extract({ left: 980, top: 40, width: 1118, height: 710 })
    .resize(900, 620, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(DIR + 'miku_banner_m.jpg');
  console.log('banner_m ok');
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
