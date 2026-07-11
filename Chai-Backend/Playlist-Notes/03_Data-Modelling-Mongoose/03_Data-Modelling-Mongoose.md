# 03 - Data Modelling with Mongoose

## Folder Structure

```
Playlist-Notes/
└── 03_Data-Modelling-Mongoose/
    ├── Models/
    │   ├── e-commerce/
    │   │   ├── userModel.js
    │   │   ├── productModel.js
    │   │   ├── orderModel.js
    │   │   └── categoryModel.js
    │   ├── hospital-management/
    │   │   ├── doctorModel.js
    │   │   ├── hospitalModel.js
    │   │   ├── patientModel.js
    │   │   └── medicalRecordModel.js
    │   └── todos/
    │       ├── userModel.js
    │       ├── todosModel.js
    │       └── sub-todosModel.js
    └── 03_Data-Modelling-Mongoose.md
```

Actual schema code lives in `Models/e-commerce/*.js` and `Models/todos/*.js`
- this notes file covers the concepts, not a copy-paste of the code.

---


Actual schema code lives in `Models/e-commerce/*.js`, `Models/hospital-management/*.js`,
and `Models/todos/*.js` — this notes file covers the concepts, not a copy-paste of the code.

---

## To Do List Models — Key Points

### userModel.js
- `required: true` → field must be filled before saving
- `unique: true` → no two documents can share this value (username, email)
- `lowercase: true` → Mongoose auto-lowercases the value before saving
- `default: false` → fallback value when field isn't provided (`isActive`)
- `{ timestamps: true }` → auto-adds `createdAt` and `updatedAt`

⭐ **Interview point:** Mongoose auto-pluralizes and lowercases model names.
`mongoose.model("User", userSchema)` → stored in MongoDB as the **`users`** collection.

### todosModel.js
- `subTodos` is an **array of ObjectId references** → one Todo can have many SubTodos
- `createdBy` links a Todo back to the User who made it

### sub-todosModel.js
- Same pattern as Todo, but simpler — no nested array, just `createdBy`

---

## Key Concept — ObjectId & ref

```javascript
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

- `ObjectId` — MongoDB's unique ID type for every document
- `ref: "User"` — tells Mongoose "this ID belongs to the User model"
- `.populate('createdBy')` later replaces the raw ID with the full user object

```javascript
// without populate
todo.createdBy  →  "64abc123def456"  (just an ID)

// with populate
todo.createdBy  →  { username: "abdur", email: "...", isActive: true }
```

---

## E-Commerce Models — Key Points

### productModel.js
- `productImage` stores a **URL string**, not the actual file — images are
  too heavy to store directly in MongoDB
- Real strategy: upload image to **Cloudinary** (cloud media storage) first,
  then save the returned URL in this field
- `category` and `owner` are both `ObjectId` refs — one points to `Category`,
  one points to `User` (the seller)

### orderModel.js
- `orderItemSchema` is a **mini sub-schema** used only to shape the
  `orderItems` array — each item has a `productId` ref + `quantity`
- Same array could be written inline without a separate schema variable —
  identical result, just less readable for bigger schemas
- `status` uses `enum` → restricts the field to a fixed list of allowed
  strings (`Pending`, `Shipped`, `Delivered`, `Cancelled`); anything else
  throws a validation error
- `customer` links back to `User`, so one order always knows who placed it

### categoryModel.js
- Deliberately minimal — just a unique `name` field
- ⭐ Same interview point as before: Mongoose auto-lowercases + pluralizes
  the model name for the collection → `Category` model → `categories` collection

---

## Hospital Management Models — Key Points

### doctorModel.js
- `worksInHospitals` — array of `ObjectId` refs → one doctor can work at
  multiple hospitals (many-to-many relationship)

### hospitalModel.js
- `specializedIn` — array of plain strings, not refs (just tags/labels,
  not a separate collection)

### patientModel.js vs medicalRecordModel.js — Normalization Lesson
- ❌ First attempt mixed patient details (name, age, gender, bloodGroup)
  directly inside `medicalRecordSchema`
- ⚠️ Problem: if the same patient is admitted again, all their personal
  info gets **duplicated** in every new record — bad normalization
- ✅ Fix: split into two schemas
  - `Patient` → holds stable personal info (name, age, gender, bloodGroup)
  - `MedicalRecord` → holds per-visit info (diagnosedWith, admittedIn)
    and just references the patient via `patient: ObjectId, ref: "Patient"`
- ⭐ Interview point: this is the core idea behind **normalization** —
  store a fact once, reference it everywhere instead of copying it

```javascript
// medicalRecordModel.js — after fix
patient: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Patient",
  required: true,
}
```

- `.populate('patient')` later pulls in the full patient object when needed,
  same pattern as `createdBy` in the todos models

---

## Summary Table

**TODOs Models**

| Model     | Key Fields                          | References           |
|-----------|--------------------------------------|-----------------------|
| `User`    | username, email, password, isActive | —                      |
| `Todo`    | content, complete, createdBy        | `User`, `SubTodo[]`   |
| `SubTodo` | content, complete, createdBy        | `User`                |

**E-Commerce Models**

| Model      | Key Fields                                      | References                |
|------------|--------------------------------------------------|----------------------------|
| `User`     | username, email, password                       | —                           |
| `Category` | name                                              | —                           |
| `Product`  | description, productImage, price, stock          | `Category`, `User` (owner) |
| `Order`    | orderPrice, address, status, orderItems[]        | `User` (customer), `Product` (per item) |

**Hospital-Management Models**

| Model           | Key Fields                                      | References                        |
|-----------------|---------------------------------------------------|-------------------------------------|
| `Doctor`        | name, salary, qualification, experienceInYears   | `Hospital[]` (worksInHospitals)     |
| `Hospital`      | name, address, city, pincode, specializedIn[]    | —                                     |
| `Patient`       | name, age, gender, bloodGroup                     | —                                     |
| `MedicalRecord` | diagnosedWith                                     | `Patient`, `Hospital` (admittedIn)  |