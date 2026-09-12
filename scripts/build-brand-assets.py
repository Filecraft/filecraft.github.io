"""Generate original Filecraft presentation assets. No product changes."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)
shape='M10 16 42 4 54 16 22 28Zm12 18 25-9 11 11-25 9ZM10 32l12 12v16L10 48Z'
mark=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Filecraft folded-paper mark"><path fill="#e77550" d="{shape}"/></svg>\n'
(OUT/'filecraft-mark.svg').write_text(mark)
(OUT/'favicon.svg').write_text(mark)
(OUT/'filecraft-banner.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="440" viewBox="0 0 1280 440" role="img" aria-label="Filecraft. Get your files ready to send."><rect width="1280" height="440" rx="20" fill="#faf9f6"/><g transform="translate(65 52) scale(.9)"><path fill="#b54120" d="{shape}"/></g><text x="136" y="97" font-family="Arial,sans-serif" font-size="38" font-weight="600" letter-spacing="-2" fill="#222824">filecraft</text><text x="76" y="213" font-family="Arial,sans-serif" font-size=" sixty" fill="#222824"> </text><g font-family="Arial,sans-serif" fill="#222824" font-size="62" letter-spacing="-3"><text x="76" y="217">Get your files</text><text x="76" y="288">ready to send.</text></g><text x="79" y="362" font-family="Arial,sans-serif" font-size="18" fill="#61655f">Windows · macOS · Linux · Browser</text><g transform="translate(916 55) rotate(12 110 145)"><rect width="218" height="280" rx="4" fill="#d6deca" stroke="#bcc5b0"/></g><g transform="translate(862 83) rotate(-8 110 145)"><rect width="218" height="280" rx="4" fill="#fffdf8" stroke="#cfcec4"/><g transform="translate(26 26) scale(.7)"><path fill="#b54120" d="{shape}"/></g><path d="M28 117h154M28 137h154M28 157h154M28 177h90" stroke="#bdc0b6" stroke-width="2"/><text x="28" y="242" font-family="Georgia,serif" font-size="21" fill="#b54120">Your next copy.</text></g></svg>'''.replace('<text x="76" y="213" font-family="Arial,sans-serif" font-size=" sixty" fill="#222824"> </text>',''))
# Raster mark and social preview use the same vectors and system fonts.
def polygons(d,offset,scale,color):
    for pts in [[(10,16),(42,4),(54,16),(22,28)],[(22,34),(47,25),(58,36),(33,45)],[(10,32),(22,44),(22,60),(10,48)]]:
        d.polygon([(offset[0]+x*scale,offset[1]+y*scale) for x,y in pts],fill=color)
im=Image.new('RGB',(1024,1024),'#171c1b');d=ImageDraw.Draw(im);polygons(d,(128,128),12,'#e77550');im.save(OUT/'filecraft-avatar.png')
im=Image.new('RGB',(1200,630),'#faf9f6');d=ImageDraw.Draw(im)
font='/System/Library/Fonts/Supplemental/Arial.ttf'
f=lambda size:ImageFont.truetype(font,size)
polygons(d,(54,39),1,'#b54120');d.text((124,51),'filecraft',font=f(38),fill='#222824')
d.text((65,185),'Get your files',font=f(79),fill='#222824');d.text((65,280),'ready to send.',font=f(79),fill='#222824')
d.text((71,470),'Windows · macOS · Linux · Browser',font=f(23),fill='#61655f')
d.rounded_rectangle((874,139,1130,496),radius=10,fill='#d6deca');d.rounded_rectangle((824,177,1080,534),radius=5,fill='#fffdf8',outline='#cdcdc1',width=2);polygons(d,(840,197),1.1,'#b54120')
for y in range(317,407,22):d.line((850,y,1043,y),fill='#bbbdaf',width=2)
d.text((850,461),'Your next copy.',font=f(23),fill='#b54120');im.save(OUT/'social-preview.png',optimize=True)
print('Generated SVG mark/banner and PNG avatar/social image')
