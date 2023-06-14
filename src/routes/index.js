import express from "express";
import { getAnalyticsRedisQueueCount } from "../controller/redis";
import { runCampaignScript } from "../controller/runCamapaignAnalyticsScript";


const router = express.Router();

router.get("/ping", (req, res) => res.send("pong"));

// redis functions and routes
router.get(
	"/campaign-analytics/redis-queue-count",
	getAnalyticsRedisQueueCount
);

// campaign script 
router.get("/run-campaign-script", runCampaignScript);


export default router;
