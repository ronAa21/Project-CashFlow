import express from "express";
import project from "./routes/project_s.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();

dotenv.config();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:4001',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.use("/manager", express.static(path.join(__dirname, "../manager_side")));
app.use("/customer", express.static(path.join(__dirname, "../customer_side")));
app.use("/", express.static(path.join(__dirname, "../logging_page")));

app.use("/project", project);

app.use((req, res) => res.status(404).send("404 Not Found"));

app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.PORT}\nWelcome ${process.env.USER}`);
});
