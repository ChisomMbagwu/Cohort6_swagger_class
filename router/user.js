const { register, update, verify, resendOtp, login, getAll, makeAdmin, googleAuthLogin } = require('../controllers/user');
const { authenticate, adminAuth } = require('../middleware/authentication');
const uploads = require('../middleware/multer');
const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validator');
const {loginProfile, profile} = require('../middleware/passport');

const router = require('express').Router();



/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with profile picture upload and sends an OTP for verification.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               age:
 *                 type: number
 *                 example: 23
 *               phoneNumber:
 *                 type: string
 *                 example: 2349012345678
 *               password:
 *                 type: string
 *                 example: Pass1234 
 *               confirmPassword: 
 *                 type: string
 *                 example: Pass1234
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully. OTP sent to email/phone.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully, OTP sent to your email
 *       400:
 *         description: Validation or upload error
 */

router.post('/register', uploads.single('profilePicture'), registerValidator, register);

/**
 * @swagger
 * /api/v1/verify:
 *   post:
 *     summary: Verify user OTP
 *     description: Verifies the OTP sent to the user’s email or phone to activate their account.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

router.post('/verify', verifyValidator, verify);

/**
 * @swagger
 * /api/v1/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     description: Resends a new OTP to the user’s registered email or phone number.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: User not found or other error
 */

router.post('/resend-otp', resendValidator, resendOtp);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user using email and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: Pass1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', login);


// router.get('/users', authenticate, adminAuth, getAll);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve all users in the database
 *     description: All users will be displayed
 *     responses: 
 *       200:
 *         description: A list of users.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The user's ID.
 *                         example: 68e3efc922487ce04327b4f9
 *                       fullName:
 *                         type: string
 *                         description: The user's fullname
 *                         example: Chisom Mbagwu
 *                       email:
 *                         type: string
 *                         description: The user's email
 *                         example: email@gmail.com
 *                       phoneNumber:
 *                         type: string
 *                         description: The user's phone number
 *                         example: 23456789876
 *                       age:
 *                         type: number
 *                         description: The user's age
 *                         example: 10
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Returns all registered users. Requires admin authentication.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users retrieved successfully
 */

router.get('/users', getAll);


/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Promote a user to admin
 *     description: Updates a user’s role to admin. Only accessible to authenticated admins.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 68e3efc922487ce04327b4f9
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: User promoted to admin successfully
 *       403:
 *         description: Unauthorized or not admin
 */

router.patch('/users/:id', authenticate, adminAuth, makeAdmin);


/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Google OAuth login
 *     description: Initiates Google login using Passport.js
 *     tags:
 *       - Users
 *     responses:
 *       302:
 *         description: Redirects to Google authentication page
 */

router.get('/auth/google', profile);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles callback after Google authentication.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Login successful via Google
 *       400:
 *         description: Authentication failed
 */

router.get('/auth/google/callback',loginProfile, googleAuthLogin);


module.exports = router;