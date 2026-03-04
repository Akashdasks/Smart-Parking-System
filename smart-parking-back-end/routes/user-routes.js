const express = require('express');
const checkToken = require('../middleware/check-token');
const bcrypt = require('bcrypt');
const User = require('../db/models/user-schema');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/user', checkToken, async (req, res) => {
  try {
    const dbResponse = await User.find();
    res.status(200).json(dbResponse);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/user', checkToken, async (req, res) => {
  try {
    const dbResponse = await User.create(req.body);
    res.status(200).json(dbResponse);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
// VIEW PROFILE

// ✅ VIEW PROFILE (GET)
router.get('/user/profile', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/user/profile', checkToken, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'upiId'];
    const updateData = {};

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // 🔐 Prevent email duplication
    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // 🔒 SECURITY: Only OWNER can update UPI
    const currentUser = await User.findById(req.user._id);
    if (updateData.upiId && currentUser.role !== 'owner') {
      delete updateData.upiId;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PROFILE
router.patch('/user/update-profile', checkToken, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone']; // only these fields can be updated
    let updateData = {};

    allowed.forEach(key => {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select('-password');

    res
      .status(200)
      .json({ message: 'Profile updated successfully', updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:id', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// VIEW PROFILE (works for both user & owner)

router.delete('/user/:id', checkToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/user/:id', checkToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, Password, Phone and Role are required',
      });
    }

    // Validate role
    if (!['user', 'owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Check email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user WITHOUT parking details
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      parkingDetails: [], // empty initially
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/user/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email is incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY_RESET, {
      expiresIn: '1h',
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'akashdasks005@gmail.com',
        pass: 'fzmu tnra yixs ivdg',
      },
    });

    const mailOptions = {
      from: 'akashdasks005@gmail.com',
      to: email,
      subject: 'Reset Password',
      text: `Hi,  
Please reset your password using this token:  
${token}

This token will expire in 1 hour.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error)
        return res.status(500).json({ message: 'Mail sending failed', error });
      return res
        .status(200)
        .json({ message: 'Reset mail has been sent successfully!' });
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post('/user/reset-password', async (req, res) => {
  try {
    const { token, email, password, confirmPassword } = req.body;

    const decoded = jwt.verify(token, process.env.SECRET_KEY_RESET);

    const user = await User.findOne({ email });
    if (!user || user._id.toString() !== decoded.id) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res
      .status(200)
      .json({ message: 'Password has been successfully reset!' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// router.get('/owner/details', checkToken(['owner']), async (req, res) => {
//   try {
//     const ownerId = req.user._id;

//     // Fetch owner info
//     const owner = await User.findById(ownerId).select('-password');
//     if (!owner) return res.status(404).json({ message: 'Owner not found' });

//     // Fetch parking places owned by this owner
//     const parkingPlaces = await Parking.find({ ownerId });

//     res.status(200).json({
//       success: true,
//       owner: {
//         id: owner._id,
//         name: owner.name,
//         email: owner.email,
//         phone: owner.phone,
//         parkingDetails: parkingPlaces, // <--- RETURNS ALL PARKINGS
//       },
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
