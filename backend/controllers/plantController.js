const Plant = require('../models/Plant');
const Variety = require('../models/Variety');

const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find().sort({ name: 1 });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPlant = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Plant name is required' });
    }
    const existing = await Plant.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Plant already exists' });
    }
    const plant = await Plant.create({ name, description, status });
    res.status(201).json(plant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await Plant.findByIdAndUpdate(id, req.body, { new: true });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await Plant.findByIdAndDelete(id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    // Delete associated varieties
    await Variety.deleteMany({ plantId: id });
    res.json({ message: 'Plant and associated varieties removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlants, createPlant, updatePlant, deletePlant };
