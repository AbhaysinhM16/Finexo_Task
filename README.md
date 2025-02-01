# Excel Data Importer

This project provides a frontend and backend solution for importing Excel files, validating their content, previewing the data, and importing valid records into a MongoDB database. The frontend is built using React.js and Tailwind CSS, while the backend utilizes Node.js with Express.js for API development and MongoDB for data storage.

## Features

### Frontend
1. **File Upload**
   - Drag-and-drop file upload with fallback input button.
   - Only accepts `.xlsx` files with a maximum size of 2 MB.
   
2. **Error Display**
   - Displays validation errors in a modal dialog, including row number and error description.
   - Multiple sheets in the file are handled in separate tabs, showing errors for each sheet.

3. **Data Preview**
   - Dropdown to select sheets from the uploaded file.
   - Paginated table for displaying sheet data.
   - Date values are formatted to DD-MM-YYYY format.
   - Numeric values are formatted according to the Indian number system.
   - Option to delete rows with user confirmation before deletion.

4. **Data Import**
   - Import all valid rows into the database.
   - Skipped rows due to validation errors are highlighted.
   - Success message on successful import.

### Backend
1. **File Validation**
   - Validates the uploaded `.xlsx` file using libraries like `xlsx` or `exceljs`.
   - Ensures the presence of required columns: **Name**, **Amount**, **Date**, and **Verified**.
   - Ensures that:
     - Date is valid and within the current month.
     - Amount is numeric and greater than zero.
   
2. **Flexible Configuration**
   - Backend supports future extensions for varying sheets and columns, based on a configuration file.
   - Configurable validation rules for different sheets to handle different column types, date ranges, and required fields.

3. **Database Interaction**
   - Data is imported into MongoDB Atlas (free tier).
   - Optimized for efficient handling of thousands of rows.

## Tech Stack

- **Frontend:**
  - React.js
  - Tailwind CSS
  - DataTable (for displaying paginated data)
  - Select2 (for dropdown selection)
  
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB (MongoDB Atlas)
  - Mongoose (for MongoDB interactions)
  - xlsx or exceljs (for reading and validating Excel files)

## Installation

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (>=14.x)
- npm or yarn
- MongoDB Atlas account (for cloud database)

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/Finexo_Task.git
   cd your_directory_name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables for MongoDB connection:
   Create a `.env` file with the following content:
   ```plaintext
   MONGO_URI=<your_mongodb_connection_string>
   PORT=<port_no>
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### MongoDB Setup

1. Create a free-tier MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database and connect it to the backend using the connection string in your `.env` file.

## Usage

1. Open the frontend application in your browser.
2. Drag and drop an Excel file (only `.xlsx` format) or use the fallback file input button.
3. Select the appropriate sheet from the dropdown list to preview the data.
4. The table will display the data with pagination, with dates and numbers formatted as per the requirements.
5. Delete rows if needed by clicking the delete icon next to the row.
6. After reviewing the data, click the "Import" button to import the valid rows into the database.
7. If there are validation errors, they will be shown in a modal dialog, along with the sheet name, row number, and error description.


