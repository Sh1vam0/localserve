import User from '../models/User.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * Ensures the Root Super Admin account "Sh1vam" (admin@localserve.com) exists with full permissions.
 */
export const ensureMasterAdmin = async () => {
  try {
    const masterEmail = 'admin@localserve.com';
    const masterUsername = 'sh1vam';
    const masterPassword = 'Sh1vam@admin';
    const masterName = 'Sh1vam';

    let admin = await User.findOne({
      $or: [{ email: masterEmail }, { username: masterUsername }],
    }).select('+password');

    if (!admin) {
      admin = await User.create({
        name: masterName,
        username: masterUsername,
        email: masterEmail,
        password: masterPassword,
        phone: '+91 99999 88888',
        role: 'admin',
        isSuperAdmin: true,
        adminPermissions: {
          canVerifyBusinesses: true,
          canManageUsers: true,
          canManageBookings: true,
          canManageAdmins: true,
        },
      });

      console.log(`👑 Root Super Admin "${masterName}" (${masterEmail}) initialized with full authority.`);

      await recordAuditLog({
        action: 'system_init_superadmin',
        category: 'governance',
        actor: { name: 'System Bootstrap', email: masterEmail, role: 'system' },
        target: { id: admin._id, name: masterName, type: 'User' },
        description: `Root Super Admin ${masterName} account provisioned.`,
        status: 'success',
      });
    } else {
      // Ensure privileges and username are current
      let modified = false;
      if (!admin.isSuperAdmin) {
        admin.isSuperAdmin = true;
        modified = true;
      }
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        modified = true;
      }
      if (admin.username !== masterUsername) {
        admin.username = masterUsername;
        modified = true;
      }
      if (admin.name !== masterName) {
        admin.name = masterName;
        modified = true;
      }

      // Check if password needs to be verified/set
      const isPassMatch = await admin.matchPassword(masterPassword);
      if (!isPassMatch) {
        admin.password = masterPassword; // Mongoose pre-save hook will hash it
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
        console.log(`👑 Root Super Admin "${masterName}" credentials & permissions verified.`);
      }
    }
  } catch (err) {
    console.error('Master Admin Provisioning Error:', err.message);
  }
};

export default ensureMasterAdmin;
