const { initializePayment, verifyPayment, verifyPaymentWebhook } = require('../controllers/payment');
const { authenticate } = require('../middleware/authentication');

const router = require('express').Router();

router.post('/make-payment/:id', authenticate, initializePayment);

router.get('/verify-payment', verifyPayment);

router.post('/verify-payment/webhook', verifyPaymentWebhook)

module.exports = router;