// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Enable CORS
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

// Initialize Firebase Admin SDK (runs with full privileges)
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();
// Use the correct bucket name confirmed by the user.
const bucket = storage.bucket("systemicshiftv2.firebasestorage.app"); 

exports.submitStory = functions.https.onRequest((req, res) => {
  // Use CORS middleware
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir(); // Temporary directory for file processing

    // This object will accumulate all the fields, complex objects included
    let formData = {};
    let fileWrites = []; // Promises for file uploads

    // Process fields (text data)
    busboy.on("field", (fieldname, val) => {
      console.log(`Processed field ${fieldname}: ${val}.`);
      // Handle arrays (like keyShifts, focusAreas, desiredMindset)
      if (fieldname.endsWith("[]")) {
         const realName = fieldname.replace("[]", "");
         if (formData[realName]) {
             formData[realName].push(val);
         } else {
             formData[realName] = [val];
         }
      } else if (fieldname === 'acknowledgement') {
         formData[fieldname] = (val === 'true'); // Convert string to boolean
      } else {
         formData[fieldname] = val;
      }
    });

    // Process files
    busboy.on("file", (fieldname, file, filenameDetails) => {
      const { filename, encoding, mimeType } = filenameDetails;
      console.log(
        `Processed file ${filename} (${fieldname}) [${encoding} / ${mimeType}]`
      );
      const filepath = path.join(tmpdir, filename);
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);

      // File was processed by Busboy; wait for it to be written to disk.
      const promise = new Promise((resolve, reject) => {
        file.on("end", () => {
          writeStream.end();
        });
        writeStream.on("finish", async () => {
          const uniqueFilename = `${Date.now()}_${filename}`;
          const destination = fieldname === 'writeUp' ? `writeUps/${uniqueFilename}` : `visuals/${uniqueFilename}`;

          try {
            const [uploadedFile] = await bucket.upload(filepath, {
              destination: destination,
              metadata: {
                contentType: mimeType,
              },
            });
            fs.unlinkSync(filepath); // Delete the temporary file

            // Make the file public (alternative: generate signed URLs if privacy is needed)
            await uploadedFile.makePublic();
            const publicUrl = uploadedFile.publicUrl();

            resolve({ fieldname, url: publicUrl }); // Resolve with fieldname and URL
          } catch (error) {
             console.error("Storage Upload Error:", error);
             fs.unlinkSync(filepath); // Clean up temp file on error
             reject(error);
          }
        });
         writeStream.on("error", reject);
      });
      fileWrites.push(promise);
    });

    // Triggered once all uploaded files are processed by Busboy.
    busboy.on("finish", async () => {
      try {
        const fileResults = await Promise.all(fileWrites);

        // Add file URLs to formData
        let writeUpURL = '';
        let visualURLs = [];
        fileResults.forEach(result => {
            if (result.fieldname === 'writeUp') {
                writeUpURL = result.url;
            } else if (result.fieldname === 'visuals') {
                visualURLs.push(result.url);
            }
        });

        // Prepare data for Firestore (merge text fields and file URLs)
        const submissionData = {
          ...formData, // Spread collected text fields
          writeUpURL: writeUpURL,
          visualURLs: visualURLs,
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Clean up array fields if they were not sent
        ['keyShifts', 'focusAreas', 'desiredMindset'].forEach(field => {
            if (!submissionData[field]) {
                submissionData[field] = [];
            }
        });
         if (submissionData.alignsWithShifts === 'null') {
            submissionData.alignsWithShifts = null;
        }


        // Save to Firestore
        await db.collection("stories").add(submissionData);

        res.status(200).send({ message: "Story submitted successfully!" });
      } catch (err) {
        console.error("Firestore/Storage Error:", err);
        res.status(500).send({ error: "Failed to process submission." });
      }
    });

    // Pass the request stream to Busboy
    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  });
});