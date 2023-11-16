const express = require("express");
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
var app = express();
app.use(cors()); // Allows incoming requests from any IP

app.set("view engine", "ejs")
//app.use(express.static("public"));
//app.use('/uploads',express.static('uploads'));

// Keep track of uploaded filenames
let uploadedFiles = [];

// Start by creating some disk storage options:
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const uploadPath = path.join(__dirname, '/uploads');
        callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
        const filename = file.originalname;

        // Check if the file already exists
        if (uploadedFiles.includes(filename)) {
            callback(new Error("File already exists"), null);
        } else {
            uploadedFiles.push(filename); // Add filename to the list
            callback(null, filename);
        }
    }
});


app.get("/download-file", (req, res) => {
    const filePath = path.join(__dirname, 'docs', 'RAAJALAKSHUMI_K_oncampas.pdf');
    res.download(filePath);
});




// Set saved storage options:
const upload = multer({ storage: storage });
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get("/uploaded-files", (req, res) => {
    res.json({ uploadedFiles });
});

// Delete a file
app.delete('/delete-file/:filename', (req, res) => {
    const filenameToDelete = req.params.filename;
    const filePath = __dirname + '/uploads/' + filenameToDelete;

    // Check if the file exists
    if (uploadedFiles.includes(filenameToDelete) && fs.existsSync(filePath)) {
        // Delete the file
        fs.unlinkSync(filePath);
        // Remove the filename from the uploadedFiles array
        uploadedFiles = uploadedFiles.filter(filename => filename !== filenameToDelete);
        res.json({ message: "File deleted successfully" });
    } else {
        res.status(404).json({ message: "File not found or could not be deleted" });
    }
});

// ... (your existing code)

app.post("/api", upload.array("files"), (req, res) => {
    console.log(req.body); // Logs form body values
    console.log(req.files); // Logs any files

    // Check for errors during upload
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }

    const uploadedFiles = req.files.map(file => file.originalname);

    // Inject success message and file list into the HTML
    const successMessage = "File(s) uploaded successfully";
    const fileListHTML = uploadedFiles.map(file => `<li>${file}</li>`).join("");
    const script = `<script>
                        document.getElementById('message').innerText = '${successMessage}';
                        document.getElementById('fileList').innerHTML = '<ul>${fileListHTML}</ul>';
                    </script>`;

    res.json({ message: successMessage, uploadedFiles, script });
});

// ... (your existing code)

app.listen(5000, function () {
    console.log("Server running on port 5000");
});