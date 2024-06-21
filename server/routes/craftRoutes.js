const express = require('express');
const router = express.Router();
const craftController = require('../controllers/craftController');
const Craft = require('../models/Craft');
require('dotenv').config();

///////////////////////////Firebase////////////////////////////////
const multer = require("multer");
const firebsae = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
require("../models/firebase");

  const storage = getStorage();
  
  const upload = multer({ storage: multer.memoryStorage() });
///////////////////////////////////////////////////////////

router.get('/', craftController.homepage);
router.get('/about', craftController.aboutpage);
router.get('/contact', craftController.contactpage);
router.get('/craft/:id', craftController.exploreCraft );
router.get('/craft/:id/delete', craftController.deleteCraft );
router.get('/categories', craftController.exploreCategories);
router.get('/categories/:id', craftController.exploreCraftbyCategorie);
router.post('/search', craftController.searchCraft );
router.get('/explore-latest', craftController.exploreLatest);
router.get('/explore-random', craftController.exploreRandom);
router.get('/submit-craft', craftController.submitCraft );
router.get('/craft/:id/update-auth', craftController.updateAuthCraft);
router.get('/craft/:id/update-craft/:email', craftController.updateCraft);
router.post('/submit-craft',upload.single("image"), craftController.submitCraftOnPost);
router.post('/craft/:id/delete', craftController.deleteCraftPost);
router.post('/craft/:id/update-auth', craftController.updateAuthCraftPost);
router.post('/craft/:id/update-craft/:email',upload.single("image"), craftController.updateCraftPost);

router.post('/categories', craftController.addCategory);

module.exports = router;