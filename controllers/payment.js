const userModel = require('../models/user');
const productModel = require('../models/product');
const paymentModel = require('../models/payment');
const axios = require('axios');
const otpGen = require('otp-generator');


exports.initializePayment = async (req, res) => {
  try {
    const code = await otpGen.generate(12, { upperCaseAlphabets: false, lowerCaseAlphabets: true, digits: true, specialChars: false })
    const ref = `TCA-${code}-TCHEE`
    const productId = req.params.id;
    const { id } = req.user;
    const user = await userModel.findById(id);
    if (user === null) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    const product = await productModel.findById(productId);
    if (product === null) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }

    const paymentData = {
      amount: product.price *1000,
      currency: 'NGN',
      reference: ref,
      customer: {
        email: user.email,
        name: user.fullName
      }
    }

    const { data } = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData, {
      headers: {
        Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`
      }
    });

    const payment = new paymentModel({
      userId: id,
      productId,
      reference: ref,
      price: product.price
    });

    if (data?.status === true) {
      await payment.save();
    }

    res.status(200).json({
      message: 'Payment Initialized successfuly',
      data: {
        reference: data?.data?.reference,
        url: data?.data?.checkout_url
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error initializing payment: ' + error.message,
      error: error.response?.data
    })
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    const payment = await paymentModel.findOne({ reference });
    if (payment === null) {
      return res.status(404).json({
        message: 'Payment not found'
      })
    }
    const { data } = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`
      }
    })

    console.log(data)
    if (data?.status === true && data?.data?.status === "success") {
      payment.status = 'Successful'
      await payment.save();
      res.status(200).json({
        message: 'Payment Verified Successfully'
      })
    } else{
      payment.status = 'Failed'
      await payment.save();
      res.status(200).json({
        message: 'Payment Failed'
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error verifying payment: ' + error.message
    })
  }
};


exports.verifyPaymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    const payment = await paymentModel.findOne({ reference: data?.reference });
    if (payment === null) {
      return res.status(404).json({
        message: 'Payment not found'
      })
    }
    if (event === 'charge.success') {
      payment.status = 'Successful'
      await payment.save();
      res.status(200).json({
        message: 'Payment Verified Successfully via Webhook'
      })
    } else if (event === 'charge.failed'){
      payment.status = 'Failed'
      await payment.save();
      res.status(200).json({
        message: 'Payment Failed via Webhook'
      })
    }

  } catch (error) {
    res.status(500).json({
      message: 'Error verifying payment via webhook: ' + error.message
    })
  }
};
