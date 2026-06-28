import { useStatement } from '../context/StatementContext';

export default function Header() {
  const { step } = useStatement();
  return (
    <header className="bg-[#0E3C82] text-white px-4 py-5 text-center rounded-b-3xl shadow-md">
      <h1 className="text-xl font-bold">Bank Statement Generator</h1>
      <p className="text-sm mt-1 opacity-90">Step {step} of 4</p>
      <div className="w-full bg-white/20 rounded-full h-2 mt-3">
        <div
          className="bg-white h-2 rounded-full transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </header>
  );
}