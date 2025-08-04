"""
Advanced Settlement Algorithm for RoomLedger
Netlify Functions endpoint for optimized debt settlement calculations
"""

import json
import time
from typing import Dict, List, Tuple
from dataclasses import dataclass
import heapq


@dataclass
class Person:
    id: int
    name: str
    balance: float


@dataclass
class Settlement:
    from_id: int
    to_id: int
    fromName: str
    toName: str
    amount: float


class AdvancedSettlementCalculator:
    """
    Advanced settlement algorithm using multiple optimization strategies
    """
    
    def __init__(self):
        self.computation_start = None
        
    def calculate_optimal_settlement(self, balances: Dict[int, float], members: List[Dict]) -> Dict:
        """
        Calculate optimal settlement using advanced algorithms
        """
        self.computation_start = time.time()
        
        # Convert to Person objects
        people = []
        member_lookup = {m['id']: m['username'] for m in members}
        
        for person_id, balance in balances.items():
            if abs(balance) > 0.01:  # Only include people with non-zero balances
                people.append(Person(
                    id=person_id,
                    name=member_lookup.get(person_id, f"User_{person_id}"),
                    balance=balance
                ))
        
        # Try different algorithms and pick the best one
        algorithms = [
            ("Greedy Heap", self._greedy_heap_algorithm),
            ("Min-Max Flow", self._min_max_flow_algorithm),
            ("Balanced Partition", self._balanced_partition_algorithm)
        ]
        
        best_result = None
        best_algorithm = None
        min_transactions = float('inf')
        
        for algo_name, algo_func in algorithms:
            try:
                result = algo_func(people.copy())
                if len(result) < min_transactions:
                    min_transactions = len(result)
                    best_result = result
                    best_algorithm = algo_name
            except Exception as e:
                print(f"Algorithm {algo_name} failed: {e}")
                continue
        
        # Fallback to simple algorithm if all advanced ones fail
        if best_result is None:
            best_result = self._simple_greedy_algorithm(people)
            best_algorithm = "Simple Greedy (Fallback)"
        
        computation_time = (time.time() - self.computation_start) * 1000  # Convert to ms
        
        # Calculate efficiency metrics
        total_balance = sum(abs(p.balance) for p in people if p.balance > 0)
        original_transactions = len([p for p in people if p.balance != 0])
        efficiency_percentage = max(0, (1 - len(best_result) / max(1, original_transactions)) * 100)
        
        return {
            "settlements": best_result,
            "optimization_info": {
                "algorithm": best_algorithm,
                "computation_time": round(computation_time, 2),
                "efficiency_percentage": round(efficiency_percentage, 1),
                "total_amount": round(total_balance, 2),
                "transactions_reduced": original_transactions - len(best_result)
            }
        }
    
    def _greedy_heap_algorithm(self, people: List[Person]) -> List[Dict]:
        """
        Advanced greedy algorithm using heaps for optimal pairing
        """
        settlements = []
        
        # Separate creditors and debtors using heaps
        creditors = []  # Max heap (negative values for max behavior)
        debtors = []    # Max heap (negative values for max behavior)
        
        for person in people:
            if person.balance > 0.01:
                heapq.heappush(creditors, (-person.balance, person))
            elif person.balance < -0.01:
                heapq.heappush(debtors, (person.balance, person))  # Already negative
        
        while creditors and debtors:
            # Get the largest creditor and debtor
            creditor_balance, creditor = heapq.heappop(creditors)
            creditor_balance = -creditor_balance  # Convert back to positive
            
            debtor_balance, debtor = heapq.heappop(debtors)
            debtor_amount = -debtor_balance  # Convert to positive amount owed
            
            # Calculate settlement amount
            settle_amount = min(creditor_balance, debtor_amount)
            
            settlements.append({
                "from": debtor.id,
                "to": creditor.id,
                "fromName": debtor.name,
                "toName": creditor.name,
                "amount": settle_amount
            })
            
            # Update balances
            creditor.balance -= settle_amount
            debtor.balance += settle_amount
            
            # Re-add if they still have non-zero balances
            if creditor.balance > 0.01:
                heapq.heappush(creditors, (-creditor.balance, creditor))
            if debtor.balance < -0.01:
                heapq.heappush(debtors, (debtor.balance, debtor))
        
        return settlements
    
    def _min_max_flow_algorithm(self, people: List[Person]) -> List[Dict]:
        """
        Network flow inspired algorithm for minimal transactions
        """
        settlements = []
        creditors = [p for p in people if p.balance > 0.01]
        debtors = [p for p in people if p.balance < -0.01]
        
        # Sort by balance for better pairing
        creditors.sort(key=lambda x: x.balance, reverse=True)
        debtors.sort(key=lambda x: x.balance)
        
        i, j = 0, 0
        while i < len(creditors) and j < len(debtors):
            creditor = creditors[i]
            debtor = debtors[j]
            
            settle_amount = min(creditor.balance, -debtor.balance)
            
            settlements.append({
                "from": debtor.id,
                "to": creditor.id,
                "fromName": debtor.name,
                "toName": creditor.name,
                "amount": settle_amount
            })
            
            creditor.balance -= settle_amount
            debtor.balance += settle_amount
            
            if creditor.balance <= 0.01:
                i += 1
            if debtor.balance >= -0.01:
                j += 1
        
        return settlements
    
    def _balanced_partition_algorithm(self, people: List[Person]) -> List[Dict]:
        """
        Algorithm that tries to balance the number of transactions per person
        """
        settlements = []
        people_with_balance = [p for p in people if abs(p.balance) > 0.01]
        
        # Sort by absolute balance descending
        people_with_balance.sort(key=lambda x: abs(x.balance), reverse=True)
        
        while len(people_with_balance) > 1:
            # Find best pair to settle
            best_pair = None
            best_amount = 0
            
            for i in range(len(people_with_balance)):
                for j in range(i + 1, len(people_with_balance)):
                    p1, p2 = people_with_balance[i], people_with_balance[j]
                    
                    # Only pair creditor with debtor
                    if (p1.balance > 0 and p2.balance < 0) or (p1.balance < 0 and p2.balance > 0):
                        amount = min(abs(p1.balance), abs(p2.balance))
                        if amount > best_amount:
                            best_amount = amount
                            if p1.balance > 0:
                                best_pair = (p2, p1, amount)  # debtor, creditor, amount
                            else:
                                best_pair = (p1, p2, amount)  # debtor, creditor, amount
            
            if not best_pair:
                break
            
            debtor, creditor, amount = best_pair
            
            settlements.append({
                "from": debtor.id,
                "to": creditor.id,
                "fromName": debtor.name,
                "toName": creditor.name,
                "amount": amount
            })
            
            # Update balances
            debtor.balance += amount
            creditor.balance -= amount
            
            # Remove people with zero balance
            people_with_balance = [p for p in people_with_balance if abs(p.balance) > 0.01]
        
        return settlements
    
    def _simple_greedy_algorithm(self, people: List[Person]) -> List[Dict]:
        """
        Simple greedy algorithm as fallback
        """
        settlements = []
        creditors = [p for p in people if p.balance > 0.01]
        debtors = [p for p in people if p.balance < -0.01]
        
        i, j = 0, 0
        while i < len(creditors) and j < len(debtors):
            creditor = creditors[i]
            debtor = debtors[j]
            
            settle_amount = min(creditor.balance, -debtor.balance)
            
            settlements.append({
                "from": debtor.id,
                "to": creditor.id,
                "fromName": debtor.name,
                "toName": creditor.name,
                "amount": settle_amount
            })
            
            creditor.balance -= settle_amount
            debtor.balance += settle_amount
            
            if creditor.balance <= 0.01:
                i += 1
            if debtor.balance >= -0.01:
                j += 1
        
        return settlements


def handler(event, context):
    """
    Netlify Functions handler
    """
    try:
        # Handle CORS preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': ''
            }
        
        # Parse request body
        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': 'Request body is required'})
            }
        
        data = json.loads(event['body'])
        balances = data.get('balances', {})
        members = data.get('members', [])
        
        # Convert string keys to integers
        balances = {int(k): float(v) for k, v in balances.items()}
        
        # Calculate settlement
        calculator = AdvancedSettlementCalculator()
        result = calculator.calculate_optimal_settlement(balances, members)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(result)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }


# For local testing
if __name__ == "__main__":
    # Test the algorithm
    test_balances = {1: 100, 2: -50, 3: -50}
    test_members = [
        {'id': 1, 'username': 'Alice'},
        {'id': 2, 'username': 'Bob'},
        {'id': 3, 'username': 'Charlie'}
    ]
    
    calculator = AdvancedSettlementCalculator()
    result = calculator.calculate_optimal_settlement(test_balances, test_members)
    print(json.dumps(result, indent=2))