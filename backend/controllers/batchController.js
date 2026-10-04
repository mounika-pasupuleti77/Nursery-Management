const Batch = require('../models/Batch');
const Wastage = require('../models/Wastage');
const Settings = require('../models/Settings');

const getBatches = async (req, res) => {
  try {
    const { plantId, varietyId, status, search } = req.query;
    let filter = {};

    if (plantId) filter.plantId = plantId;
    if (varietyId) filter.varietyId = varietyId;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { batchNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };
    const batches = await Batch.find(filter)
      .populate('plantId', 'name')
      .populate('varietyId', 'name defaultRate')
      .sort({ createdAt: -1 });

    // Recalculate status dynamically for accuracy
    const updatedBatches = await Promise.all(
      batches.map(async (batch) => {
        batch.calculateStatus(settings.lowStockThreshold);
        await batch.save();
        return batch;
      })
    );

    res.json(updatedBatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const { batchNumber, plantId, varietyId, sowingDate, readyDate, initialQuantity, rate, notes } = req.body;

    if (!batchNumber || !plantId || !varietyId || !sowingDate || !readyDate || initialQuantity === undefined || rate === undefined) {
      return res.status(400).json({ message: 'All required batch fields must be provided' });
    }

    if (new Date(sowingDate) > new Date(readyDate)) {
      return res.status(400).json({ message: 'Sowing date cannot be after Ready date' });
    }

    const existing = await Batch.findOne({ batchNumber: batchNumber.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: `Batch number '${batchNumber}' already exists` });
    }

    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };

    const batch = new Batch({
      batchNumber: batchNumber.trim().toUpperCase(),
      plantId,
      varietyId,
      sowingDate,
      readyDate,
      initialQuantity: Number(initialQuantity),
      soldQuantity: 0,
      wastage: 0,
      availableQuantity: Number(initialQuantity),
      rate: Number(rate),
      notes: notes || ''
    });

    batch.calculateStatus(settings.lowStockThreshold);
    await batch.save();

    const populated = await Batch.findById(batch._id)
      .populate('plantId', 'name')
      .populate('varietyId', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const { sowingDate, readyDate, initialQuantity, rate, notes } = req.body;
    if (sowingDate && readyDate && new Date(sowingDate) > new Date(readyDate)) {
      return res.status(400).json({ message: 'Sowing date cannot be after Ready date' });
    }

    if (initialQuantity !== undefined) {
      batch.initialQuantity = Number(initialQuantity);
    }
    if (rate !== undefined) batch.rate = Number(rate);
    if (sowingDate) batch.sowingDate = sowingDate;
    if (readyDate) batch.readyDate = readyDate;
    if (notes !== undefined) batch.notes = notes;

    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };
    batch.calculateStatus(settings.lowStockThreshold);
    await batch.save();

    const populated = await Batch.findById(batch._id)
      .populate('plantId', 'name')
      .populate('varietyId', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    if (batch.soldQuantity > 0) {
      return res.status(400).json({ message: 'Cannot delete batch with existing sales' });
    }
    await Batch.findByIdAndDelete(id);
    await Wastage.deleteMany({ batchId: id });
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordWastage = async (req, res) => {
  try {
    const { id } = req.params; // batchId
    const { quantity, reason, date, notes } = req.body;

    const wastageQty = Number(quantity);
    if (!wastageQty || wastageQty <= 0) {
      return res.status(400).json({ message: 'Wastage quantity must be greater than 0' });
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (wastageQty > batch.availableQuantity) {
      return res.status(400).json({
        message: `Wastage quantity (${wastageQty}) exceeds available stock (${batch.availableQuantity})`
      });
    }

    batch.wastage += wastageQty;
    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };
    batch.calculateStatus(settings.lowStockThreshold);
    await batch.save();

    const wastageRecord = await Wastage.create({
      batchId: id,
      quantity: wastageQty,
      reason: reason || 'Unspecified damage',
      date: date || new Date(),
      notes: notes || ''
    });

    const populatedBatch = await Batch.findById(id)
      .populate('plantId', 'name')
      .populate('varietyId', 'name');

    res.status(201).json({
      message: 'Wastage recorded successfully',
      batch: populatedBatch,
      wastage: wastageRecord
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBatches, createBatch, updateBatch, deleteBatch, recordWastage };
