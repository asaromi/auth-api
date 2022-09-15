const mongoose = require("mongoose")
const { USER_ROLE } = require("./constant")

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        unique: true,
      },
      refreshToken: {
        type: String,
        unique: true,
      },
      role: {
        type: String,
        enum: Object.values(USER_ROLE),
        default: "user",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )
)

module.exports = { User }
