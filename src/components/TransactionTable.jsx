export default function TransactionTable({ transactions }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-right">Debit</th>
            <th className="p-2 text-right">Credit</th>
            <th className="p-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{tx.date}</td>
              <td className="p-2">{tx.description}</td>
              <td className="p-2 text-right">{tx.debit > 0 ? tx.debit.toFixed(2) : '-'}</td>
              <td className="p-2 text-right">{tx.credit > 0 ? tx.credit.toFixed(2) : '-'}</td>
              <td className="p-2 text-right">{tx.balance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}