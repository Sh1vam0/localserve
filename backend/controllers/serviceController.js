import Service from '../models/Service.js';
import Business from '../models/Business.js';

// @desc    Get services for a business
// @route   GET /api/services/business/:businessId
// @access  Public
export const getServicesByBusiness = async (req, res, next) => {
  try {
    const services = await Service.find({
      business: req.params.businessId,
      isActive: true,
    }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Owner)
export const createService = async (req, res, next) => {
  try {
    const { businessId, name, description, price, duration, category } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add services to this business' });
    }

    const service = await Service.create({
      business: businessId,
      name,
      description,
      price,
      duration: duration || 30,
      category: category || 'General',
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Owner)
export const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const business = await Business.findById(service.business);
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Owner)
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const business = await Business.findById(service.business);
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service' });
    }

    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
