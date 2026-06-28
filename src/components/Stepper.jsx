import { useStatement } from '../context/StatementContext';

export default function Stepper() {
  const { step } = useStatement();
  const steps = ['Bank & Period', 'Account', 'Transactions', 'Preview'];

  return (
    <div className="flex justify-between px-4 mt-6 mb-4 max-w-md mx-auto">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-col items-center flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
              i + 1 <= step ? 'bg-[#0E3C82] text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs text-center ${i + 1 <= step ? 'text-[#0E3C82] font-medium' : 'text-gray-400'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}