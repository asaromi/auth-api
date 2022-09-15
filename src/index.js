const { Router } = require("express")
const { getAllCustomers } = require("../controllers/customer")
const {
  storeEvent,
  getAllEvents,
  getEventById,
  storeTicket,
} = require("../controllers/event")
const { getAllLocations, storeLocation } = require("../controllers/location")
const {
  storeTransaction,
  checkCustomerAndQuota,
  updateTicketAfterTransaction,
  getTransactionById,
} = require("../controllers/transaction")
const { validate } = require("../validator")
const {
  storeEventSchema,
  getEventSchema,
  storeTicketSchema,
} = require("../validator/event")
const { storeLocationSchema } = require("../validator/location")
const { getTransactionSchema, storeTransactionSchema } = require("../validator/transaction")
const indexRouter = new Router()


indexRouter.get("/", (req, res) => {
  res.status(200).json({ success: true })
})

indexRouter.get("/customer", getAllCustomers)

indexRouter.get("/location", getAllLocations)
indexRouter.post(
  "/location/create",
  validate(storeLocationSchema),
  storeLocation
)

indexRouter.get("/event", getAllEvents)
indexRouter.get("/event/get_info", validate(getEventSchema), getEventById)
indexRouter.post("/event/create", validate(storeEventSchema), storeEvent)
indexRouter.post(
  "/event/ticket/create",
  validate(storeTicketSchema),
  storeTicket
)

indexRouter.get(
  "/transaction/get_info",
  validate(getTransactionSchema),
  getTransactionById,
)
indexRouter.post(
  "/transaction/purchase",
  validate(storeTransactionSchema),
  checkCustomerAndQuota,
  storeTransaction,
  updateTicketAfterTransaction
)

module.exports = indexRouter
