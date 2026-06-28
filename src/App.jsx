import { StatementProvider } from './context/StatementContext';
import StatementWizard from './pages/StatementWizard';

export default function App() {
  return (
    <StatementProvider>
      <StatementWizard />
    </StatementProvider>
  );
}