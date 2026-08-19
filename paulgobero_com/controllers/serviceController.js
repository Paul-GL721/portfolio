const Service = require("../models/service");
const { body, validationResult } = require("express-validator");
const controllerUtils = require("../utils/controllerUtils");

const serviceValidators = [
    body("servicetitle", "Service title is required").trim().isLength({ min: 2, max: 120 }),
    body("servicedescription", "Service description is required").trim().isLength({ min: 10, max: 700 }),
    body("serviceicon").optional({ checkFalsy: true }).trim().matches(/^icon-[a-z0-9-]+$/)
        .withMessage("Use an icon class such as icon-layers"),
    body("servicetags").optional({ checkFalsy: true }).trim(),
    body("servicedisplayorder").isInt({ min: 1 }).toInt(),
    body("servicepublished").optional().toBoolean()
];

const serviceFromRequest = req => ({
    title: req.body.servicetitle,
    description: req.body.servicedescription,
    icon: req.body.serviceicon || "icon-layers",
    tags: (req.body.servicetags || "").split(/[\r\n,]+/).map(tag => tag.trim()).filter(Boolean),
    displayOrder: req.body.servicedisplayorder,
    published: !!req.body.servicepublished
});

const ensureAdmin = (req, res) => {
    if (req.userinfo?.role !== "admin") {
        res.status(403).json({ message: "You are unauthorised for this resource" });
        return false;
    }
    return true;
};

exports.service_list = async (req, res, next) => {
    if (!ensureAdmin(req, res)) return;
    try {
        const [brand, services] = await Promise.all([
            controllerUtils.getBrandName(),
            Service.find({}).sort({ displayOrder: 1, createdAt: -1 })
        ]);
        res.render("service_Admin", { Title: "Manage Services", services, brand1: brand });
    } catch (err) { next(err); }
};

exports.service_create_get = async (req, res, next) => {
    if (!ensureAdmin(req, res)) return;
    try {
        const brand = await controllerUtils.getBrandName();
        res.render("create_service", { Title: "Add Service", brand1: brand });
    } catch (err) { next(err); }
};

exports.service_create_post = [
    ...serviceValidators,
    async (req, res, next) => {
        if (!ensureAdmin(req, res)) return;
        const errors = validationResult(req);
        const service = new Service(serviceFromRequest(req));
        if (!errors.isEmpty()) {
            const brand = await controllerUtils.getBrandName();
            return res.status(400).render("create_service", {
                Title: "Add Service", brand1: brand, service, errors: errors.array()
            });
        }
        try {
            await service.save();
            res.redirect("/portfolio/service");
        } catch (err) { next(err); }
    }
];

exports.service_update_get = async (req, res, next) => {
    if (!ensureAdmin(req, res)) return;
    try {
        const service = await Service.findById(req.query.updateid);
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.json(service);
    } catch (err) { next(err); }
};

exports.service_update_post = [
    ...serviceValidators,
    body("serviceUpdateid").isMongoId(),
    async (req, res, next) => {
        if (!ensureAdmin(req, res)) return;
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        try {
            const service = await Service.findByIdAndUpdate(
                req.body.serviceUpdateid,
                { $set: serviceFromRequest(req) },
                { new: true, runValidators: true }
            );
            if (!service) return res.status(404).json({ message: "Service not found" });
            res.redirect("/portfolio/service");
        } catch (err) { next(err); }
    }
];

exports.service_delete_post = async (req, res, next) => {
    if (!ensureAdmin(req, res)) return;
    try {
        const service = await Service.findByIdAndDelete(req.body.serviceid);
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.json({ success: "Successfully deleted" });
    } catch (err) { next(err); }
};
