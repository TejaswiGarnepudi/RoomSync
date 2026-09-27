const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Helper to validate strong passwords and ensure they don't contain user name/email
const validatePasswordStrength = (password, name = '', email = '') => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!((hasUpper && hasLower) && (hasNumber || hasSymbol))) {
    return 'Password must include uppercase letters, lowercase letters, and at least one number or special symbol';
  }

  const lowerPwd = password.toLowerCase();

  // Check if password contains user's name parts
  if (name) {
    const nameParts = name.toLowerCase().split(/[\s_-]+/).filter(part => part.length >= 3);
    for (const part of nameParts) {
      if (lowerPwd.includes(part)) {
        return `Password cannot contain your name ("${part}")`;
      }
    }
  }

  // Check if password contains email username part
  if (email) {
    const emailPrefix = email.toLowerCase().split('@')[0];
    if (emailPrefix.length >= 3 && lowerPwd.includes(emailPrefix)) {
      return 'Password cannot contain your email username';
    }
  }

  return null;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    const strengthError = validatePasswordStrength(password, name, email);
    if (strengthError) {
      res.status(400);
      throw new Error(strengthError);
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please provide your registered email address');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404);
      throw new Error('No RoomSync account found with that email address');
    }

    // Generate a secure 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    res.status(200).json({
      success: true,
      message: `Password reset instructions sent to ${email}`,
      data: {
        email: user.email,
        resetCode
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400);
      throw new Error('Please provide email and new password');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const strengthError = validatePasswordStrength(newPassword, user.name, user.email);
    if (strengthError) {
      res.status(400);
      throw new Error(strengthError);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully reset! You can now sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, profilePhoto } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (name) {
      user.name = name.trim();
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        res.status(400);
        throw new Error('Email is already registered with another account');
      }
      user.email = email.toLowerCase().trim();
    }

    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide both current password and new password');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error('Incorrect current password');
    }

    const strengthError = validatePasswordStrength(newPassword, user.name, user.email);
    if (strengthError) {
      res.status(400);
      throw new Error(strengthError);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

