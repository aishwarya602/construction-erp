import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

def calculate_vendor_score(delivery_delay: float, defect_rate: float, price_deviation: float) -> float:
    """
    Calculates Vendor Performance Score (0-100) using Mamdani Fuzzy Logic Inference.
    - delivery_delay: Delay in days (0 to 30)
    - defect_rate: Percentage of defective items (0% to 20%)
    - price_deviation: Percentage price increase over agreed PO price (0% to 30%)
    """
    # 1. Antecedents (Inputs) & Consequent (Output)
    delay = ctrl.Antecedent(np.arange(0, 31, 1), 'delivery_delay')
    defect = ctrl.Antecedent(np.arange(0, 21, 1), 'defect_rate')
    price_dev = ctrl.Antecedent(np.arange(0, 31, 1), 'price_deviation')
    
    score = ctrl.Consequent(np.arange(0, 101, 1), 'vendor_score')

    # 2. Membership Functions
    # Delay: Low (0-5), Medium (3-15), High (10-30)
    delay['low'] = fuzz.trimf(delay.universe, [0, 0, 5])
    delay['medium'] = fuzz.trimf(delay.universe, [3, 10, 15])
    delay['high'] = fuzz.trapmf(delay.universe, [10, 20, 30, 30])

    # Defect Rate: Low (0-2%), Medium (1-5%), High (4-20%)
    defect['low'] = fuzz.trimf(defect.universe, [0, 0, 2])
    defect['medium'] = fuzz.trimf(defect.universe, [1, 3, 5])
    defect['high'] = fuzz.trapmf(defect.universe, [4, 10, 20, 20])

    # Price Deviation: Low (0-5%), Medium (3-10%), High (8-30%)
    price_dev['low'] = fuzz.trimf(price_dev.universe, [0, 0, 5])
    price_dev['medium'] = fuzz.trimf(price_dev.universe, [3, 7, 10])
    price_dev['high'] = fuzz.trapmf(price_dev.universe, [8, 15, 30, 30])

    # Vendor Score: Poor (0-40), Average (30-70), Excellent (60-100)
    score['poor'] = fuzz.trimf(score.universe, [0, 0, 40])
    score['average'] = fuzz.trimf(score.universe, [30, 50, 70])
    score['excellent'] = fuzz.trimf(score.universe, [60, 100, 100])

    # 3. Fuzzy Rules
    rule1 = ctrl.Rule(delay['low'] & defect['low'] & price_dev['low'], score['excellent'])
    rule2 = ctrl.Rule(delay['high'] | defect['high'] | price_dev['high'], score['poor'])
    rule3 = ctrl.Rule(delay['medium'] & defect['medium'], score['average'])
    rule4 = ctrl.Rule(delay['low'] & defect['medium'] & price_dev['low'], score['average'])
    rule5 = ctrl.Rule(delay['medium'] & defect['low'] & price_dev['low'], score['excellent'])

    # 4. Control System Setup
    scoring_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5])
    scoring_simulation = ctrl.ControlSystemSimulation(scoring_ctrl)

    # 5. Pass Clipped Inputs to prevent Out-of-Bound errors
    scoring_simulation.input['delivery_delay'] = min(max(delivery_delay, 0), 30)
    scoring_simulation.input['defect_rate'] = min(max(defect_rate, 0), 20)
    scoring_simulation.input['price_deviation'] = min(max(price_deviation, 0), 30)

    # 6. Compute Defuzzification
    scoring_simulation.compute()
    return round(float(scoring_simulation.output['vendor_score']), 2)