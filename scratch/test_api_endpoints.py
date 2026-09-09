import urllib.request
import json
import sys

def test_endpoint(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            print(f"SUCCESS [{response.status}] {url}")
            return data
    except Exception as e:
        print(f"FAILED {url}: {e}")
        return None

print("Testing Spring Boot NetraDhrishti API...")
stats = test_endpoint('http://localhost:8080/api/dashboard/stats')
print("Dashboard Stats:", json.dumps(stats, indent=2))

priority = test_endpoint('http://localhost:8080/api/dashboard/top-priority')
print(f"Top Priority Works: {len(priority) if priority else 0}")
if priority:
    for p in priority[:3]:
        work_name = str(p.get('workName', ''))[:40]
        print(f"  - Work #{p.get('workId')}: {work_name}... Risk={p.get('riskLevel')} (RiskScore={p.get('riskScore')}) PriorityScore={p.get('priorityScore')}")

works = test_endpoint('http://localhost:8080/api/works?page=0&size=5')
if works:
    total = works.get('totalElements')
    content = works.get('content', [])
    print(f"Works Page: totalElements={total}, returned in content={len(content)}")
    if content:
        first = content[0]
        w = first.get('work') or {}
        r = first.get('riskScore') or {}
        flags = first.get('flags') or []
        print(f"  First Work #{w.get('id')}: {w.get('workName')[:40]} | District: {w.get('implementingDistrict')} | Sanctioned: Rs. {w.get('sanctionAmount')}")
        print(f"    Risk: {r.get('riskLevel') if r else 'None'} | Overall Score: {r.get('overallRiskScore') if r else 'None'} | Flags count: {len(flags)}")

first_id = 1
if works and works.get('content'):
    first_id = works['content'][0].get('work', {}).get('id', 1)

details = test_endpoint(f'http://localhost:8080/api/works/{first_id}/details')
if details:
    print(f"Work #{first_id} Details:")
    print(f"  - Fund Releases: {len(details.get('fundReleases', []))}")
    print(f"  - Fund Anomalies: {len(details.get('fundAnomalies', []))}")
    print(f"  - Duplicate Candidates: {len(details.get('duplicateCandidates', []))}")
    print(f"  - Data Quality Issues: {len(details.get('dataQualityIssues', []))}")
    print(f"  - Progress History: {len(details.get('progressHistory', []))}")
    print(f"  - Compliance Flags: {len(details.get('flags', []))}")
