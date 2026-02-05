#!/usr/bin/env python3
"""
Stroy Material CRM - Backend API Test Script
Tests all critical endpoints to verify 90% completion
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
TOKEN = None

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status} | {name}")
    if details:
        print(f"   └─ {details}")

def login():
    """Test 1: Authentication"""
    global TOKEN
    print("\n" + "="*60)
    print("TEST 1: AUTHENTICATION")
    print("="*60)
    
    try:
        response = requests.post(
            f"{BASE_URL}/login/",
            json={"username": "admin", "password": "admin123"}
        )
        
        if response.status_code == 200:
            data = response.json()
            TOKEN = data.get('token')
            print_test("Login API", True, f"Token: {TOKEN[:20]}...")
            print_test("User Data", 'username' in data, f"User: {data.get('username')}")
            return True
        else:
            print_test("Login API", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Login API", False, f"Error: {str(e)}")
        return False

def test_products():
    """Test 2: Products & Barcodes"""
    print("\n" + "="*60)
    print("TEST 2: PRODUCTS & BARCODES")
    print("="*60)
    
    headers = {"Authorization": f"Token {TOKEN}"}
    
    # Test products list
    try:
        response = requests.get(f"{BASE_URL}/products/", headers=headers)
        if response.status_code == 200:
            products = response.json()
            count = len(products.get('results', products)) if isinstance(products, dict) else len(products)
            print_test("Products List", count > 0, f"Found {count} products")
            
            # Get first product for barcode test
            first_product = products['results'][0] if isinstance(products, dict) else products[0]
            product_id = first_product['id']
            
            # Test barcode lookup
            barcode_response = requests.post(
                f"{BASE_URL}/products/barcode/lookup/",
                headers=headers,
                json={"barcode": "U1-C450"}
            )
            if barcode_response.status_code == 200:
                print_test("Barcode Lookup", True, f"Found: {barcode_response.json().get('name')}")
            else:
                print_test("Barcode Lookup", False, f"Status: {barcode_response.status_code}")
            
            # Test get product barcodes
            barcodes_response = requests.get(
                f"{BASE_URL}/products/{product_id}/barcodes/",
                headers=headers
            )
            if barcodes_response.status_code == 200:
                barcodes = barcodes_response.json()
                barcode_count = len(barcodes)
                print_test("Product Barcodes", barcode_count > 0, f"{barcode_count} barcodes found")
            else:
                print_test("Product Barcodes", False, f"Status: {barcodes_response.status_code}")
        else:
            print_test("Products List", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Products API", False, f"Error: {str(e)}")

def test_customers():
    """Test 3: Customers & Debt Management"""
    print("\n" + "="*60)
    print("TEST 3: CUSTOMERS & DEBT")
    print("="*60)
    
    headers = {"Authorization": f"Token {TOKEN}"}
    
    try:
        response = requests.get(f"{BASE_URL}/customers/", headers=headers)
        if response.status_code == 200:
            customers = response.json()
            count = len(customers.get('results', customers)) if isinstance(customers, dict) else len(customers)
            print_test("Customers List", count > 0, f"Found {count} customers")
            
            # Check for customer types
            customers_list = customers.get('results', customers) if isinstance(customers, dict) else customers
            types_found = set()
            debt_limits_found = 0
            
            for customer in customers_list[:10]:  # Check first 10
                if 'customer_type' in customer and customer['customer_type']:
                    types_found.add(customer['customer_type'])
                if 'debt_limit' in customer and customer['debt_limit']:
                    debt_limits_found += 1
            
            print_test("Customer Types", len(types_found) > 0, f"Types: {', '.join(types_found)}")
            print_test("Debt Limits", debt_limits_found > 0, f"{debt_limits_found} customers have debt limits")
        else:
            print_test("Customers List", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Customers API", False, f"Error: {str(e)}")

def test_calculator():
    """Test 4: Material Calculator"""
    print("\n" + "="*60)
    print("TEST 4: MATERIAL CALCULATOR")
    print("="*60)
    
    headers = {"Authorization": f"Token {TOKEN}"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/products/calculator/",
            headers=headers,
            json={
                "product_id": 1,
                "measurement_type": "area",
                "value": 100,
                "wastage_percent": 10
            }
        )
        if response.status_code == 200:
            data = response.json()
            print_test("Calculator API", True, f"Base qty: {data.get('base_quantity')}")
            print_test("Calculation Result", 'sell_units' in data, f"Sell units: {data.get('sell_units')}")
            print_test("Stock Check", 'has_stock' in data, f"Has stock: {data.get('has_stock')}")
        else:
            print_test("Calculator API", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Calculator API", False, f"Error: {str(e)}")

def test_reports():
    """Test 5: Reports"""
    print("\n" + "="*60)
    print("TEST 5: REPORTS")
    print("="*60)
    
    headers = {"Authorization": f"Token {TOKEN}"}
    
    # Test daily sales report
    try:
        response = requests.get(f"{BASE_URL}/reports/daily-sales/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print_test("Daily Sales Report", True, f"Total: {data.get('summary', {}).get('total_sales', 0)}")
        else:
            print_test("Daily Sales Report", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Daily Sales Report", False, f"Error: {str(e)}")
    
    # Test customer debt report
    try:
        response = requests.get(f"{BASE_URL}/reports/customer-debt/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print_test("Customer Debt Report", True, f"Total debt: {data.get('summary', {}).get('total_debt', 0)}")
        else:
            print_test("Customer Debt Report", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Customer Debt Report", False, f"Error: {str(e)}")
    
    # Test low stock report
    try:
        response = requests.get(f"{BASE_URL}/reports/low-stock/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            count = data.get('summary', {}).get('low_stock_count', 0)
            print_test("Low Stock Report", True, f"Low stock items: {count}")
        else:
            print_test("Low Stock Report", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Low Stock Report", False, f"Error: {str(e)}")

def test_dashboard():
    """Test 6: Dashboard Stats"""
    print("\n" + "="*60)
    print("TEST 6: DASHBOARD")
    print("="*60)
    
    headers = {"Authorization": f"Token {TOKEN}"}
    
    try:
        response = requests.get(f"{BASE_URL}/dashboard-stats/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print_test("Dashboard API", True, "Data loaded")
            print_test("Today Sales", 'today_sales' in data, f"{data.get('today_sales', 0)}")
            print_test("Debt Tracking", 'total_debt' in data, f"{data.get('total_debt', 0)}")
        else:
            print_test("Dashboard API", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Dashboard API", False, f"Error: {str(e)}")

def main():
    print("\n" + "="*60)
    print("🧪 STROY MATERIAL CRM - API TEST SUITE")
    print("="*60)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    
    if not login():
        print("\n❌ CRITICAL: Login failed. Cannot proceed with tests.")
        return
    
    test_products()
    test_customers()
    test_calculator()
    test_reports()
    test_dashboard()
    
    print("\n" + "="*60)
    print("✅ TEST SUITE COMPLETED")
    print("="*60)
    print("\nNext: Test frontend UI manually")
    print("1. Open http://localhost:3000")
    print("2. Login: admin / admin123")
    print("3. Test POS barcode scanner")
    print("4. Test keyboard shortcuts (F8, F9, Esc, ?)")
    print("5. Check Products barcode viewer")
    print("6. Verify Customer types and debt display")

if __name__ == "__main__":
    main()
