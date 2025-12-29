const {Router} =require('express');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken.js');
const  {validateObjectId}  = require('../middlewares/validateObjectId.js');
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require('../controllers/categoriesController.js');
const router = Router();

// /api/categories ==> create category
router.post('/' , verifyTokenAndAdmin , createCategoryCtrl );

// /api/categories ==> get all categories
router.get('/' , getAllCategoriesCtrl );

// /api/categories/:id ==> get all categories
router.delete('/:id' , validateObjectId , verifyTokenAndAdmin , deleteCategoryCtrl );


module.exports = router;