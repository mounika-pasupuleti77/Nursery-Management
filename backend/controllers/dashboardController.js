const Bill = require('../models/Bill');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const Settings = require('../models/Settings');
const Plant = require('../models/Plant');

const getDashboardSummary = async (req, res) => {
  try {
    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };

    // 1. Today's Date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayBills = await Bill.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      paymentStatus: { $ne: 'Cancelled' }
    });

    const todaySales = todayBills.reduce((acc, b) => acc + b.grandTotal, 0);
    const todayBillCount = todayBills.length;

    // 2. Batches stats
    const batches = await Batch.find().populate('plantId varietyId');
    let totalStockInitial = 0;
    let totalStockAvailable = 0;

    const lowStockBatches = [];
    const readyBatches = [];
    const now = new Date();

    batches.forEach(b => {
      b.calculateStatus(settings.lowStockThreshold);
      totalStockInitial += b.initialQuantity;
      totalStockAvailable += b.availableQuantity;

      if (b.availableQuantity > 0 && b.availableQuantity <= settings.lowStockThreshold) {
        lowStockBatches.push(b);
      }

      if (b.availableQuantity > 0 && new Date(b.readyDate) <= now) {
        readyBatches.push(b);
      }
    });

    // 3. Customer Pending Amount
    const customers = await Customer.find();
    const totalPendingAmount = customers.reduce((acc, c) => acc + c.pendingAmount, 0);

    // 4. Payment breakdown (all active bills)
    const allBills = await Bill.find({ paymentStatus: { $ne: 'Cancelled' } });
    let cashSales = 0;
    let upiSales = 0;
    let creditSales = 0;

    allBills.forEach(b => {
      if (b.paymentMode === 'Cash') cashSales += b.grandTotal;
      if (b.paymentMode === 'UPI') upiSales += b.grandTotal;
      if (b.paymentMode === 'Credit') creditSales += b.grandTotal;
    });

    // 5. Stock breakdown by Plant
    const plants = await Plant.find();
    const stockByPlantMap = {};

    plants.forEach(p => {
      stockByPlantMap[p.name] = 0;
    });

    batches.forEach(b => {
      const plantName = b.plantId ? b.plantId.name : 'Other';
      if (!stockByPlantMap[plantName]) stockByPlantMap[plantName] = 0;
      stockByPlantMap[plantName] += b.availableQuantity;
    });

    const stockByPlant = Object.keys(stockByPlantMap).map(name => ({
      name,
      availableQuantity: stockByPlantMap[name]
    }));

    // 6. Recent 5 Bills
    const recentBills = await Bill.find()
      .populate('customerId', 'farmerName mobile village')
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Last 7 Days Daily Sales trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStart = new Date(d);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dayBills = allBills.filter(b => {
        const bDate = new Date(b.createdAt);
        return bDate >= dStart && bDate <= dEnd;
      });

      const dayTotal = dayBills.reduce((acc, b) => acc + b.grandTotal, 0);
      last7Days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        sales: dayTotal,
        bills: dayBills.length
      });
    }

    res.json({
      kpis: {
        todaySales,
        todayBillCount,
        totalStock: totalStockInitial,
        remainingStock: totalStockAvailable,
        pendingAmount: totalPendingAmount
      },
      paymentBreakdown: [
        { name: 'Cash', value: cashSales, color: '#16a34a' },
        { name: 'UPI', value: upiSales, color: '#0284c7' },
        { name: 'Credit', value: creditSales, color: '#eab308' }
      ],
      stockByPlant,
      lowStockBatches,
      readyBatches,
      recentBills,
      salesTrend: last7Days
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary };
