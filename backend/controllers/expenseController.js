const Expense = require('../models/Expense');

const generateExpenseId = async () => {
  const count = await Expense.countDocuments();
  return `EXP-${String(count + 1).padStart(3, '0')}`;
};

const getExpenses = async (req, res) => {
  try {
    const { category, search, startDate, endDate } = req.query;
    let filter = {};

    if (category) filter.category = category;

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { expenseId: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { date, category, description, amount, paymentMethod, notes } = req.body;

    if (!category || !description || amount === undefined || Number(amount) < 0) {
      return res.status(400).json({ message: 'Category, description, and valid positive amount are required' });
    }

    const expenseId = await generateExpenseId();

    const expense = await Expense.create({
      expenseId,
      date: date || new Date(),
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || ''
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
