import { useEffect, useRef, useState } from 'react';

/* Photo for a report: take a picture or upload one. Works on phones and computers.
   - Phones/tablets: "Take photo" opens the device camera (the `capture` file input).
   - Computers: "Take photo" opens a webcam window (getUserMedia; needs https or localhost).
   - "Upload photo" opens the normal file picker everywhere.
   Photos are shrunk (max 1280px, JPEG) before saving so they fit in browser storage.
   TODO backend: upload the original file to your server/storage instead of keeping a data URL. */

const MAX_SIDE = 1280;
const QUALITY = 0.72;

/* Draw an image/video frame onto a canvas at a sensible size and return a JPEG data URL */
function toDataUrl(source, w, h) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}

async function compressFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG or PNG).');
  if (window.createImageBitmap) {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); // keeps phone photos upright
    const url = toDataUrl(bmp, bmp.width, bmp.height);
    bmp.close?.();
    return url;
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Couldn’t read that image. Try a JPG or PNG.'));
      i.src = objectUrl;
    });
    return toDataUrl(img, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/* ---------- Webcam window (computers) ---------- */
function CameraModal({ onCapture, onClose, onError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => setReady(true)).catch(() => {});
      })
      .catch(() => {
        onError('Couldn’t open the camera. Allow camera access in your browser, or use Upload photo.');
        onClose();
      });
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', onKey);
      streamRef.current?.getTracks().forEach((t) => t.stop()); // turn the camera light off
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function snap() {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    onCapture(toDataUrl(v, v.videoWidth, v.videoHeight));
    onClose();
  }

  return (
    <div className="cam" role="dialog" aria-modal="true" aria-label="Take a photo">
      <div className="cam__box">
        <video ref={videoRef} className="cam__video" playsInline muted />
        <div className="cam__actions">
          <button type="button" className="cmap__btn cam__cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="cmap__btn cmap__btn--primary" onClick={snap} disabled={!ready}>
            {ready ? 'Capture' : 'Starting camera…'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- The form field ---------- */
export default function PhotoField({ value, onChange, error }) {
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);
  const [camOpen, setCamOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function picked(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // so picking the same file again still triggers
    if (!file) return;
    setMsg('');
    setBusy(true);
    try {
      onChange(await compressFile(file));
    } catch (err) {
      setMsg(err.message || 'Couldn’t read that image. Try a JPG or PNG.');
    }
    setBusy(false);
  }

  function takePhoto() {
    setMsg('');
    const phone = window.matchMedia('(pointer: coarse)').matches;
    if (phone) cameraRef.current.click(); // opens the device camera app
    else if (navigator.mediaDevices?.getUserMedia) setCamOpen(true); // webcam window
    else uploadRef.current.click(); // no camera support: fall back to picking a file
  }

  return (
    <div className="rfield rphoto">
      <span className="auth-label">Photo <span className="rphoto__opt">(optional)</span></span>

      <div className={`rphoto__box ${error ? 'rphoto__box--invalid' : ''}`.trim()}>
        {value ? (
          <img src={value} alt="Photo of the incident" className="rphoto__img" />
        ) : (
          <p className="rphoto__empty">{busy ? 'Processing photo…' : 'Add a photo of the incident'}</p>
        )}
      </div>

      <div className="rphoto__actions">
        <button type="button" className="cmap__btn cmap__btn--primary" onClick={takePhoto} disabled={busy}>
          {value ? 'Retake photo' : 'Take photo'}
        </button>
        <button type="button" className="cmap__btn" onClick={() => uploadRef.current.click()} disabled={busy}>
          {value ? 'Choose another' : 'Upload photo'}
        </button>
        {value && (
          <button type="button" className="cmap__btn" onClick={() => { onChange(''); setMsg(''); }}>Remove</button>
        )}
      </div>

      {(msg || error) && <p className="rerr">{msg || error}</p>}

      <input ref={uploadRef} type="file" accept="image/*" hidden onChange={picked} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={picked} />

      {camOpen && <CameraModal onCapture={onChange} onClose={() => setCamOpen(false)} onError={setMsg} />}
    </div>
  );
}