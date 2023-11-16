const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder where files will be stored
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    // Set the file name to be the original name of the file
    cb(null, file.originalname);
  },
});

// Create Multer instance with the configured storage
const upload = multer({ storage: storage });

// Set up a route for file uploads
app.post('/upload', upload.array('files'), (req, res) => {
  // 'files' should match the name attribute in your HTML form for file input
  req.files.forEach((f) => {
    fs.renameSync(`${f.path}`, `public/uploads/${f.originalname}`);
  });

  // Files are uploaded, you can perform additional actions here if needed
  res.send('Files uploaded successfully!');
});

// Set up a simple route to serve an HTML form for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
