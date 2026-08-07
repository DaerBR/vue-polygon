export const getBase64OfFile = (file: File): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split('base64,')[1]!);
    reader.onerror = (error) => reject(error);
  });
