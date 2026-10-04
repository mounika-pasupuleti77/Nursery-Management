const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Settings = require('../models/Settings');
const Plant = require('../models/Plant');
const Variety = require('../models/Variety');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Wastage = require('../models/Wastage');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');

    await Promise.all([
      User.deleteMany({}),
      Settings.deleteMany({}),
      Plant.deleteMany({}),
      Variety.deleteMany({}),
      Batch.deleteMany({}),
      Customer.deleteMany({}),
      Bill.deleteMany({}),
      Payment.deleteMany({}),
      Expense.deleteMany({}),
      Wastage.deleteMany({})
    ]);

    // 1. Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Nursery Admin',
      email: 'admin@annadata.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Created Admin User: admin@annadata.com / admin123');

    // 2. Settings
    const settings = await Settings.create({
      nurseryName: 'ANNADATA NURSERY',
      tagline: 'Quality Seedlings • Better Yield • Farmer Trust',
      ownerName: 'Ramesh Patel',
      mobileNumber: '9876543210',
      address: 'Plot 42, Agriculture Nursery Zone, NH-44',
      village: 'Kisanpur',
      gstNumber: '36ABCDE1234F1Z5',
      billPrefix: 'AN',
      lowStockThreshold: 1000,
      currencySymbol: '₹'
    });
    console.log('Created Settings');

    // 3. Plants
    const tomato = await Plant.create({ name: 'Tomato', description: 'High yield tomato seedlings', status: 'Active' });
    const mirchi = await Plant.create({ name: 'Mirchi', description: 'Disease resistant chilli varieties', status: 'Active' });
    const brinjal = await Plant.create({ name: 'Brinjal', description: 'Premium brinjal/eggplant seedlings', status: 'Active' });
    const cabbage = await Plant.create({ name: 'Cabbage', description: 'Fast growing cabbage seedlings', status: 'Active' });

    // 4. Varieties
    const tomVar1 = await Variety.create({ plantId: tomato._id, name: 'Tomato Hybrid 101', defaultRate: 1.20, description: 'Disease resistant hybrid tomato' });
    const tomVar2 = await Variety.create({ plantId: tomato._id, name: 'Tomato Local Country', defaultRate: 0.80, description: 'Traditional local variety' });
    
    const mirVar1 = await Variety.create({ plantId: mirchi._id, name: 'Mirchi Hybrid 702', defaultRate: 0.90, description: 'High pungency hybrid chilli' });
    const mirVar2 = await Variety.create({ plantId: mirchi._id, name: 'Mirchi Guntur Special', defaultRate: 0.75, description: 'Guntur red chilli variety' });
    
    const brinVar1 = await Variety.create({ plantId: brinjal._id, name: 'Brinjal Purple Round', defaultRate: 1.00, description: 'Glossy purple round variety' });
    const brinVar2 = await Variety.create({ plantId: brinjal._id, name: 'Brinjal Green Long', defaultRate: 1.10, description: 'Tender green long variety' });

    const cabVar1 = await Variety.create({ plantId: cabbage._id, name: 'Cabbage Golden Acre', defaultRate: 1.50, description: 'Compact head cabbage' });

    // 5. Batches
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 30);

    const pastReady = new Date(today);
    pastReady.setDate(today.getDate() - 5);

    const futureReady = new Date(today);
    futureReady.setDate(today.getDate() + 12);

    const batch1 = new Batch({
      batchNumber: 'TOM-2026-001',
      plantId: tomato._id,
      varietyId: tomVar1._id,
      sowingDate: pastDate,
      readyDate: pastReady,
      initialQuantity: 10000,
      soldQuantity: 6000,
      wastage: 200,
      availableQuantity: 3800,
      rate: 1.20,
      notes: 'First batch of Tomato Hybrid 101'
    });
    batch1.calculateStatus(settings.lowStockThreshold);
    await batch1.save();

    const batch2 = new Batch({
      batchNumber: 'TOM-2026-002',
      plantId: tomato._id,
      varietyId: tomVar2._id,
      sowingDate: pastDate,
      readyDate: pastReady,
      initialQuantity: 8000,
      soldQuantity: 7400,
      wastage: 100,
      availableQuantity: 500, // Low stock!
      rate: 0.80,
      notes: 'High demand local variety'
    });
    batch2.calculateStatus(settings.lowStockThreshold);
    await batch2.save();

    const batch3 = new Batch({
      batchNumber: 'MIR-2026-001',
      plantId: mirchi._id,
      varietyId: mirVar1._id,
      sowingDate: pastDate,
      readyDate: pastReady,
      initialQuantity: 15000,
      soldQuantity: 5000,
      wastage: 300,
      availableQuantity: 9700,
      rate: 0.90,
      notes: 'Healthy saplings'
    });
    batch3.calculateStatus(settings.lowStockThreshold);
    await batch3.save();

    const batch4 = new Batch({
      batchNumber: 'BRIN-2026-001',
      plantId: brinjal._id,
      varietyId: brinVar1._id,
      sowingDate: today,
      readyDate: futureReady,
      initialQuantity: 6000,
      soldQuantity: 0,
      wastage: 0,
      availableQuantity: 6000,
      rate: 1.00,
      notes: 'Recently sown, ready in 12 days'
    });
    batch4.calculateStatus(settings.lowStockThreshold);
    await batch4.save();

    // Record wastage entry for batch1 & batch3
    await Wastage.create([
      { batchId: batch1._id, quantity: 200, reason: 'Heavy rainfall damage', date: pastReady, notes: 'Trays affected by rainwater overflow' },
      { batchId: batch3._id, quantity: 300, reason: 'Damping off fungal issue', date: pastReady, notes: 'Treated with fungicide' }
    ]);

    // 6. Customers
    const customers = await Customer.create([
      { customerId: 'CUST-001', farmerName: 'Ramesh Gowda', mobile: '9845012345', village: 'Kisanpur', address: 'Near Bus Stand, Kisanpur', totalPurchase: 7200, totalPaid: 5000, pendingAmount: 2200 },
      { customerId: 'CUST-002', farmerName: 'Suresh Patel', mobile: '9731234567', village: 'Rampur', address: 'Plot 12, Rampur Road', totalPurchase: 4500, totalPaid: 4500, pendingAmount: 0 },
      { customerId: 'CUST-003', farmerName: 'Anjaneyulu Reddy', mobile: '9988776655', village: 'Ananthapur', address: 'Main Street', totalPurchase: 3600, totalPaid: 2000, pendingAmount: 1600 },
      { customerId: 'CUST-004', farmerName: 'Mahendra Singh', mobile: '9123456789', village: 'Greenfield', address: 'Farmhouse #3', totalPurchase: 6000, totalPaid: 6000, pendingAmount: 0 },
      { customerId: 'CUST-005', farmerName: 'Venkatesh Rao', mobile: '9440112233', village: 'Kisanpur', address: 'Bypass Road', totalPurchase: 2400, totalPaid: 1000, pendingAmount: 1400 },
      { customerId: 'CUST-006', farmerName: 'Prakash Sharma', mobile: '9812345678', village: 'Sundarpur', address: 'Near Temple', totalPurchase: 1800, totalPaid: 1800, pendingAmount: 0 },
      { customerId: 'CUST-007', farmerName: 'Balram Yadav', mobile: '9911223344', village: 'Rampur', address: 'Lake Side Farm', totalPurchase: 3200, totalPaid: 2000, pendingAmount: 1200 },
      { customerId: 'CUST-008', farmerName: 'Hanumanthappa', mobile: '9887766554', village: 'Vijaynagar', address: 'Post Office Road', totalPurchase: 5400, totalPaid: 5400, pendingAmount: 0 }
    ]);

    // 7. Bills
    const cust1 = customers[0];
    const cust2 = customers[1];
    const cust3 = customers[2];

    const bill1 = await Bill.create({
      billNumber: 'AN-00001',
      customerId: cust1._id,
      items: [
        {
          plantId: tomato._id,
          plantName: tomato.name,
          varietyId: tomVar1._id,
          varietyName: tomVar1.name,
          batchId: batch1._id,
          batchNumber: batch1.batchNumber,
          quantity: 5000,
          rate: 1.20,
          discount: 0,
          amount: 6000
        },
        {
          plantId: mirchi._id,
          plantName: mirchi.name,
          varietyId: mirVar1._id,
          varietyName: mirVar1.name,
          batchId: batch3._id,
          batchNumber: batch3.batchNumber,
          quantity: 1400,
          rate: 0.90,
          discount: 60,
          amount: 1200
        }
      ],
      subtotal: 7260,
      discount: 60,
      grandTotal: 7200,
      paidAmount: 5000,
      pendingAmount: 2200,
      paymentMode: 'Credit',
      paymentStatus: 'Partially Paid',
      createdAt: pastReady
    });

    const bill2 = await Bill.create({
      billNumber: 'AN-00002',
      customerId: cust2._id,
      items: [
        {
          plantId: tomato._id,
          plantName: tomato.name,
          varietyId: tomVar2._id,
          varietyName: tomVar2.name,
          batchId: batch2._id,
          batchNumber: batch2.batchNumber,
          quantity: 5000,
          rate: 0.80,
          discount: 0,
          amount: 4000
        }
      ],
      subtotal: 4000,
      discount: 0,
      grandTotal: 4000,
      paidAmount: 4000,
      pendingAmount: 0,
      paymentMode: 'UPI',
      paymentStatus: 'Paid',
      createdAt: today
    });

    const bill3 = await Bill.create({
      billNumber: 'AN-00003',
      customerId: cust3._id,
      items: [
        {
          plantId: tomato._id,
          plantName: tomato.name,
          varietyId: tomVar1._id,
          varietyName: tomVar1.name,
          batchId: batch1._id,
          batchNumber: batch1.batchNumber,
          quantity: 1000,
          rate: 1.20,
          discount: 0,
          amount: 1200
        },
        {
          plantId: mirchi._id,
          plantName: mirchi.name,
          varietyId: mirVar1._id,
          varietyName: mirVar1.name,
          batchId: batch3._id,
          batchNumber: batch3.batchNumber,
          quantity: 3000,
          rate: 0.90,
          discount: 300,
          amount: 2400
        }
      ],
      subtotal: 3900,
      discount: 300,
      grandTotal: 3600,
      paidAmount: 2000,
      pendingAmount: 1600,
      paymentMode: 'Credit',
      paymentStatus: 'Partially Paid',
      createdAt: today
    });

    // 8. Payments
    await Payment.create([
      { customerId: cust1._id, billId: bill1._id, amount: 5000, paymentMode: 'Cash', date: pastReady, notes: 'Advance payment during billing' },
      { customerId: cust2._id, billId: bill2._id, amount: 4000, paymentMode: 'UPI', date: today, notes: 'Full payment via GooglePay' },
      { customerId: cust3._id, billId: bill3._id, amount: 2000, paymentMode: 'Cash', date: today, notes: 'Partial cash payment' }
    ]);

    // 9. Expenses
    await Expense.create([
      { expenseId: 'EXP-001', date: pastDate, category: 'Seeds', description: 'Tomato Hybrid 101 raw seeds purchase (100g)', amount: 3500, paymentMethod: 'UPI', notes: 'Purchased from Mahyco dealer' },
      { expenseId: 'EXP-002', date: pastDate, category: 'Fertilizer', description: 'Coco peat bags & Vermicompost 500kg', amount: 4200, paymentMethod: 'Cash', notes: 'Nursery tray potting mix' },
      { expenseId: 'EXP-003', date: pastReady, category: 'Labour', description: 'Sowing & tray filling labor charges (4 workers x 2 days)', amount: 2400, paymentMethod: 'Cash', notes: 'Daily wage payment' },
      { expenseId: 'EXP-004', date: today, category: 'Electricity', description: 'Monthly borewell pump electricity bill', amount: 1850, paymentMethod: 'UPI', notes: 'Electricity board payment' },
      { expenseId: 'EXP-005', date: today, category: 'Transportation', description: 'Seedling delivery auto freight charges', amount: 800, paymentMethod: 'Cash', notes: 'Delivery to Rampur village' }
    ]);

    console.log('Seed data successfully loaded!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

if (require.main === module) {
  seedData().then(() => mongoose.connection.close());
}

module.exports = seedData;
