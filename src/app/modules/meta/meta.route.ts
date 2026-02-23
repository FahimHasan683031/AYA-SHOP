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

router.get(
    "/landing-stats",
    auth(USER_ROLES.BUSINESS, USER_ROLES.CLIENT, USER_ROLES.ADMIN),
    MetaController.getPublicStats
);

router.get(
    "/admin-analytics",
    auth(USER_ROLES.ADMIN),
    MetaController.getAdminAnalytics
);

export const MetaRoutes = router;
