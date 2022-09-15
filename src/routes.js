const { Router } = require("express")
const { USER_ROLE } = require("./constant")
const {
  login,
  refreshToken,
  authenticate,
  author,
  storeUser,
  findUserById,
  updateUserById,
  deleteUserById,
} = require("./controller")
const router = new Router()

router.get("/", (req, res) => {
  res.status(200).json({ success: true })
})

router.post("/auth/login", login)
router.get("/auth/refresh-token", refreshToken)
router.post("/user", authenticate, author([USER_ROLE.ADMIN]), storeUser)
router.get("/user/:id", authenticate, findUserById)
router.put("/user/:id", authenticate, author([USER_ROLE.ADMIN]), updateUserById)
router.delete(
  "/user/:id",
  authenticate,
  author([USER_ROLE.ADMIN]),
  deleteUserById
)

module.exports = router
