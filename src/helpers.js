const { TokenExpiredError } = require("jsonwebtoken")

const errorResponse = (res, code, error) => {
  console.error(error)
  return res
    .status(code)
    .json({ success: false, message: error?.message || "Server Error" })
}

exports.catchError = (res, error) => {
  console.error(error)
  if (error instanceof TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token Expired",
      error: "Unauthorized",
    })
  }

  return res.status(500).json({ success: false, message: error.message, error })
}

/**
 *
 * @param {Response} res
 * @param {HttpCode} code
 * @param {object} data
 * @param {string} message
 * @returns
 */
exports.successResponse = (res, code, data, message) => {
  return res.status(code).json({ success: true, data, message })
}

exports.errorResponse = errorResponse
