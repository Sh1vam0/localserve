import User from '../models/User.js';
import { recordAuditLog } from '../utils/auditLogger.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, username } = req.body || {};
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid text for name, email, and password' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long for security',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? username.trim().toLowerCase() : cleanEmail.split('@')[0];

    const userExists = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or username' });
    }

    const assignedRole = role && ['customer', 'owner'].includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      username: cleanUsername,
      email: cleanEmail,
      password,
      phone: phone || '',
      role: assignedRole,
    });

    const token = user.getSignedJwtToken();

    // Log registration
    await recordAuditLog({
      action: 'user_registered',
      category: 'auth',
      actor: { id: user._id, name: user.name, email: user.email, role: user.role },
      target: { id: user._id, name: user.name, type: 'User' },
      description: `New ${user.role} account created for ${user.name} (${user.email}).`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
        adminPermissions: user.adminPermissions,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user (supports Email or Username)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, username, identifier, password } = req.body || {};
    const rawInput = typeof email === 'string' ? email : typeof username === 'string' ? username : typeof identifier === 'string' ? identifier : '';
    const loginKey = rawInput.trim().toLowerCase();

    if (!loginKey || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email/username and password' });
    }

    const user = await User.findOne({
      $or: [{ email: loginKey }, { username: loginKey }],
    }).select('+password');

    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';

    if (!user) {
      await recordAuditLog({
        action: 'login_failed',
        category: 'auth',
        actor: { name: loginKey, email: loginKey, role: 'visitor' },
        description: `Failed login attempt for unknown user: "${loginKey}".`,
        ipAddress: clientIp,
        userAgent,
        status: 'failed',
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is temporarily locked due to excessive failed attempts
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((new Date(user.lockUntil) - new Date()) / (1000 * 60));
      await recordAuditLog({
        action: 'login_blocked_locked',
        category: 'auth',
        actor: { id: user._id, name: user.name, email: user.email, role: user.role },
        description: `Login attempt on locked account: ${user.email} (${minutesLeft}m remaining).`,
        ipAddress: clientIp,
        userAgent,
        status: 'warning',
      });
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;

      if (attempts >= 5) {
        user.failedLoginAttempts = 0;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        await user.save();

        await recordAuditLog({
          action: 'account_locked',
          category: 'auth',
          actor: { id: user._id, name: user.name, email: user.email, role: user.role },
          description: `Account ${user.email} locked for 15 minutes after 5 consecutive failed login attempts.`,
          ipAddress: clientIp,
          userAgent,
          status: 'warning',
        });

        return res.status(423).json({
          success: false,
          message: 'Account locked for 15 minutes due to 5 consecutive failed password attempts.',
        });
      }

      user.failedLoginAttempts = attempts;
      await user.save();

      await recordAuditLog({
        action: 'login_failed',
        category: 'auth',
        actor: { id: user._id, name: user.name, email: user.email, role: user.role },
        description: `Incorrect password attempt (${attempts}/5) for ${user.email} (${user.role}).`,
        ipAddress: clientIp,
        userAgent,
        status: 'failed',
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset failed login attempts upon successful authentication
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    if (!user.isActive) {
      await recordAuditLog({
        action: 'login_blocked_inactive',
        category: 'auth',
        actor: { id: user._id, name: user.name, email: user.email, role: user.role },
        description: `Deactivated account tried to sign in: ${user.email}.`,
        ipAddress: clientIp,
        userAgent,
        status: 'warning',
      });
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact admin.' });
    }

    const token = user.getSignedJwtToken();

    // Log successful login
    await recordAuditLog({
      action: 'login_success',
      category: 'auth',
      actor: { id: user._id, name: user.name, email: user.email, role: user.role },
      description: `User "${user.name}" (${user.role}${user.isSuperAdmin ? ' - Super Admin' : ''}) signed in.`,
      ipAddress: clientIp,
      userAgent,
      status: 'success',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
        adminPermissions: user.adminPermissions,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
        adminPermissions: user.adminPermissions,
        walletBalance: user.walletBalance,
        walletHistory: user.walletHistory,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, username } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (username !== undefined && !user.isSuperAdmin) user.username = username.trim().toLowerCase();

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
        adminPermissions: user.adminPermissions,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};
