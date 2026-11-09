// Cross-platform file picker and download helper for Smart Bharat Document Wallet

export interface PickedFile {
  name: string;
  mimeType: string;
  size: number;
  base64Data: string;
  previewUri?: string;
}

export const pickDocumentFile = (): Promise<PickedFile> => {
  return new Promise((resolve, reject) => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,image/png,image/jpeg,image/jpg';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        // Validate 10MB limit
        if (file.size > 10 * 1024 * 1024) {
          reject(new Error('File size exceeds the 10MB limit. Please choose a smaller file.'));
          return;
        }

        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        const mime = (file.type || '').toLowerCase();
        const extension = file.name.split('.').pop()?.toLowerCase();

        const isValid =
          validTypes.includes(mime) ||
          extension === 'pdf' ||
          extension === 'png' ||
          extension === 'jpg' ||
          extension === 'jpeg';

        if (!isValid) {
          reject(new Error('Unsupported file format. Please upload PDF, JPG, or PNG files only.'));
          return;
        }

        const resolvedMime = mime || (extension === 'pdf' ? 'application/pdf' : 'image/png');

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1] || result;
          resolve({
            name: file.name,
            mimeType: resolvedMime,
            size: file.size,
            base64Data,
            previewUri: resolvedMime.startsWith('image/') ? result : undefined,
          });
        };
        reader.onerror = () => reject(new Error('Failed to read file from your device.'));
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      reject(new Error('File picker is only available in interactive environments.'));
    }
  });
};

export const downloadFileToDevice = (filename: string, mimeType: string, base64Data: string) => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const linkSource = `data:${mimeType};base64,${base64Data}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
};

