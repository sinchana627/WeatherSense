
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PROFILE_PATH = path.join(__dirname, 'userProfile.json');
const PHOTO_DIR = path.join(__dirname, '../client/public/profile_photos');

if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PHOTO_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

function readProfile() {
  if (!fs.existsSync(PROFILE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function writeProfile(profile) {
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
}

// Save profile (with photo upload)
router.post('/save', upload.single('photo'), (req, res) => {
  const { name, email, city } = req.body;
  if (!name || !email || !city) return res.status(400).json({ error: 'All fields required.' });
  let photoUrl = '';
  if (req.file) {
    photoUrl = `/profile_photos/${req.file.filename}`;
  } else {
    const existing = readProfile();
    if (existing && existing.photo) photoUrl = existing.photo;
  }
  const profile = { name, email, city, photo: photoUrl };
  writeProfile(profile);
  res.json(profile);
});

// Delete profile
router.post('/delete', (req, res) => {
  if (fs.existsSync(PROFILE_PATH)) {
    // Optionally delete photo file
    try {
      const profile = readProfile();
      if (profile && profile.photo) {
        const photoPath = path.join(PHOTO_DIR, path.basename(profile.photo));
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
    } catch {}
    fs.unlinkSync(PROFILE_PATH);
  }
  res.json({ success: true });
});

// Get profile
router.get('/', (req, res) => {
  const profile = readProfile();
  if (!profile) return res.status(404).json({ error: 'No profile found.' });
  res.json(profile);
});

module.exports = router;
