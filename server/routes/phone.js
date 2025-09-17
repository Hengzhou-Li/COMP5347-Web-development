// router/phone.js
const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');

router.get('/phones', phoneController.getPhones);
router.get('/phones/brands', phoneController.getBrands);
router.get('/phones/max-price', phoneController.getMaxPrice);
router.get('/phones/soldoutsoon', phoneController.getSoldOutSoon);
router.get('/phones/bestsellers', phoneController.getBestSellers);

router.get('/phones/:id', phoneController.getPhoneById);
router.post('/phones/:listingId/reviews', phoneController.addReview);

//API used in profile page
router.get('/user/:userId', phoneController.getUserListings);
router.post('/createlist', phoneController.createListing);
router.patch('/:listingId', phoneController.toggleListingStatus);
router.delete('/:listingId', phoneController.deleteListing);
router.patch('/:listingId/comments/:commentId/toggle', phoneController.toggleCommentVisibility);
router.put('/reviews/:listingId/:reviewId/hidden', phoneController.updateReviewViewActive);
//new get review data (can used in profile)
router.get('/phones/:listingId/public-reviews', phoneController.getPublicReviews);


module.exports = router;