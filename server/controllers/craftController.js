require('../models/database');
const Category = require('../models/Category');
const Craft = require('../models/Craft');

///////////////////////////////////////////////////////
const multer = require("multer");
const firebsae = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
require("../models/firebase");

  const storage = getStorage();
  
  const upload = multer({ storage: multer.memoryStorage() });
///////////////////////////////////////////////////////

/**
 * GET /
 * Homepage 
*/
exports.homepage = async(req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Craft.find({}).sort({_id: -1}).limit(limitNumber);
    const inspo = await Craft.find({ 'category': 'Inspos' }).limit(limitNumber);
    const paper = await Craft.find({ 'category': 'Paper Crafts' }).limit(limitNumber);
    const artist = await Craft.find({ 'category': 'Artistic Endeavors' }).limit(limitNumber);
    const kids = await Craft.find({ 'category': 'DIY for Kids' }).limit(limitNumber);
    

    const diy = { latest, inspo,  paper, artist , kids };

    res.render('index', { title: 'PINspiration - Home', categories, diy } );

  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}

/**
 * GET /about
 * Aboutpage 
*/
exports.aboutpage= async (req,res)=>{
  res.render('about',{title:'PINspiration - About'});
}

/**
 * GET /contact
 * Contactpage 
*/
exports.contactpage= async (req,res)=>{
  res.render('contact',{title:'PINspiration - Contact'});
}



