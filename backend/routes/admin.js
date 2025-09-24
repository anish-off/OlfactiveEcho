const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Import controllers
const adminController = require('../controllers/adminController');
const adminProductController = require('../controllers/adminProductController');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminBrandController = require('../controllers/adminBrandController');
const adminCouponController = require('../controllers/adminCouponController');
const orderController = require('../controllers/orderController');

// Apply admin authentication to all routes
router.use(adminAuth);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);

// Customer management routes
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetails);

// Product management routes
router.get('/products', adminProductController.getProducts);
router.get('/products/analytics', adminProductController.getProductAnalytics);
router.get('/products/:id', adminProductController.getProduct);
router.post('/products', adminProductController.createProduct);
router.put('/products/:id', adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);
router.put('/products/bulk/stock', adminProductController.bulkUpdateStock);

// Category management routes
router.get('/categories', adminCategoryController.getCategories);
router.get('/categories/:id', adminCategoryController.getCategory);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);
router.put('/categories/sort-order', adminCategoryController.updateSortOrder);

// Brand management routes
router.get('/brands', adminBrandController.getBrands);
router.get('/brands/analytics', adminBrandController.getBrandAnalytics);
router.get('/brands/:id', adminBrandController.getBrand);
router.post('/brands', adminBrandController.createBrand);
router.put('/brands/:id', adminBrandController.updateBrand);
router.delete('/brands/:id', adminBrandController.deleteBrand);
router.put('/brands/:id/toggle-featured', adminBrandController.toggleFeatured);

// Coupon management routes
router.get('/coupons', adminCouponController.getCoupons);
router.get('/coupons/analytics', adminCouponController.getCouponAnalytics);
router.get('/coupons/:id', adminCouponController.getCoupon);
router.post('/coupons', adminCouponController.createCoupon);
router.put('/coupons/:id', adminCouponController.updateCoupon);
router.delete('/coupons/:id', adminCouponController.deleteCoupon);
router.put('/coupons/:id/toggle-status', adminCouponController.toggleStatus);

// Order management routes (reuse existing order controller with admin auth)
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);

module.exports = router;
