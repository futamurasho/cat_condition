import express from "express";
import apiRoute from "./api-routes/index.mjs";
import env from "dotenv";
env.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("dist"));
app.use(express.json());

//API
app.use("/api", apiRoute);
app.get("*", (req, res) => {
  const pathIndex = path.resolve("dist", "index.html");
  res.sendFile(pathIndex);
});

app.listen(port, function () {
  console.log(`Server Start: http://localhost:${port}`);
});
