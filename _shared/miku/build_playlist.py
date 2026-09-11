# -*- coding: utf-8 -*-
"""拉取网易云歌单 8748108052 的曲目信息 + 检测外链可播性，输出 playlist.js"""
import json, os, sys, time
import urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(os.path.dirname(BASE)), 'pl.json')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
HDR = {'User-Agent': UA, 'Referer': 'https://music.163.com/'}

pl = json.load(open(SRC, encoding='utf-8'))['playlist']
ids = [t['id'] for t in pl['trackIds']]
print('playlist:', pl['name'], 'count:', len(ids))

songs = {}
for i in range(0, len(ids), 40):
    chunk = ids[i:i+40]
    c = json.dumps([{'id': x} for x in chunk], separators=(',', ':'))
    url = 'https://music.163.com/api/v3/song/detail?' + urllib.parse.urlencode({'c': c})
    req = urllib.request.Request(url, headers=HDR)
    for attempt in range(3):
        try:
            data = json.loads(urllib.request.urlopen(req, timeout=25).read().decode('utf-8'))
            break
        except Exception as e:
            print('retry', i, e); time.sleep(1.5)
    else:
        continue
    for s in data.get('songs', []):
        songs[s['id']] = s
    print('fetched', i + len(chunk), '/', len(ids))

def playable(sid):
    url = 'https://music.163.com/song/media/outer/url?id=%d.mp3' % sid
    req = urllib.request.Request(url, headers=dict(HDR, Range='bytes=0-1023'))
    try:
        r = urllib.request.urlopen(req, timeout=20)
        ct = r.headers.get('Content-Type', '')
        code = r.getcode()
        r.read(512)
        r.close()
        return sid, (code in (200, 206) and 'audio' in ct)
    except Exception as e:
        return sid, False

tracks = []
with ThreadPoolExecutor(max_workers=10) as ex:
    ok = dict(ex.map(playable, ids))
print('playable:', sum(1 for v in ok.values() if v), '/', len(ids))

for sid in ids:
    s = songs.get(sid)
    if not s:
        continue
    ar = s.get('ar') or []
    al = s.get('al') or {}
    tracks.append({
        'id': sid,
        'name': s.get('name', ''),
        'artist': '/'.join(a.get('name', '') for a in ar) if ar else '',
        'album': al.get('name', ''),
        'pic': al.get('picUrl', '') or '',
        'dt': int(s.get('dt') or 0),
        'fee': s.get('fee', 0),
        'ok': bool(ok.get(sid)),
    })

out = {
    'id': pl['id'],
    'name': pl['name'],
    'cover': pl.get('coverImgUrl', ''),
    'tracks': tracks,
}

js = os.path.join(BASE, 'playlist.js')
body = 'window.MIKU_PLAYLIST=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(js, 'w', encoding='utf-8').write(body)
print('wrote', js, len(body), 'bytes,', len(tracks), 'tracks')
