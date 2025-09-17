const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.post('/login', adminController.adminLogin);

router.get('/users', adminController.getAllUsers);

router.put('/users/:id', adminController.updateUser);

router.put('/users/:id/toggle-active', adminController.toggleUserActive);

router.delete('/users/:id', adminController.deleteUser);

router.get('/listings', adminController.getAllListings);

router.put('/listings/:id', adminController.updateListing);

router.put('/listings/:id/toggle-active', adminController.toggleListingActive);

router.delete('/listings/:id', adminController.deleteListing);

router.get('/reviews', adminController.getAllReviews);

router.put('/reviews/:listingId/:reviewId/toggle-visible', adminController.toggleReviewVisibility);

router.get('/logs', adminController.getAdminLogs);

router.get('/orders', adminController.getAllOrders);

router.put('/orders/:orderId/status', adminController.updateOrderStatus);

module.exports = router;