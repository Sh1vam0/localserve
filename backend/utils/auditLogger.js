import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit log event
 * @param {Object} eventParams
 * @param {string} eventParams.action - Action name (e.g., 'login_success', 'booking_created')
 * @param {string} eventParams.category - 'auth' | 'booking' | 'verification' | 'governance' | 'system'
 * @param {Object} [eventParams.actor] - User performing the action { id, name, email, role }
 * @param {Object} [eventParams.target] - Target entity { id, name, type }
 * @param {string} eventParams.description - Human-readable summary
 * @param {Object} [eventParams.details] - Metadata details
 * @param {string} [eventParams.ipAddress] - Client IP address
 * @param {string} [eventParams.userAgent] - Browser or user agent string
 * @param {string} [eventParams.status] - 'success' | 'failed' | 'warning'
 */
export const recordAuditLog = async ({
  action,
  category = 'system',
  actor = {},
  target = {},
  description,
  details = {},
  ipAddress = '',
  userAgent = '',
  status = 'success',
}) => {
  try {
    await AuditLog.create({
      action,
      category,
      actor: {
        id: actor.id || actor._id,
        name: actor.name || 'Anonymous',
        email: actor.email || '',
        role: actor.role || 'guest',
      },
      target: {
        id: target.id || target._id,
        name: target.name || '',
        type: target.type || '',
      },
      description,
      details,
      ipAddress,
      userAgent,
      status,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }
};

export default recordAuditLog;
