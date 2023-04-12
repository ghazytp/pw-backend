if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 3000;
const { Project } = require("./models");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const multerFileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    cb(null, false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: multerFileFilter });

app.post("/upload-pdf", upload.single("pdf"), (req, res) => {
  if(!req.file) throw {name: 'INVALID_FILE'}
  res.send({message: 'File Uploaded !'});
});

app.get('/download-pdf', (req, res) => {
  const file = `${__dirname}/uploads/Ghazy_Prihanda_Resume.pdf`;
  res.download(file, {message: 'hello'});
});

app.get("/", async (req, res, next) => {
  try {
    const project = await Project.findAll();

    res.json(project);
  } catch (err) {
    next(err);
  }
});

app.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw { name: "INVALID_ID" };
    }

    const findProject = await Project.findByPk(id);

    if (!findProject) {
      throw { name: "NOT_FOUND" };
    }

    res.status(200).json({ findProject });
  } catch (err) {
    next(err);
  }
});

app.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw { name: "INVALID_ID" };
    }

    const findProject = await Project.findByPk(id);

    if (!findProject) {
      throw { name: "NOT_FOUND" };
    }

    await Project.destroy({ where: { id } });

    res
      .status(200)
      .json({ message: `Project ${findProject.title} has been deleted` });
  } catch (err) {
    next(err);
  }
});

app.post("/", async (req, res, next) => {
  try {
    const { title, description, imgUrl, year, category, stringUrl } = req.body;

    if (!title || !stringUrl) {
      throw { name: "BAD_REQUEST_DATA" };
    }

    const newProject = await Project.create({
      title,
      description,
      imgUrl,
      category,
      year,
      stringUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.json(newProject);
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  res.status(404).json({ message: "PAGE NOT FOUND", status: 404 });
});

app.use(async (err, req, res, next) => {
  console.log(err.name);
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err.name == "INVALID_ID" || err.name == "INVALID_FILE") {
    statusCode = 400;
    message = "INVALID ID CHARACTERS";
  }

  if (err.name == "NOT_FOUND") {
    statusCode = 404;
    message = "DATA NOT FOUND";
  }

  if (err.name == "BAD_REQUEST_DATA") {
    statusCode = 400;
    message = "INVALID DATA INPUT";
  }

  res.status(statusCode).json({ message });
});

app.listen(port, () => {
  console.log(`Server Running on http://localhost:${port}`);
});
