import express from "express";
import { getAnalyticsRedisQueueCount } from "../controller/redis";

const router = express.Router();

router.get("/ping", (req, res) => res.send("pong"));

// redis functions and routes
router.get(
	"/campaign-analytics/redis-queue-count",
	getAnalyticsRedisQueueCount
);

export default router;
