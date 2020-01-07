const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcrypt-nodejs');

const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../../Models/User');

// @route  GET api/auth
// @desc   Test route
// @access Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// @route  POST api/auth
// @desc   Authenticate user and get token
// @access Public

router.post('/', [
  check('email', 'Please include a valid Email').isEmail(),
  check('password', 'Password is Required').exists()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {

    //See if the user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    //Return JsonWebToken
    const payload = {
      user: {
        id: user.id
      }
    }
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});




module.exports = router; 