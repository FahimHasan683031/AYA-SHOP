import express from "express";
import { ServiceController } from "./service.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { ServiceValidation } from "./service.validation";

const router = express.Router();

router.post(
    "/",
    auth(USER_ROLES.BUSINESS),
    validateRequest(ServiceValidation.createServiceSchema),
    ServiceController.createService
);

router.get("/", ServiceController.getAllServices);

router.get("/:id", ServiceController.getSingleService);

router.get("/:id/availability", ServiceController.getAvailableSlots);

router.patch(
    "/:id",
    auth(USER_ROLES.BUSINESS),
    validateRequest(ServiceValidation.updateServiceSchema),
    ServiceController.updateService
);

router.delete("/:id", auth(USER_ROLES.BUSINESS), ServiceController.deleteService);

export const ServiceRoutes = router;
