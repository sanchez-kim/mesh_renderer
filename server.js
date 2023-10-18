const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 8000;

app.use(cors());

// Serve static files
// app.use("/omotion", express.static("../omotion/3D_data/Model1/Sentence009"));
app.use("/omotion", express.static("../omotion/3D_data/Model1/Sentence009"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