/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async(req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'PINspiration - All Categoreis', categories,categoryName:"Explore Categories" } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCraftbyCategorie = async(req, res) => { 
  try {
    let category = req.params.id;
    const limitNumber = 20;
    const categoryById = await Craft.find({ 'category': category }).limit(limitNumber);
    res.render('categories', { title: 'PINspiration -'+category, categoryById ,categoryName:category} );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 
 
/**
 * GET /craft/:id
 * Recipe 
*/
exports.exploreCraft = async(req, res) => {
  try {
    let craftId = req.params.id;
    const craft = await Craft.findById(craftId);
    res.render('craft', { title: 'PINspiration -'+craft.name, craft } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 

/** deleteCraft  get*/



exports.deleteCraft = async(req, res) => {
  const infoErrorsObj = req.flash('delErrors');
  const infoSubmitObj = req.flash('deleted');
  let craftId = req.params.id;
  const craft = await Craft.findById(craftId);
  res.render('delete',{title: 'PINspiration - Delete '+craft.name,craft:craft, infoErrorsObj, infoSubmitObj});
} 




/**
 * POST /search
 * Search 
*/
exports.searchCraft = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let diy = await Craft.find( { $text: { $search: searchTerm, $diacriticSensitive: false } });
    res.render('search', { title: 'PINspiration - Search', diy } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
  
}

/**
 * GET /explore-latest
 * Explplore Latest 
*/
exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 20;
    const diy = await Craft.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'PINspiration - Explore Latest DIYs', diy } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 



/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async(req, res) => {
  try {
    let count = await Craft.find({});
    let random = Math.floor(Math.random() * count.length);
    let craft = count[random];
    res.render('craft', { title: 'PINspiration - Explore Random DIYs', craft } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * GET /submit-craft
 * Submit Craft
*/
exports.submitCraft = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');

  res.render('submit-diy', { title: 'PINspiration - Submit Your DIY', infoErrorsObj, infoSubmitObj  } );
}


/**  POST /submit-craft
* Submit craft post
*/
exports.submitCraftOnPost=async (req,res)=>{

   const upload=async()=>{
      try{


              const newCraft= new Craft({
                  name: req.body.name,
                  description: req.body.description,
                  email: req.body.email,
                  instructions: req.body.instruction,
                  category: req.body.category,
                  image: "xxxxxxxxx"
                });
                await newCraft.save();

              const file = req.file;
              const storageRef = ref(storage, `${newCraft.id}`);
              const snapshot= await uploadBytes(storageRef, file.buffer);
              const url = await getDownloadURL(storageRef);
                newCraft.image=url;
                await newCraft.save();

                req.flash('infoSubmit', 'Your DIY has been added.')
                res.redirect('/submit-craft');
      }
      catch(err){
          console.log("Error= "+err);
          req.flash('infoErrors', 'Error '+err);
          res.redirect('/submit-craft');
      }
   }
   upload();

}


/**Delete craft - post */
exports.deleteCraftPost = async(req, res) => {
  try {
    
    let craftId = req.params.id;
    const craft = await Craft.findById(craftId);
    if(craft.name===req.body.name&&craft.email===req.body.email)
    {
      await Craft.deleteOne({ name: req.body.name });
      res.redirect('/');
    }
    else
    {
      req.flash('delErrors', 'Only author can delete the DIY Blog ! Either email or DIY name is Wrong.');
      res.redirect('/craft/'+craftId+'/delete');
    }
  } catch (error) {
    req.flash('delErrors', error);
    res.redirect('/craft/'+req.params.id+'/delete');
  }
} 


/** GET-   /craft/:id/update-auth   */



exports.updateAuthCraft = async(req, res) => {
  const infoErrorsObj = req.flash('delErrors');
  const infoSubmitObj = req.flash('deleted');
  let craftId = req.params.id;
  const craft = await Craft.findById(craftId);
  res.render('update_auth',{title: 'PINspiration - Update '+craft.name,craft:craft, infoErrorsObj, infoSubmitObj});
}

/** Post  /craft/:id/update-auth */
exports.updateAuthCraftPost = async(req, res) => {
  try {
    
    let craftId = req.params.id;
    const craft = await Craft.findById(craftId);
    if(craft.name===req.body.name&&craft.email===req.body.email)
    {
      res.redirect('/craft/'+craftId+'/update-craft/'+craft.email);
    }
    else
    {
      req.flash('delErrors', 'Only author can update the DIY Blog ! Either email or DIY name is Wrong.');
      res.redirect('/craft/'+craftId+'/update-auth');
    }
  } catch (error) {
    req.flash('delErrors', error);
    res.redirect('/craft/'+req.params.id+'/update-auth/');
  }
} 


/** GET-   /craft/:id/update   */
exports.updateCraft = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  let craftId = req.params.id;
  const craft = await Craft.findById(craftId);
  res.render('update',{title: 'PINspiration - Author',craft:craft,infoErrorsObj, infoSubmitObj});
}

/** POST- /craft/:id/update/email */ 
exports.updateCraftPost = async (req, res) => {
  const craftId = req.params.id;
  const { email, name, description, instruction, category } = req.body;

    const update=async()=>{
      try{

          const craft = await Craft.findById(craftId);
          
              const file = req.file;
              const storageRef = ref(storage, `${craft.id}`);
              const snapshot= await uploadBytes(storageRef, file.buffer);
              const url = await getDownloadURL(storageRef);

          craft.email = email;
          craft.name = name;
          craft.description = description;
          craft.instruction = instruction;
          craft.category = category;
          craft.image=url;
          await craft.save();
          req.flash('infoSubmit', 'Your DIY has been updated.')
          res.redirect('/craft/'+craft.id+'/update-craft/'+craft.email);
      }
      catch(err){
          console.log("Error= "+err);
          req.flash('infoErrors', 'Error '+err);
          res.redirect('/craft/'+req.params.id+'/update-craft/'+req.params.email);
      }
   }
   update();
};


exports.addCategory = async (req, res) => {
  const { name, image } = req.body; // Get form data

  try {
    // Create new Category object
    const newCategory = new Category({
      name,
      image // Assuming the image field corresponds to the image URL or path
    });

    // Save the new Category object to the database
    await newCategory.save();

    // Redirect or respond as needed
    req.flash('infoSubmit', 'Category added successfully.');
    res.redirect('/admin/categories'); // Redirect to the categories page or another appropriate route
  } catch (error) {
    console.log("Error:", error);
    req.flash('infoErrors', 'Error occurred while adding the category.');
    res.redirect('/admin/add-category'); // Redirect to the add category page or another appropriate route
  }
};


