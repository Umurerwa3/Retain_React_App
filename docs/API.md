# Retain API reference

- **Base URL:** `http://localhost:5000/api` locally, or your deployed API URL plus `/api`.
- **Format:** JSON request and response bodies.
- **Auth:** protected endpoints need `Authorization: Bearer <token>`. You get a token from `/auth/register` or `/auth/login`.

## Errors

Every error has the same shape:

```json
{ "message": "Validation failed", "details": { "amount": "Amount must be greater than 0" } }
```

| Status | Meaning |
|---|---|
| 400 | Invalid input (validation errors, bad ID, bad query parameter) |
| 401 | Missing, invalid or expired token |
| 403 | Signed in, but without the required role |
| 404 | Not found, including another user's expense |
| 409 | Duplicate value, such as an email or category name |
| 429 | Too many auth attempts |

---

## Auth

### `POST /auth/register`
Creates a regular user. A `role` in the body is ignored.

```json
{ "name": "Grace Hopper", "email": "grace@example.com", "password": "secret12" }
```

**201**
```json
{ "token": "eyJhbGciOi...", "user": { "_id": "…", "name": "Grace Hopper", "email": "grace@example.com", "role": "user", "createdAt": "…", "updatedAt": "…" } }
```

### `POST /auth/login`
```json
{ "email": "grace@example.com", "password": "secret12" }
```
Returns the same body as register. A wrong email or password returns **401** `Invalid email or password`.

### `GET /auth/me` · user
```json
{ "user": { "_id": "…", "name": "Grace Hopper", "role": "user", "...": "…" } }
```

---

## Expenses · user

Users only ever see and change their own expenses.

### Expense object
```json
{
  "_id": "6ac7…",
  "user": "6ac6…",
  "title": "Groceries",
  "amount": 45.5,
  "category": { "_id": "…", "name": "Food & Dining", "color": "#ef6c00", "isDefault": false },
  "date": "2026-10-08T00:00:00.000Z",
  "paymentMethod": "cash",
  "notes": "Weekly shop",
  "createdAt": "…",
  "updatedAt": "…"
}
```

`paymentMethod` is one of `cash`, `credit_card`, `debit_card`, `mobile_money`, `bank_transfer` or `other`.

### `GET /expenses`
| Query param | Example | Description |
|---|---|---|
| `search` | `taxi` | Case-insensitive match on title or notes |
| `category` | `id1,id2` | One or more category IDs |
| `paymentMethod` | `cash,mobile_money` | One or more payment methods |
| `startDate` / `endDate` | `2026-10-01` | Inclusive date range |
| `minAmount` / `maxAmount` | `10` | Inclusive amount range |
| `sortBy` | `date` \| `amount` | Default `date` |
| `order` | `asc` \| `desc` | Default `desc` |
| `page` | `1` | Default `1` |
| `limit` | `10` | Default `10`, maximum `100` |

**200**
```json
{
  "expenses": [ { "…": "expense objects" } ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 },
  "totalAmount": 1234.5
}
```
`totalAmount` is the sum of every expense matching the filters, not just the current page.

### `POST /expenses`
```json
{ "title": "Groceries", "amount": 45.5, "category": "<categoryId>", "date": "2026-10-08", "paymentMethod": "cash", "notes": "optional" }
```
**201** `{ "expense": { … } }`

### `GET /expenses/:id`
**200** `{ "expense": { … } }`

### `PUT /expenses/:id`
Send any subset of the create fields. **200** `{ "expense": { … } }`

### `DELETE /expenses/:id`
**200** `{ "message": "Expense deleted", "id": "…" }`

---

## Budgets · user

Months use the `YYYY-MM` format.

### Budget summary object
```json
{
  "month": "2026-10",
  "budget": 200,
  "hasBudget": true,
  "spent": 165.5,
  "remaining": 34.5,
  "percentUsed": 82.8,
  "expenseCount": 3,
  "status": "approaching"
}
```
`status` is one of:
- `within`: under 80% used
- `approaching`: 80–100% used
- `over`: more than 100% used
- `no_budget`: no budget set for that month

### `GET /budgets`
**200** `{ "budgets": [ { "_id": "…", "month": "2026-10", "amount": 200 } ] }`

### `GET /budgets/:month`
**200** `{ "summary": { … } }`

### `PUT /budgets/:month`
```json
{ "amount": 200 }
```
Creates the month's budget, or updates it if it already exists. **200** `{ "summary": { … } }`

### `DELETE /budgets/:month`
**200** `{ "message": "Budget removed" }`

---

## Dashboard · user

### `GET /dashboard?month=YYYY-MM`
`month` defaults to the current month.

```json
{
  "month": "2026-10",
  "totalSpent": 165.5,
  "expenseCount": 3,
  "budget": { "…": "budget summary" },
  "highestExpense": { "…": "expense object or null" },
  "spendingByCategory": [ { "categoryId": "…", "name": "Entertainment", "color": "#8e24aa", "total": 90, "count": 1 } ],
  "dailySpending": [ { "date": "2026-10-08", "total": 165.5 } ],
  "recentExpenses": [ { "…": "5 most recent expenses" } ]
}
```

---

## Categories

### `GET /categories` · user
**200** `{ "categories": [ { "_id": "…", "name": "Uncategorized", "description": "…", "color": "#9e9e9e", "isDefault": true } ] }`

### `POST /categories` · admin
```json
{ "name": "Travel", "description": "Flights and hotels", "color": "#43a047" }
```
**201** `{ "category": { … } }`. Names are unique, ignoring case (a duplicate returns **409**).

### `PUT /categories/:id` · admin
**200** `{ "category": { … } }`

### `DELETE /categories/:id` · admin
Expenses in the deleted category are moved to the default **Uncategorized** category.

**200**
```json
{ "message": "Category deleted. 3 expense(s) moved to Uncategorized.", "reassigned": 3 }
```
Trying to delete the default category returns **400**.

---

## Admin · admin

### `GET /admin/insights`
```json
{
  "totalUsers": 6,
  "totalExpenses": 120,
  "totalValue": 5400.75,
  "expensesThisMonth": 18,
  "spendingPerCategory": [ { "categoryId": "…", "name": "Food & Dining", "color": "#ef6c00", "total": 900, "count": 30 } ],
  "topCategories": [ "5 most-used categories, by expense count" ],
  "bottomCategories": [ "5 least-used categories, including unused ones" ],
  "recentExpenses": [ { "…": "expense", "user": { "_id": "…", "name": "Grace", "email": "…" } } ],
  "recentUsers": [ { "…": "5 newest users" } ]
}
```

---

## Health

### `GET /health`
**200** `{ "status": "ok" }`
