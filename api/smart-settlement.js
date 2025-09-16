// Smart Settlement API for Vercel (Node.js)
// Mirrors the output shape used by the frontend and the Netlify Python function

function calculateSettlementGreedy(balances, members) {
  const memberLookup = new Map(members.map(m => [m.id, m.username]));

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([idStr, bal]) => {
    const id = Number(idStr);
    const value = Number(bal);
    if (value > 0.01) {
      creditors.push({ id, amount: value, name: memberLookup.get(id) || `User_${id}` });
    } else if (value < -0.01) {
      debtors.push({ id, amount: -value, name: memberLookup.get(id) || `User_${id}` });
    }
  });

  // Sort largest first to reduce number of transactions
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const settleAmount = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      fromName: debtor.name,
      toName: creditor.name,
      amount: settleAmount
    });

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return settlements;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { balances = {}, members = [] } = req.body || {};

    // Normalize keys to numbers
    const normalizedBalances = Object.fromEntries(
      Object.entries(balances).map(([k, v]) => [Number(k), Number(v)])
    );

    const start = Date.now();
    const settlements = calculateSettlementGreedy(normalizedBalances, members);
    const computationTime = Date.now() - start;

    const totalPositive = Object.values(normalizedBalances)
      .filter(v => v > 0)
      .reduce((a, b) => a + b, 0);
    const originalParticipants = Object.values(normalizedBalances).filter(v => Math.abs(v) > 0.01).length;
    const efficiencyPercentage = Math.max(0, (1 - (settlements.length / Math.max(1, originalParticipants))) * 100);

    res.status(200).json({
      settlements,
      optimization_info: {
        algorithm: 'Greedy (Node.js)',
        computation_time: computationTime,
        efficiency_percentage: Math.round(efficiencyPercentage * 10) / 10,
        total_amount: Math.round(totalPositive * 100) / 100,
        transactions_reduced: originalParticipants - settlements.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

