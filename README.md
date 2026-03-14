# 💎 CoreInventory: Ultimate Warehouse Intelligence

> "**Where Premium Design Meets Operational Excellence.**"

CoreInventory is a state-of-the-art warehouse management system (WMS) built for the **Odoo Hackathon**. It features a revolutionary **Cinematic Glow** interface, blending high-end aesthetics with industrial-grade inventory logic.

![Design Status](https://img.shields.io/badge/Design-Premium%20Cinematic-hotpink)
![Security](https://img.shields.io/badge/Security-RBAC%20Enabled-green)
![Performance](https://img.shields.io/badge/Performance-Vite%20Powered-blueviolet)

---

## ✨ Key Features

### 🎨 Cinematic Glow Design
*   **Dynamic Borders**: Real-time interactive borders that glow on hover and pulse during active operations.
*   **Glassmorphism Layout**: Translucent surfaces with blur effects for a premium, multi-layered feel.
*   **Context-Aware Colors**: Unique color palettes for Receipts (Gold/Orange) and Deliveries (Blue/Cyan) to reduce cognitive load.

### 📦 Multi-Warehouse Logistics
*   **Zone Architecture**: Track stock across multiple specific locations (e.g., Zone A, Cold Storage, Main Floor).
*   **Internal Transfers**: Seamlessly move inventory between zones with a single click.
*   **Precision Fulfillment**: Edit "Done Quantities" during deliveries to reflect actual shipped stock, automatically updating warehouse levels.

### 🔐 Secure Intelligence
*   **Role-Based Access Control (RBAC)**:
    *   **Manager**: Full control over product catalogs, supplier data, and inventory audits.
    *   **Staff**: Optimized workflow for daily operations like stock counting and order shipping.
*   **Live Stock Monitoring**: Real-time updates across all pages when transactions occur.

---

## 🚦 Getting Started

Follow these steps to launch your cinematic inventory experience:

### 1. Prerequisites
*   **Node.js**: v18.0 or higher
*   **npm**: v9.0 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Divya300735/corelnventory_odoo-hackthon.git

# Enter the project directory
cd corelnventory_odoo-hackthon

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🔑 Demo Credentials

Test the role-based features using these pre-configured accounts:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Manager** | `admin` | `admin123` |
| **Staff** | `staff` | `staff123` |

---

## 🛠 Tech Stack

*   **Frontend**: React 18 + Vite
*   **State Management**: Zustand (Atomic State Engine)
*   **Styling**: Pure Vanilla CSS with Modern Design Tokens
*   **Icons**: Custom SVG iconography
*   **Security**: Context-based Auth Persistence

---

## 🎯 Hackathon Highlights

1.  **Zero-Placeholder Policy**: Every image and data point is functional and represents real system state.
2.  **Visual Feedback**: Implemented specialized border animations for a "living" UI.
3.  **Inventory Integrity**: Built a custom hook system that ensures quantity changes in Deliveries accurately sync with the Master Product List and Warehouse Zones.

Developed with ❤️ for the Odoo Hackathon.

