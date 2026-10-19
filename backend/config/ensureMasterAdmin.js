import User from '../models/User.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export const ROOT_ADMINS = [
  {
    name: 'Sh1vam',
    username: 'sh1vam',
    email: 'admin@localserve.com',
    password: 'Sh1vam@admin',
    phone: '+91 99999 88888',
  },
  {
    name: 'Sangam Gautam',
    username: 'SangamGautam',
    email: 'admin2@localserve.com',
    password: '@Sangam@admin',
    phone: '+91 98888 77777',
  },
];

/**
 * Ensures all hardcoded Root Super Admin accounts exist with full permissions and verified credentials.
 */
export const ensureMasterAdmin = async () => {
  for (const root of ROOT_ADMINS) {
    try {
      const cleanEmail = root.email.toLowerCase().trim();
      const cleanUsername = root.username.toLowerCase().trim();

      let admin = await User.findOne({
        $or: [{ email: cleanEmail }, { username: cleanUsername }],
      }).select('+password');

      if (!admin) {
        admin = await User.create({
          name: root.name,
          username: root.username,
          email: cleanEmail,
          password: root.password,
          phone: root.phone,
          role: 'admin',
          isSuperAdmin: true,
          adminPermissions: {
            canVerifyBusinesses: true,
            canManageUsers: true,
            canManageBookings: true,
            canManageAdmins: true,
          },
        });

        console.log(`👑 Root Super Admin "${root.name}" (${root.email}) initialized with full authority.`);

        await recordAuditLog({
          action: 'system_init_superadmin',
          category: 'governance',
          actor: { name: 'System Bootstrap', email: cleanEmail, role: 'system' },
          target: { id: admin._id, name: root.name, type: 'User' },
          description: `Root Super Admin ${root.name} account provisioned.`,
          status: 'success',
        });
      } else {
        // Ensure privileges, username, password and active state are current
        let modified = false;
        if (!admin.isSuperAdmin) {
          admin.isSuperAdmin = true;
          modified = true;
        }
        if (admin.role !== 'admin') {
          admin.role = 'admin';
          modified = true;
        }
        if (!admin.isActive) {
          admin.isActive = true;
          modified = true;
        }
        if (admin.isLocked && admin.isLocked()) {
          admin.failedLoginAttempts = 0;
          admin.lockUntil = null;
          modified = true;
        }
        if (admin.username !== cleanUsername) {
          admin.username = cleanUsername;
          modified = true;
        }
        if (admin.name !== root.name) {
          admin.name = root.name;
          modified = true;
        }

        // Check if password needs to be verified/set
        const isPassMatch = await admin.matchPassword(root.password);
        if (!isPassMatch) {
          admin.password = root.password; // Mongoose pre-save hook will hash it
          modified = true;
        }

        if (!admin.adminPermissions?.canManageAdmins) {
          admin.adminPermissions = {
            canVerifyBusinesses: true,
            canManageUsers: true,
            canManageBookings: true,
            canManageAdmins: true,
          };
          modified = true;
        }

        if (modified) {
          await admin.save();
          console.log(`👑 Root Super Admin "${root.name}" credentials & permissions verified.`);
        }
      }
    } catch (err) {
      console.error(`Master Admin (${root.email}) Provisioning Error:`, err.message);
    }
  }
};

export default ensureMasterAdmin;
