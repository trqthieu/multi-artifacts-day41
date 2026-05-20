# 📘 Bài Tập 2: Multi-Artifact Reports - Monorepo Testing

**Mức độ:** Trung bình
**Thời gian:** 60-90 phút

---

## 🎯 Mục Tiêu

Tạo CI workflow cho monorepo với 3 packages (api, web, mobile):
1. **Test jobs**: Test 3 packages parallel
2. **Upload artifacts**: Test results + coverage cho mỗi package
3. **Aggregate job**: Download all, merge reports
4. **Conditional upload**: Failure logs chỉ khi tests fail

---

## 📋 Requirements

### Test Jobs (3 jobs parallel)

Mỗi package (api, web, mobile) cần 1 job riêng:

- [x] Checkout code
- [ ] Setup Node.js 20 với cache
- [ ] Install dependencies: `npm ci`
- [ ] Run tests cho package: `npm test --workspace=packages/api`
  - Use `continue-on-error: true` để không fail job
- [ ] **TODO:** Upload test results
  - Name: `test-results-{package}` (VD: test-results-api)
  - Path: `packages/{package}/test-results.json`
  - Retention: 7 days
  - Condition: `if: always()`
- [ ] **TODO:** Upload coverage
  - Name: `coverage-{package}`
  - Path: `packages/{package}/coverage/`
  - Condition: `if: always()`
- [ ] **TODO:** Upload failure logs
  - Name: `logs-{package}-failure`
  - Path: `packages/{package}/logs/`
  - Retention: 1 day
  - Condition: `if: failure()` ← CHỈ khi test fail

### Aggregate Job

- [ ] Run after: `needs: [test-api, test-web, test-mobile]`
- [ ] Condition: `if: always()` để chạy even khi tests fail
- [ ] **TODO:** Download all test results
  - Pattern: `test-results-*`
  - Path: `test-results/`
- [ ] **TODO:** Download all coverage
  - Pattern: `coverage-*`
  - Path: `coverage/`
- [ ] Display structure: `ls -R test-results/ && ls -R coverage/`
- [ ] **TODO:** Aggregate test results (script có sẵn)
- [ ] **TODO:** Upload aggregated summary
  - Name: `test-summary`
  - Retention: 30 days

---

## 🧪 Test Local

```bash
# Install root dependencies
npm install

# Test mỗi package
npm test --workspace=packages/api
npm test --workspace=packages/web
npm test --workspace=packages/mobile

# Verify outputs
ls packages/api/test-results.json
ls packages/api/coverage/
```

---

## 🚀 Deploy lên GitHub

```bash
gh repo create bai2-multi-artifacts --public --source=. --remote=origin
git add .
git commit -m "feat: add multi-artifacts exercise"
git push -u origin main
gh run watch
```

---

## ✅ Verification

Workflow pass khi:

1. ✅ 3 test jobs chạy PARALLEL (cùng lúc)
2. ✅ Mỗi job upload 2 artifacts (test-results, coverage)
3. ✅ Total 6 artifacts (hoặc 7-9 nếu có failures)
4. ✅ Aggregate job downloads all và merge
5. ✅ `test-summary` artifact được tạo
6. ✅ Workflow màu xanh (hoặc vàng nếu tests fail nhưng workflow complete)

---

## 🐛 Troubleshooting

### Lỗi: Aggregate job không download được artifacts

**Nguyên nhân:** Test jobs chưa complete

**Fix:**
```yaml
aggregate-reports:
  needs: [test-api, test-web, test-mobile]  # Wait for all
  if: always()  # Run even if some failed
```

### Lỗi: Pattern matching không work

**Check:**
- Artifact names match pattern: `test-results-*`
- Upload step ran successfully (check logs)

### Tests pass nhưng không có failure logs

**Expected!** Failure logs chỉ upload khi `if: failure()`

---

## 💡 Hints

<details>
<summary>Pattern matching download</summary>

```yaml
- uses: actions/download-artifact@v4
  with:
    pattern: test-results-*  # Match multiple artifacts
    path: test-results/      # Extract all to this folder
```

Kết quả:
```
test-results/
├── test-results-api/
│   └── test-results.json
├── test-results-web/
│   └── test-results.json
└── test-results-mobile/
    └── test-results.json
```

</details>

<details>
<summary>Conditional upload</summary>

```yaml
# Always upload (even if tests fail)
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: test-results.json

# Only upload if step failed
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: failure-logs
    path: logs/
```

</details>

<details>
<summary>Job dependencies</summary>

```yaml
jobs:
  test-api:
    # ...

  test-web:
    # ...

  test-mobile:
    # ...

  aggregate:
    needs: [test-api, test-web, test-mobile]  # Wait for all 3
    if: always()  # Run even if some failed
```

</details>

---

## 📚 Tham Khảo

- Cheatsheet: `../../cheatsheet-day41.md`
- Lesson: Section "Áp Dụng Vào Dự Án Thực Tế → Tình Huống 1"
- Pattern docs: https://github.com/actions/download-artifact#download-all-artifacts
