import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed image extensions and MIME types
const ALLOWED_MIMES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Configure storage with sanitized unique filenames and canonical extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_MIMES.get(file.mimetype) || (ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.jpg');
    const cleanBase = path
      .basename(file.originalname, rawExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${safeExt}`);
  },
});

// File filter: strict dual validation on both MIME type and file extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = ALLOWED_MIMES.has(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Security Policy: Only verified image formats (JPEG, PNG, WEBP) are permitted. SVG, HTML, and script extensions are disallowed.'
      ),
      false
    );
  }
};

export const uploadPhotos = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file safe limit
  },
  fileFilter,
});

export default uploadPhotos;
