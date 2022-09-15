const {
  verify,
  sign,
  decode: decodeToken,
  TokenExpiredError,
} = require("jsonwebtoken")
const { compareSync, hashSync, genSaltSync } = require("bcrypt")
const { jwtSecret } = require("../config")
const { User } = require("./model")
const { catchError, successResponse, errorResponse } = require("./helpers")
const { USER_ROLE } = require("./constant")

const hashPassword = (password) => hashSync(password, genSaltSync(10))
const comparePassword = (password, hashedPassword) =>
  compareSync(password, hashedPassword)

/**
 *
 * @param {User} user
 * @param {Date} createdToken
 * @returns
 */
const generateToken = (user, createdToken = new Date()) => {
  const { _id, email, role } = user
  const refreshToken = sign({ email }, jwtSecret + "-REFRESH", {
    expiresIn: "30d",
  })
  return {
    refreshToken,
    accessToken: sign({ user: { _id, email, role, createdToken } }, jwtSecret, {
      expiresIn: "1h",
    }),
  }
}

/**
 *
 * @param {object} condition
 * @returns User
 */
const findUserBy = (condition) => User.findOne({ ...condition })

/**
 *
 * @param {object} condition
 * @param {object} data
 * @returns User
 */
const updateUserBy = (condition, data = {}) => User.findOneAndUpdate({ ...condition }, data)

/**
 *
 * @param {object} condition
 * @returns User
 */
const deleteUserBy = (condition) => User.findOneAndDelete({ ...condition })

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]
    if (!token) {
      return errorResponse(res, 400, { message: "Token doesn't exists" })
    }

    verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return catchError(res, err)
      }

      req.user = decoded.user
      next()
    })
  } catch (error) {
    return errorResponse(res, 500)
  }
}

exports.author = (roles) => (req, res, next) => {
  if (roles.indexOf(req.user.role) < 0) {
    return errorResponse(res, 403, "Forbidden : User didn't have permission")
  }

  next()
}

exports.refreshToken = async (req, res) => {
  const token = req.headers["authorization"]
  try {
    if (!token) {
      return errorResponse(res, 400, { message: "Token doesn't exists" })
    }

    const decoded = decodeToken(token, { complete: true })
    console.log("decoded - refreshToken :", decoded.payload)

    const { createdToken, ...userData } = decoded.payload.user
    const user = await findUserBy({ _id: userData._id}).lean()

    if (new Date() > new Date(Date.parse(createdToken))) {
      const { accessToken } = generateToken(user, createdToken)
      return successResponse(res, 200, { ...user, accessToken })
    }
  } catch (error) {
    return errorResponse(res, 500)
  }
}

exports.storeUser = async (req, res) => {
  try {
    const { name, password, email, phoneNumber } = req.body

    let today = new Date()
    today.setHours(23, 59, 99, 99)
    today.setDate(today.getDate() + 30)

    const user = new User({
      name,
      email,
      password: hashPassword(password),
      phoneNumber,
    })

    const { refreshToken } = generateToken(user)
    user.refreshToken = refreshToken
    await user.save()

    return successResponse(res, 201, {
      name, email, refreshToken,
    }, "Success : User Created")
  } catch (error) {
    console.error(error)
    return errorResponse(res, 500, error)
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await findUserBy({ email })

    if (!user) {
      return errorResponse(res, 404, { message: "Not Found : User not found" })
    }

    if (!comparePassword(password, user.password)) {
      return errorResponse(res, 401, {
        message: "Unauthorized : Password didn't match",
      })
    }

    const token = generateToken(user)
    user.refreshToken = token.refreshToken
    await user.save()

    return successResponse(
      res,
      200,
      { name: user.name, email, token },
      "Success Login! Getting User's token"
    )
  } catch (error) {
    return errorResponse(res, 500, error)
  }
}

exports.findUserById = async (req, res) => {
  try {
    const { _id, role } = req.user
    const { id: userId } = req.params

    if (role !== USER_ROLE.ADMIN && _id !== userId) {
      return errorResponse(res, 403, {
        message: "Forbidden : Cannot access other User's Detail",
      })
    }

    const user = await findUserBy({ _id }).lean()

    if (!user) {
      return errorResponse(res, 404, { message: "Not Found : User not found" })
    }

    return successResponse(
      res,
      200,
      user,
      "Success : Getting User's Detail"
    )
  } catch (error) {
    return errorResponse(res, 500, error)
  }
}

exports.updateUserById = async (req, res) => {
  try {
    const { id: _id } = req.params
    const { name, email, role, phoneNumber } = req.body

    const user = await updateUserBy({ _id }, {
      name, email, phoneNumber, role
    })
    console.log("updated :", user)

    return successResponse(
      res,
      201,
      user,
      "Success : Update User"
    )
  } catch (error) {
    return errorResponse(res, 500, error)
  }
}

exports.deleteUserById = async (req, res) => {
  try {
    const { id: _id } = req.params

    const user = await deleteUserBy({ _id })
    console.log("deleted :", user)

    return successResponse(
      res,
      200,
      undefined,
      "Success : Delete User"
    )
  } catch (error) {
    return errorResponse(res, 500, error)
  }
}
