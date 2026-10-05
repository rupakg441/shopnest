import cloudinary from '../config/cloudinary.js';

const imageMimeFromBuffer = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp' && /^(avif|avis|mif1)$/.test(buffer.toString('ascii', 8, 12))) return 'image/avif';
  return null;
};

const uploadBuffer = (buffer, folder) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    { folder: `shopnest/${folder}`, resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'] },
    (error, result) => error ? reject(error) : resolve(result),
  ).end(buffer);
});

export const uploadImages = async (files, folder) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw Object.assign(new Error('Cloudinary image storage is not configured.'), { statusCode: 503 });
  }
  const uploaded = [];
  try {
    for (const file of files) {
      if (imageMimeFromBuffer(file.buffer) !== file.mimetype) {
        throw Object.assign(new Error('The uploaded file contents do not match a supported image type.'), { statusCode: 415 });
      }
      const result = await uploadBuffer(file.buffer, folder);
      uploaded.push({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
    }
    return uploaded;
  } catch (error) {
    await Promise.allSettled(uploaded.map(({ publicId }) => cloudinary.uploader.destroy(publicId)));
    throw error;
  }
};
