# -*- coding: utf-8 -*-
"""광고 이미지를 공개 URL로 올린다 (메타 광고 만들 때 image_url로 사용).
사용법: python scripts/upload_image.py 이미지.png [이미지2.png ...]
PNG는 JPG로 바꿔서 catbox.moe에 올리고 URL을 출력한다. (광고에 쓸 공개 이미지만 올릴 것)
"""
import os, sys, urllib.request, uuid
from PIL import Image

def upload(path):
    jpg = os.path.splitext(path)[0] + ".jpg"
    Image.open(path).convert("RGB").save(jpg, quality=93)
    boundary = uuid.uuid4().hex
    data = open(jpg, "rb").read()
    body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"reqtype\"\r\n\r\nfileupload\r\n"
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"fileToUpload\"; filename=\"{os.path.basename(jpg)}\"\r\n"
            f"Content-Type: image/jpeg\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request("https://catbox.moe/user/api.php", data=body,
                                 headers={"Content-Type": f"multipart/form-data; boundary={boundary}",
                                          "User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=120).read().decode().strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for p in sys.argv[1:]:
        print(p, upload(p))
