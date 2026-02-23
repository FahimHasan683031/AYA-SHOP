import express from "express";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
import { MetaController } from "./meta.controller";

const router = express.Router();

router.get(
    "/business-analytics",
    auth(USER_ROLES.BUSINESS),
    MetaController.getProviderAnalytics
);

export const MetaRoutes = router;
