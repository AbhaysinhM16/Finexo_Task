// Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Create an Express application
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Establish MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const database = mongoose.connection;
database.on('error', (err) => {
  console.error('MongoDB connection failed:', err);
});
database.once('open', () => {
  console.log('MongoDB is now connected');
});

// Define a schema for storing Excel sheet information
const excelSheetSchema = new mongoose.Schema({
  name: String,
  rows: Array,
});

const Sheet = mongoose.model('Sheet', excelSheetSchema);

// Configure multer for handling file uploads
const fileUpload = multer({ storage: multer.memoryStorage() });

// API to upload and process an Excel file
app.post('/upload', fileUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheets = workbook.SheetNames;

    for (const sheetName of sheets) {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Save each sheet's data to the database
      const sheet = new Sheet({ name: sheetName, rows: data });
      await sheet.save();
    }

    res.status(201).json({ message: 'File processed successfully', sheets });
  } catch (err) {
    console.error('File processing error:', err);
    res.status(500).json({ error: 'Failed to process file', details: err });
  }
});

// API to retrieve data for a specific sheet
app.get('/sheets/:name', async (req, res) => {
  try {
    const sheetName = req.params.name;
    const sheet = await Sheet.findOne({ name: sheetName });

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    res.status(200).json(sheet);
  } catch (err) {
    console.error('Error fetching sheet:', err);
    res.status(500).json({ error: 'Failed to fetch sheet', details: err });
  }
});

// API to modify a specific row in a sheet
app.patch('/sheets/:name/rows/:index', async (req, res) => {
  try {
    const { name, index } = req.params;
    const updatedRow = req.body.row;

    const sheet = await Sheet.findOne({ name });
    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    if (index < 0 || index >= sheet.rows.length) {
      return res.status(400).json({ error: 'Invalid row index' });
    }

    sheet.rows[index] = updatedRow;
    await sheet.save();

    res.status(200).json({ message: 'Row updated successfully' });
  } catch (err) {
    console.error('Error updating row:', err);
    res.status(500).json({ error: 'Failed to update row', details: err });
  }
});

// API to remove a specific row from a sheet
app.delete('/sheets/:name/rows/:index', async (req, res) => {
  try {
    const { name, index } = req.params;

    const sheet = await Sheet.findOne({ name });
    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    if (index < 0 || index >= sheet.rows.length) {
      return res.status(400).json({ error: 'Invalid row index' });
    }

    sheet.rows.splice(index, 1);
    await sheet.save();

    res.status(200).json({ message: 'Row deleted successfully' });
  } catch (err) {
    console.error('Error deleting row:', err);
    res.status(500).json({ error: 'Failed to delete row', details: err });
  }
});

// API to add a new row to a sheet
app.post('/sheets/:name/rows', async (req, res) => {
  try {
    const { name } = req.params;
    const newRow = req.body.row;

    const sheet = await Sheet.findOne({ name });
    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    sheet.rows.push(newRow);
    await sheet.save();

    res.status(201).json({ message: 'Row added successfully' });
  } catch (err) {
    console.error('Error adding row:', err);
    res.status(500).json({ error: 'Failed to add row', details: err });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});