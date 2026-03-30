# Policy 1 Update: Late Mark Rules & Special Case Exception

This plan outlines the integration of new HR policy rules regarding late marks.

## User Review Required

> [!IMPORTANT]
> **Late Mark Deduction Logic**: The rule "first three counts are exempted, later three are considered as half-day" will be implemented as follows:
> - 1-3 Late Marks: 0 Deduction.
> - 4-6 Late Marks: 0.5 Day Deduction.
> - 7-9 Late Marks: 1.0 Day Deduction (and so on, 0.5 day for every 3 marks after the first 3).
> Please confirm if this matches the intended policy.

> [!IMPORTANT]
> **Special Case Definition**: A late mark is marked as "Special Case" (Covered) if the user arrives late but stay late enough to fulfill the **Standard Shift Duration** (e.g., 9 hours if 9:00 AM to 6:00 PM).
> This will be highlighted in **Orange** in the UI.

## Proposed Changes

### 1. Database Schema

#### [MODIFY] [prisma/schema.prisma](file:///d:/Practice/sigma-p/hr-app/prisma/schema.prisma)
- Add `isLateSpecialCase Boolean @default(false)` to the `Attendance` model.

### 2. Backend Logic

#### [MODIFY] [src/app/actions/attendance.ts](file:///d:/Practice/sigma-p/hr-app/src/app/actions/attendance.ts)
- Update `punchInOutAction`:
    - On **Punch Out**:
        - Fetch `SystemConfig` to get `officeStartTime` and `officeEndTime`.
        - Calculate `standardDurationMinutes`.
        - Calculate `actualDurationMinutes = (punchOut - punchIn)`.
        - If `isLate` is true AND `actualDurationMinutes >= standardDurationMinutes`:
            - Update record with `isLateSpecialCase: true`.

#### [MODIFY] [src/app/dashboard/accountant/page.tsx](file:///d:/Practice/sigma-p/hr-app/src/app/dashboard/accountant/page.tsx)
- Update `getPayrollReportData`:
    - Count `actualLateMarks` (where `isLate` is true AND `isLateSpecialCase` is false).
    - Count `specialCaseLateMarks` (for display).
    - Calculate `lateDeductionRows = Math.floor(Math.max(0, actualLateMarks - 3) / 3) * 0.5`.
    - Update `lwpDays` calculation to include `lateDeductionRows`.
    - Pass these new metrics to the `MasterReportTable`.

### 3. Frontend / UI Components

#### [MODIFY] [src/components/accountant/master-report-table.tsx](file:///d:/Practice/sigma-p/hr-app/src/components/accountant/master-report-table.tsx)
- Update data types to include `specialCaseLate`.
- Update the "Late Marks" cell:
    - Display regular late marks (punishable).
    - Add an orange badge for "Special Case" late marks (non-punishable).
- Ensure headers reflect these categories if necessary (tooltips or small labels).

#### [MODIFY] [src/app/dashboard/employee/page.tsx](file:///d:/Practice/sigma-p/hr-app/src/app/dashboard/employee/page.tsx)
- Update the "Recent Attendance" list to handle the `isLateSpecialCase` flag.
- Render an **Orange Badge** labeled "Covered" or "Special Case" instead of the Red "Late" badge when applicable.

## Verification Plan

### Automated Tests
- I will simulate attendance logs via browser subagent:
    1. Punch in late (e.g. 9:20 AM).
    2. Punch out late (e.g. 6:25 PM).
    3. Verify `isLateSpecialCase` is true in the database/UI.
    4. Create multiple late logs for an employee and verify the deduction calculation in the Accountant report.

### Manual Verification
- Verify colors in the Master Report:
    - Regular Late: Red Badge.
    - Special Case: Orange Badge.
- Verify LWP (Unpaid) column updates correctly based on the 3rd mark threshold.
