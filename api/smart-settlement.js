const EPSILON = 0.01;

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function clonePeople(people) {
  return people.map(person => ({ ...person }));
}

function greedyHeapAlgorithm(people) {
  const settlements = [];
  const creditors = [];
  const debtors = [];

  for (const person of people) {
    if (person.balance > EPSILON) {
      creditors.push({ ...person });
    } else if (person.balance < -EPSILON) {
      debtors.push({ ...person });
    }
  }

  while (creditors.length && debtors.length) {
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    const creditor = creditors.shift();
    const debtor = debtors.shift();

    const settleAmount = Math.min(creditor.balance, -debtor.balance);
    const amount = roundCurrency(settleAmount);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      fromName: debtor.name,
      toName: creditor.name,
      amount,
    });

    creditor.balance = roundCurrency(creditor.balance - amount);
    debtor.balance = roundCurrency(debtor.balance + amount);

    if (creditor.balance > EPSILON) {
      creditors.push(creditor);
    }
    if (debtor.balance < -EPSILON) {
      debtors.push(debtor);
    }
  }

  return settlements;
}

function minMaxFlowAlgorithm(people) {
  const settlements = [];
  const creditors = people.filter(person => person.balance > EPSILON).map(person => ({ ...person }));
  const debtors = people.filter(person => person.balance < -EPSILON).map(person => ({ ...person }));

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settleAmount = Math.min(creditor.balance, -debtor.balance);
    const amount = roundCurrency(settleAmount);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      fromName: debtor.name,
      toName: creditor.name,
      amount,
    });

    creditor.balance = roundCurrency(creditor.balance - amount);
    debtor.balance = roundCurrency(debtor.balance + amount);

    if (creditor.balance <= EPSILON) {
      i += 1;
    }
    if (debtor.balance >= -EPSILON) {
      j += 1;
    }
  }

  return settlements;
}

function balancedPartitionAlgorithm(people) {
  let peopleWithBalance = people
    .filter(person => Math.abs(person.balance) > EPSILON)
    .map(person => ({ ...person }));

  const settlements = [];

  while (peopleWithBalance.length > 1) {
    let bestPair = null;
    let bestAmount = 0;

    for (let i = 0; i < peopleWithBalance.length; i += 1) {
      for (let j = i + 1; j < peopleWithBalance.length; j += 1) {
        const p1 = peopleWithBalance[i];
        const p2 = peopleWithBalance[j];

        if ((p1.balance > EPSILON && p2.balance < -EPSILON) || (p1.balance < -EPSILON && p2.balance > EPSILON)) {
          const amount = Math.min(Math.abs(p1.balance), Math.abs(p2.balance));

          if (amount > bestAmount + EPSILON) {
            if (p1.balance > 0) {
              bestPair = { debtorIndex: j, creditorIndex: i, amount };
            } else {
              bestPair = { debtorIndex: i, creditorIndex: j, amount };
            }
            bestAmount = amount;
          }
        }
      }
    }

    if (!bestPair) {
      break;
    }

    const debtor = peopleWithBalance[bestPair.debtorIndex];
    const creditor = peopleWithBalance[bestPair.creditorIndex];
    const amount = roundCurrency(bestPair.amount);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      fromName: debtor.name,
      toName: creditor.name,
      amount,
    });

    debtor.balance = roundCurrency(debtor.balance + amount);
    creditor.balance = roundCurrency(creditor.balance - amount);

    peopleWithBalance = peopleWithBalance
      .filter(person => Math.abs(person.balance) > EPSILON)
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }

  return settlements;
}

function simpleGreedyAlgorithm(people) {
  const settlements = [];
  const creditors = people.filter(person => person.balance > EPSILON).map(person => ({ ...person }));
  const debtors = people.filter(person => person.balance < -EPSILON).map(person => ({ ...person }));

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settleAmount = Math.min(creditor.balance, -debtor.balance);
    const amount = roundCurrency(settleAmount);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      fromName: debtor.name,
      toName: creditor.name,
      amount,
    });

    creditor.balance = roundCurrency(creditor.balance - amount);
    debtor.balance = roundCurrency(debtor.balance + amount);

    if (creditor.balance <= EPSILON) {
      i += 1;
    }
    if (debtor.balance >= -EPSILON) {
      j += 1;
    }
  }

  return settlements;
}

function calculateOptimalSettlement(balances, members) {
  const memberLookup = new Map();

  for (const member of members) {
    if (member && typeof member.id !== 'undefined') {
      const id = Number(member.id);
      if (!Number.isNaN(id)) {
        const name = member.display_name || member.username || member.name || `User_${id}`;
        memberLookup.set(id, name);
      }
    }
  }

  const people = [];

  for (const [key, value] of Object.entries(balances)) {
    const id = Number(key);
    const numericBalance = Number(value);

    if (!Number.isNaN(id) && !Number.isNaN(numericBalance) && Math.abs(numericBalance) > EPSILON) {
      people.push({
        id,
        name: memberLookup.get(id) || `User_${id}`,
        balance: roundCurrency(numericBalance),
      });
    }
  }

  if (!people.length) {
    return {
      settlements: [],
      optimization_info: {
        algorithm: 'No balances',
        computation_time: 0,
        efficiency_percentage: 100,
        total_amount: 0,
        transactions_reduced: 0,
      },
    };
  }

  const algorithms = [
    { name: 'Greedy Heap', func: greedyHeapAlgorithm },
    { name: 'Min-Max Flow', func: minMaxFlowAlgorithm },
    { name: 'Balanced Partition', func: balancedPartitionAlgorithm },
  ];

  let bestResult = null;
  let bestAlgorithm = null;
  let minTransactions = Infinity;

  const start = Date.now();

  for (const algorithm of algorithms) {
    try {
      const result = algorithm.func(clonePeople(people));

      if (result.length < minTransactions) {
        minTransactions = result.length;
        bestResult = result;
        bestAlgorithm = algorithm.name;
      }
    } catch (error) {
      console.error(`Algorithm ${algorithm.name} failed`, error);
    }
  }

  if (!bestResult) {
    bestResult = simpleGreedyAlgorithm(clonePeople(people));
    bestAlgorithm = 'Simple Greedy (Fallback)';
  }

  const computationTime = roundCurrency(Date.now() - start);
  const totalBalance = people.filter(person => person.balance > EPSILON).reduce((sum, person) => sum + person.balance, 0);
  const originalTransactions = people.length;
  const efficiencyPercentage = originalTransactions
    ? Math.max(0, (1 - bestResult.length / originalTransactions) * 100)
    : 100;
  const roundedEfficiency = Math.round(efficiencyPercentage * 10) / 10;

  return {
    settlements: bestResult,
    optimization_info: {
      algorithm: bestAlgorithm,
      computation_time: computationTime,
      efficiency_percentage: roundedEfficiency,
      total_amount: roundCurrency(totalBalance),
      transactions_reduced: Math.max(0, originalTransactions - bestResult.length),
    },
  };
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const balances = payload.balances || {};
    const members = Array.isArray(payload.members) ? payload.members : [];

    const result = calculateOptimalSettlement(balances, members);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    console.error('smart-settlement error', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

