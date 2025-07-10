Current System Understanding

     - Credits are stored in Clerk's publicMetadata.credits
     - Credit history is stored in Clerk's privateMetadata.creditHistory
     - Companies have profiles in company_profiles table
     - Unlocked profiles tracked in publicMetadata.unlockedProfiles

     1. Company Management Page (/app/admin/companies/page.tsx)

     Following the exact pattern from /app/admin/candidates/page.tsx:

     Features:
     - List all companies with search/filter/pagination
     - Display: Company name, Email, Credits balance, Profiles unlocked, Join date, Status
     - Quick actions: Edit credits, View details, Toggle verification
     - Search by: Company name, email, industry
     - Filter by: Credit range, verification status, activity

     2. Company Details/Edit Page (/app/admin/companies/[id]/edit/page.tsx)

     Following the pattern from candidate edit page:

     Sections:
     1. Company Information
       - Company name, Industry, Size, Website
       - Position, Hiring needs
       - Verification status toggle
     2. Credits Management Panel
       - Current balance display
       - Add/Remove credits with reason
       - Credit transaction history table
       - Quick presets (+10, +50, +100, Reset to 0)
     3. Unlocked Profiles
       - List of all unlocked profiles
       - Date unlocked, Profile name
       - Option to refund specific profile
     4. Admin Notes
       - Private notes about the company
       - Activity log

     3. API Endpoints

     A. Company Management

     - GET /api/admin/companies - List with Clerk credits data
     - GET /api/admin/companies/[id] - Get company with full credit info
     - PUT /api/admin/companies/[id] - Update company details
     - DELETE /api/admin/companies/[id] - Soft delete

     B. Credit Management

     - POST /api/admin/companies/[id]/credits - Add/remove credits
     {
       amount: number, // positive to add, negative to remove
       reason: string,
       adminNote?: string
     }
     - GET /api/admin/companies/[id]/credits/history - Credit transaction log
     - POST /api/admin/companies/[id]/credits/refund - Refund specific profile

     4. UI Components (following existing patterns)

     A. Credit Manager Component

     <div className="bg-white shadow rounded-lg p-6">
       <h3 className="text-lg font-medium mb-4">Credit Management</h3>
       
       {/* Current Balance */}
       <div className="bg-blue-50 p-4 rounded mb-4">
         <div className="text-3xl font-bold">{credits} Credits</div>
         <div className="text-sm text-gray-600">Current Balance</div>
       </div>
       
       {/* Quick Actions */}
       <div className="grid grid-cols-2 gap-2 mb-4">
         <button onClick={() => adjustCredits(10)}>+10 Credits</button>
         <button onClick={() => adjustCredits(50)}>+50 Credits</button>
         <button onClick={() => adjustCredits(100)}>+100 Credits</button>
         <button onClick={() => setCredits(0)}>Reset to 0</button>
       </div>
       
       {/* Custom Amount */}
       <form onSubmit={handleCreditAdjustment}>
         <input type="number" placeholder="Amount (+/-)" />
         <input type="text" placeholder="Reason" required />
         <button type="submit">Adjust Credits</button>
       </form>
     </div>

     B. Credit History Table

     <table className="min-w-full divide-y divide-gray-200">
       <thead>
         <tr>
           <th>Date</th>
           <th>Amount</th>
           <th>Balance</th>
           <th>Reason</th>
           <th>Admin</th>
         </tr>
       </thead>
       <tbody>
         {creditHistory.map(transaction => (
           <tr key={transaction.timestamp}>
             <td>{formatDate(transaction.timestamp)}</td>
             <td className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
               {transaction.amount > 0 ? '+' : ''}{transaction.amount}
             </td>
             <td>{transaction.balance}</td>
             <td>{transaction.reason}</td>
             <td>{transaction.grantedBy}</td>
           </tr>
         ))}
       </tbody>
     </table>

     5. Integration with Dashboard

     Update /app/admin/page.tsx to include:
     - Total companies count card
     - Total credits in circulation
     - Credits used today
     - "Manage Companies" button in Admin Tools section

     6. Implementation Order

     1. Create API endpoints for companies list and details
     2. Create companies list page
     3. Create company edit page with credit management
     4. Add credit adjustment APIs
     5. Update admin dashboard
     6. Add navigation links

     7. Security & Validation

     - Admin role verification on all endpoints
     - Audit trail for all credit changes (stored in Clerk metadata)
     - Input validation for credit amounts
     - Confirmation dialogs for large credit changes
     - Activity logging for compliance

     8. Additional Features

     - Export companies list to CSV
     - Bulk credit operations (add credits to multiple companies)
     - Credit usage analytics
     - Email notifications for credit changes (optional)
     - Credit expiry dates (future enhancement)