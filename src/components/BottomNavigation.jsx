import { useStatement } from '../context/StatementContext';

export default function BottomNavigation({ onNext }) {
  const { step, prevStep, nextStep } = useStatement();

  const handleNext = () => {
    if (onNext) {
      onNext(step) ? nextStep() : null;
    } else {
      nextStep();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between max-w-lg mx-auto">
      {step > 1 ? (
        <button
          onClick={prevStep}
          className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
        >
          Back
        </button>
      ) : <div />}
      {step < 4 && (
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-[#0E3C82] text-white rounded-xl font-semibold hover:bg-[#0A2C5E]"
        >
          Next →
        </button>
      )}
    </div>
  );
}