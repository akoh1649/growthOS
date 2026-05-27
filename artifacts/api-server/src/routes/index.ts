import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import agentsRouter from "./agents";
import analyzeRouter from "./analyze";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dashboard", dashboardRouter);
router.use("/agents", agentsRouter);
router.use("/analyze", analyzeRouter);

export default router;
