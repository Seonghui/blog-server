const express = require("express");
const bodyParser = require("body-parser");

const postsRoutes = require("./routes/posts-routes");

const app = express();

app.use(postsRoutes);

app.listen(6000);
