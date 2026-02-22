# Sales CRM

Web-App für Sales-Tracking mit Funnel-Analyse.

## Features

- **Dashboard** mit Stats: Leads, Umsatz, ROI
- **Funnel-Stufen**: Lead → Terminierung verloren → No Show → Closed
- **Umsatz-Tracking**: Vollzahler & Ratenzahlung
- **Expense-Management**: Ausgaben pro Closer oder allgemein
- **Multi-User**: Admins sehen alles, Closer nur eigene Sales

## Tech Stack

- **Frontend**: Next.js 14 (React) + TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (für MVP)
- **Auth**: Next-Auth mit Credentials

## Installation



## Deployment

App läuft auf Port 3000. Für Production:

1. Build: 
2. Start: 
3. Reverse Proxy (nginx) für Port 80/443

## Benutzer

### Admins (alles sehen)
- lukas@test.de / admin123
- ben@test.de / admin123

### Closer (nur eigene Sales)
- alex@test.de / closer123
- niklas@test.de / closer123

## API Endpoints

-  - Alle Sales (authentifiziert)
-  - Sale eintragen
-  - Alle Expenses (Admin only)
-  - Expense eintragen (Admin only)
-  - Alle User (Admin only)

## Datenmodell

- **User**: id, email, name, role (admin/closer), password
- **Sale**: amount, paymentType (full/installment), installmentMonths, monthlyAmount, stage
- **Expense**: description, amount, date, closerId

## Nächste Schritte

1. Charts mit Recharts (Funnel-Visualisierung)
2. CSV-Export
3. Benachrichtigungen
4. PostgreSQL Migration
