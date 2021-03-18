const express = require("express");
const config = require("./config");
const app = express();
const PORT = config.PORT;
app.get("*", (req, res) =>  res.send("Test"));
app.listen(PORT, () => console.log(`Listning to ${PORT}`));
