const express = require("express");
const router = new express.Router();
const controllers = require("../Controller/usersController");
const upload = require("../multerconfig/storageConfig");

//Routes
router.post("/user/register", upload.single("user_profile"),controllers.userpost);
router.get("/user/details",controllers.userget);
router.get("/user/:id",controllers.singleuserget);
router.put("/user/edit/:id", upload.single("user_profile"),controllers.useredit)
router.delete("/user/delete/:id", controllers.userdelete)
router.put("/user/status/:id", controllers.userstatus)
// router.get("/userexport", controllers.userExport)

router.get("/userexport",controllers.userExport);

module.exports = router