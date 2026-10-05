import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function loadPdfDocument(fileOrBlob) {
  let arrayBuffer;
  if (fileOrBlob instanceof ArrayBuffer) {
    arrayBuffer = fileOrBlob;
  } else if (fileOrBlob instanceof Blob || fileOrBlob instanceof File) {
    arrayBuffer = await fileOrBlob.arrayBuffer();
  } else {
    throw new Error('Unsupported document format');
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  return pdfDoc;
}

export async function renderPdfPageToCanvas(pdfDoc, pageNumber = 1, scale = 1.5) {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    ptWidth: unscaledViewport.width,
    ptHeight: unscaledViewport.height,
    scale,
  };
}

export async function renderImageToCanvas(imageSource, targetPtWidth = 595.28) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl = null;

    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const ptWidth = targetPtWidth;
      const ptHeight = targetPtWidth * aspectRatio;
      const scale = img.width / ptWidth;

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      if (objectUrl) URL.revokeObjectURL(objectUrl);

      resolve({
        canvas,
        width: canvas.width,
        height: canvas.height,
        ptWidth,
        ptHeight,
        scale,
      });
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image: ' + err));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrl = URL.createObjectURL(imageSource);
      img.src = objectUrl;
    }
  });
}
