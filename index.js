const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const { mongodbUrl, host, port } = require("./config")
const routes = require("./src/routes")

mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to database")
  })
  .catch((err) => {
    console.log("Could not connect to database. Getting error ...")
    console.error(err)
    process.exit()
  })

app.use(cors())

// parsing application/json & application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use("/", routes)

app.listen(port, (host !== undefined && host) || "localhost", () =>
  console.log("Server Running at " + (host && `${host}:${port}` || `port ${port}`))
)
