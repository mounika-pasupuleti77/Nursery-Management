const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

const generateCustomerId = async () => {
  const count = await Customer.countDocuments();
  return `CUST-${String(count + 1).padStart(3, '0')}`;
};

const getCustomers = async (req, res) => {
  try {
    const { search, village } = req.query;
    let filter = {};

    if (village) {
      filter.village = { $regex: village, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { farmerName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const bills = await Bill.find({ customerId: id }).sort({ createdAt: -1 });
    const payments = await Payment.find({ customerId: id }).sort({ date: -1 });

    res.json({
      customer,
      bills,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { farmerName, mobile, village, address } = req.body;

    if (!farmerName || !mobile) {
      return res.status(400).json({ message: 'Farmer name and mobile number are required' });
    }

    // Check for existing mobile number
    const existing = await Customer.findOne({ mobile: mobile.trim() });
    if (existing) {
      return res.status(400).json({ message: `Customer with mobile ${mobile} already exists (${existing.farmerName})` });
    }

    const customerId = await generateCustomerId();

    const customer = await Customer.create({
      customerId,
      farmerName: farmerName.trim(),
      mobile: mobile.trim(),
      village: village ? village.trim() : '',
      address: address ? address.trim() : '',
      totalPurchase: 0,
      totalPaid: 0,
      pendingAmount: 0
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { farmerName, mobile, village, address } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (farmerName) customer.farmerName = farmerName.trim();
    if (mobile) customer.mobile = mobile.trim();
    if (village !== undefined) customer.village = village.trim();
    if (address !== undefined) customer.address = address.trim();

    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const billCount = await Bill.countDocuments({ customerId: id });
    if (billCount > 0) {
      return res.status(400).json({ message: 'Cannot delete customer with existing bill transactions' });
    }

    await Customer.findByIdAndDelete(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
