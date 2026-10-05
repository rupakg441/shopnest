import Address from '../models/Address.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createAddressValidator, updateAddressValidator } from '../validators/addressValidator.js';

const clearDefault = async (userId) => Address.updateMany({ user: userId, isDefault: true }, { $set: { isDefault: false } });

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, updatedAt: -1 }).lean();
    return sendSuccess(res, 'Addresses retrieved', { addresses });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const data = createAddressValidator.parse(req.body);
    const existingCount = await Address.countDocuments({ user: req.user._id });
    const isDefault = data.isDefault ?? existingCount === 0;
    if (isDefault) await clearDefault(req.user._id);
    const address = await Address.create({ ...data, user: req.user._id, isDefault });
    return sendSuccess(res, 'Address created', { address }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const data = updateAddressValidator.parse(req.body);
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return sendError(res, 'Address not found', ['No address exists with that ID.'], 404);
    if (data.isDefault === true) await clearDefault(req.user._id);
    Object.assign(address, data);
    await address.save();
    return sendSuccess(res, 'Address updated', { address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return sendError(res, 'Address not found', ['No address exists with that ID.'], 404);
    const wasDefault = address.isDefault;
    await address.deleteOne();
    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }
    return sendSuccess(res, 'Address deleted', {});
  } catch (error) {
    next(error);
  }
};
