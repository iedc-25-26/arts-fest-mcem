import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const CSV_FILE = join(__dirname, 'src', 'data', 'students.csv');

app.post('/login', (req, res) => {
  const { admissionNumber } = req.body;

  if (!admissionNumber) {
    return res.status(400).json({ success: false, message: 'Admission number is required' });
  }

  let found = false;
  let studentName = "";
  const target = admissionNumber.trim();

  // If CSV header has spaces or specific format, we need to handle it.
  // Based on check: "SL NO,ADMN NO,..." -> key is "ADMN NO"

  console.log(`Attempting login with ADMN NO: '${target}'`);

  fs.createReadStream(CSV_FILE)
    .pipe(csv({
      skipLines: 4,
      mapHeaders: ({ header }) => header.trim()
    }))
    .on('headers', (headers) => {
      console.log('CSV Headers:', headers);
    })
    .on('data', (row) => {
      // console.log('Checking row:', row['ADMN NO']);
      if (row['ADMN NO'] === target) {
        found = true;
        studentName = row['NAME OF STUDENT'];
        console.log(`Found student: ${studentName}`);
      }
    })
    .on('end', () => {
      if (found) {
        res.json({ success: true, message: 'Login Successful', studentName });
      } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials' });
      }
    })
    .on('error', (err) => {
      console.error("Error reading CSV:", err);
      res.status(500).json({ success: false, message: 'Server error could not verify credentials' });
    });
});

app.post('/validate-admission', (req, res) => {
  const { admissionNumbers } = req.body; // Expects an array of admission numbers

  if (!admissionNumbers || !Array.isArray(admissionNumbers) || admissionNumbers.length === 0) {
    return res.status(400).json({ success: false, message: 'Valid admission numbers array required' });
  }

  const targets = admissionNumbers.map(a => a.toString().trim());
  const found = new Set();
  const notFound = [];

  console.log(`Validating admission numbers: ${targets.join(', ')}`);

  fs.createReadStream(CSV_FILE)
    .pipe(csv({
      skipLines: 4,
      mapHeaders: ({ header }) => header.trim()
    }))
    .on('data', (row) => {
      if (targets.includes(row['ADMN NO'])) {
        found.add(row['ADMN NO']);
      }
    })
    .on('end', () => {
      // Check which ones were not found
      targets.forEach(t => {
        if (!found.has(t)) {
          notFound.push(t);
        }
      });

      if (notFound.length === 0) {
        // Collect details of found students
        const studentDetails = {};
        fs.createReadStream(CSV_FILE)
          .pipe(csv({
            skipLines: 4,
            mapHeaders: ({ header }) => header.trim()
          }))
          .on('headers', (headers) => {
            console.log('DEBUG: Validation CSV Headers:', headers);
          })
          .on('data', (row) => {
            const rowAdmNo = row['ADMN NO'] ? row['ADMN NO'].trim() : "";
            if (targets.includes(rowAdmNo)) {
              console.log(`DEBUG: Found details for ${rowAdmNo}:`, row);
              studentDetails[rowAdmNo] = {
                name: row['NAME OF STUDENT'],
                semester: row['SEMESTER'] ? row['SEMESTER'].trim() : "N/A",
                branch: row['BRANCH'] ? row['BRANCH'].trim() : "N/A"
              };
            }
          })
          .on('end', () => {
            res.json({
              success: true,
              message: 'All admission numbers are valid',
              studentDetails
            });
          });
      } else {
        res.json({ success: false, message: `Invalid admission number(s): ${notFound.join(', ')}`, invalidNumbers: notFound });
      }
    })
    .on('error', (err) => {
      console.error("Error reading CSV:", err);
      res.status(500).json({ success: false, message: 'Server error could not verify credentials' });
    });
});

app.get('/', (req, res) => {
  res.send("Arts Fest API Running");
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`Auth server running at http://localhost:${port}`);
    console.log("Server updated: Branch and Semester support enabled.");
  });
}

export default app;
