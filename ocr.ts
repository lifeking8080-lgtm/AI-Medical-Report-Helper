let tesseractLoaded = false;
let tesseractLoading = false;

export async function loadTesseract(): Promise<void> {
  if (tesseractLoaded) return;
  if (tesseractLoading) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (tesseractLoaded) {
          clearInterval(check);
          resolve(undefined);
        }
      }, 100);
    });
    return;
  }

  tesseractLoading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = () => {
      tesseractLoaded = true;
      tesseractLoading = false;
      resolve();
    };
    script.onerror = () => {
      tesseractLoading = false;
      reject(new Error("Failed to load Tesseract.js"));
    };
    document.head.appendChild(script);
  });
}

export async function performOCR(imageFile: File): Promise<string> {
  await loadTesseract();

  const Tesseract = (window as any).Tesseract;
  if (!Tesseract) {
    throw new Error("Tesseract not loaded");
  }

  const result = await Tesseract.recognize(imageFile, "eng", {
    logger: (m: any) => console.log(m),
  });

  return result.data.text;
}