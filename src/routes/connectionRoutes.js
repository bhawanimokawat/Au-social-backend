const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { sendConnectionRequest, acceptConnectionRequest,rejectConnectionRequest,cancelConnectionRequest,removeConnection,getMyConnections,getPendingRequests} = require("../controllers/connectionController");

router.post("/:userId",  authMiddleware,  sendConnectionRequest);
router.put( "/:connectionId/accept", authMiddleware, acceptConnectionRequest);
router.put( "/:connectionId/reject", authMiddleware,rejectConnectionRequest);
router.delete( "/:connectionId/cancel", authMiddleware, cancelConnectionRequest);
router.delete("/:connectionId",authMiddleware,removeConnection);
router.get("/",authMiddleware,getMyConnections);
router.get(  "/requests",  authMiddleware,  getPendingRequests);



module.exports = router;