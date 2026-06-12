import sys

# Tarifs de base par défaut (NESTAAN S-09)
DEFAULT_TARIFS = {
    5: { "gt400": 12.23, "range250_400": 12.63, "range150_250": 13.03, "range100_150": 13.30, "range50_100": 13.96, "lt50": 1200 },
    6: { "gt400": 13.39, "range250_400": 13.83, "range150_250": 14.26, "range100_150": 14.56, "range50_100": 15.28, "lt50": 1200 },
    7: { "gt400": 14.55, "range250_400": 15.02, "range150_250": 15.50, "range100_150": 15.82, "range50_100": 16.61, "lt50": 1200 },
    8: { "gt400": 15.71, "range250_400": 16.22, "range150_250": 16.73, "range100_150": 17.08, "range50_100": 17.93, "lt50": 1200 },
    9: { "gt400": 16.87, "range250_400": 17.42, "range150_250": 17.97, "range100_150": 18.34, "range50_100": 19.25, "lt50": 1200 },
    10: { "gt400": 18.03, "range250_400": 18.62, "range150_250": 19.20, "range100_150": 19.60, "range50_100": 20.58, "lt50": 1200 },
    11: { "gt400": 19.19, "range250_400": 19.81, "range150_250": 20.44, "range100_150": 20.86, "range50_100": 21.90, "lt50": 1400 },
    12: { "gt400": 20.35, "range250_400": 21.01, "range150_250": 21.67, "range100_150": 22.12, "range50_100": 23.22, "lt50": 1400 },
    13: { "gt400": 21.50, "range250_400": 22.21, "range150_250": 22.91, "range100_150": 23.38, "range50_100": 24.54, "lt50": 1400 },
    14: { "gt400": 22.66, "range250_400": 23.40, "range150_250": 24.14, "range100_150": 24.64, "range50_100": 25.87, "lt50": 1400 },
    15: { "gt400": 23.82, "range250_400": 24.60, "range150_250": 25.38, "range100_150": 25.90, "range50_100": 27.19, "lt50": 1400 },
    16: { "gt400": 24.98, "range250_400": 25.80, "range150_250": 26.61, "range100_150": 27.16, "range50_100": 28.51, "lt50": 1500 },
    17: { "gt400": 26.14, "range250_400": 26.99, "range150_250": 27.85, "range100_150": 28.42, "range50_100": 29.84, "lt50": 1500 },
    18: { "gt400": 27.30, "range250_400": 28.19, "range150_250": 29.08, "range100_150": 29.68, "range50_100": 31.16, "lt50": 1500 },
    19: { "gt400": 28.46, "range250_400": 29.39, "range150_250": 30.32, "range100_150": 30.94, "range50_100": 32.48, "lt50": 1600 },
    20: { "gt400": 29.62, "range250_400": 30.59, "range150_250": 31.55, "range100_150": 32.20, "range50_100": 33.81, "lt50": 1600 },
    21: { "gt400": 30.78, "range250_400": 31.78, "range150_250": 32.79, "range100_150": 33.46, "range50_100": 35.13, "lt50": 1600 },
    23: { "gt400": 33.10, "range250_400": 34.18, "range150_250": 35.26, "range100_150": 35.98, "range50_100": 37.77, "lt50": 1800 },
    25: { "gt400": 35.42, "range250_400": 36.57, "range150_250": 37.73, "range100_150": 38.50, "range50_100": 40.42, "lt50": 1800 }
}

def calculate(thickness, metrage, client_price, distance_opt, partner_discount, quick_payment, markup=10.0):
    row = DEFAULT_TARIFS.get(thickness)
    if not row:
        raise ValueError(f"Thickness {thickness} not found in database.")
    
    is_forfait = False
    if metrage < 50:
        base_rate = row["lt50"]
        is_forfait = True
    elif metrage < 100:
        base_rate = row["range50_100"]
    elif metrage < 150:
        base_rate = row["range100_150"]
    elif metrage < 250:
        base_rate = row["range150_250"]
    elif metrage <= 400:
        base_rate = row["range250_400"]
    else:
        base_rate = row["gt400"]
        
    # Apply markup
    rate = base_rate * (1 + markup / 100.0)
    
    # Distance multiplier
    if distance_opt == 1:
        rate *= 1.01
    elif distance_opt == 2:
        rate *= 1.02
        
    # Partner discount
    if partner_discount:
        rate *= 0.90
        
    # Quick payment discount
    if quick_payment:
        rate *= 0.98
        
    # Total subcontractor cost
    total_subcontractor = rate if is_forfait else rate * metrage
    
    difference = client_price - total_subcontractor
    margin_percent = (difference / client_price) * 100.0 if client_price > 0 else 0.0
    
    return total_subcontractor, difference, margin_percent

def run_tests():
    print("--- Running Calculator Tests ---")
    
    # Test 1: Surface = 120 m2, Thickness = 10 cm, Client = 10000, distance = 0, no partner, no quick payment
    sub, diff, pct = calculate(thickness=10, metrage=120, client_price=10000, distance_opt=0, partner_discount=False, quick_payment=False)
    print(f"Test 1 - Subcontractor: {sub:.2f}€, Difference: {diff:.2f}€, Margin: {pct:.1f}%")
    assert abs(sub - 2587.20) < 0.01, f"Expected 2587.20, got {sub}"
    assert abs(diff - 7412.80) < 0.01, f"Expected 7412.80, got {diff}"
    assert abs(pct - 74.13) < 0.1, f"Expected ~74.1%, got {pct}"
    print("✅ Test 1 Passed")
    
    # Test 2: Surface = 40 m2 (Forfait), Thickness = 8 cm, Client = 2500, distance = 0, no partner, no quick payment
    sub2, diff2, pct2 = calculate(thickness=8, metrage=40, client_price=2500, distance_opt=0, partner_discount=False, quick_payment=False)
    print(f"Test 2 - Subcontractor: {sub2:.2f}€, Difference: {diff2:.2f}€, Margin: {pct2:.1f}%")
    assert abs(sub2 - 1320.00) < 0.01, f"Expected 1320.00, got {sub2}"
    assert abs(diff2 - 1180.00) < 0.01, f"Expected 1180.00, got {diff2}"
    print("✅ Test 2 Passed")
    
    # Test 3: Surface = 300 m2, Thickness = 15 cm, Distance = 30-60km (+1%), Partner discount (-10%), Quick payment (-2%), Client = 12000
    sub3, diff3, pct3 = calculate(thickness=15, metrage=300, client_price=12000, distance_opt=1, partner_discount=True, quick_payment=True)
    print(f"Test 3 - Subcontractor: {sub3:.2f}€, Difference: {diff3:.2f}€, Margin: {pct3:.1f}%")
    expected_sub = 300 * (24.60 * 1.10 * 1.01 * 0.90 * 0.98) # = 7231.67676
    assert abs(sub3 - expected_sub) < 0.01, f"Expected {expected_sub:.2f}, got {sub3}"
    print("✅ Test 3 Passed")

    print("\n🎉 All tests passed successfully!")

if __name__ == "__main__":
    run_tests()
