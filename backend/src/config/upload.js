import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, '..', '..');

// Ensure upload directories exist
const uploadDirs = [
    'uploads/members',
    'uploads/gallery',
    'uploads/events',
    'uploads/news',
    'uploads/plans'
];

uploadDirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/';
        if (file.fieldname === 'photo' || file.fieldname === 'profile_image') {
            folder += 'members/';
        } else if (file.fieldname === 'gallery_image') {
            folder += 'gallery/';
        } else if (file.fieldname === 'event_image') {
            folder += 'events/';
        } else if (file.fieldname === 'news_image') {
            folder += 'news/';
        } else if (file.fieldname === 'attachment' || file.fieldname === 'coop_attachment') {
            folder += 'plans/';
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|mp4|avi|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, documents, and videos are allowed'));
    }
};

// Create multer instances
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: fileFilter
});

const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: fileFilter
}).array('images', 10);

const uploadSingle = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: fileFilter
}).single('image');

const uploadDocument = upload.single('attachment');

export { 
    upload, 
    uploadMultiple, 
    uploadSingle, 
    uploadDocument 
};

export default {
    upload,
    uploadMultiple,
    uploadSingle,
    uploadDocument
};