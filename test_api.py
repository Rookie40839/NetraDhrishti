import urllib.request
import json

# 1. Login as MoSPI Admin
login_data = json.dumps({'email': 'admin@mospi.gov.in', 'password': 'demo123'}).encode()
req = urllib.request.Request('http://localhost:8080/api/auth/login', data=login_data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    token = res['token']
    print('Logged in successfully as MoSPI Admin!')

# 2. Fetch Works
req2 = urllib.request.Request('http://localhost:8080/api/works?page=0&size=5', headers={'Authorization': 'Bearer ' + token, 'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req2) as resp2:
    data = json.loads(resp2.read().decode())
    print('\nTotal Works in Database:', data['totalElements'])
    print('Sample Works from SIH dataset:')
    for w in data['content']:
        print(f"  - [{w['uniqueWorkNumber']}] {w['workName']} | {w['state']} ({w['implementingDistrict']}) | Rs. {w['sanctionAmount']:,.2f} | Status: {w['workStatus']}")

# 3. Check Dashboard Top Priority
req3 = urllib.request.Request('http://localhost:8080/api/dashboard/top-priority?limit=3', headers={'Authorization': 'Bearer ' + token, 'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req3) as resp3:
    top_pri = json.loads(resp3.read().decode())
    print('\nTop Priority Flagged Works on Live Dashboard:')
    for p in top_pri:
        print(f"  - Priority {p['priorityRank']}: [{p['uniqueWorkNumber']}] {p['workName']} | Score: {p['compositeRiskScore']} ({p['riskLevel']}) | Rs. {p['sanctionAmount']:,.2f}")
