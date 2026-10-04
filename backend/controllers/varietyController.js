const Variety = require('../models/Variety');

const getVarieties = async (req, res) => {
  try {
    const { plantId } = req.query;
    const filter = plantId ? { plantId } : {};
    const varieties = await Variety.find(filter).populate('plantId', 'name').sort({ name: 1 });
    res.json(varieties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVariety = async (req, res) => {
  try {
    const { plantId, name, defaultRate, description, status } = req.body;
    if (!plantId || !name || defaultRate === undefined) {
      return res.status(400).json({ message: 'Plant, Variety Name, and Default Rate are required' });
    }
    const variety = await Variety.create({ plantId, name, defaultRate, description, status });
    const populated = await Variety.findById(variety._id).populate('plantId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVariety = async (req, res) => {
  try {
    const { id } = req.params;
    const variety = await Variety.findByIdAndUpdate(id, req.body, { new: true }).populate('plantId', 'name');
    if (!variety) {
      return res.status(404).json({ message: 'Variety not found' });
    }
    res.json(variety);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVariety = async (req, res) => {
  try {
    const { id } = req.params;
    const variety = await Variety.findByIdAndDelete(id);
    if (!variety) {
      return res.status(404).json({ message: 'Variety not found' });
    }
    res.json({ message: 'Variety deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVarieties, createVariety, updateVariety, deleteVariety };
