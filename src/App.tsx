import { DataProvider } from "./context/DataContext";
import { Dashboard } from "./modules/dashboard/Dashboard";

const App = () => (
  <DataProvider>
    <Dashboard />
  </DataProvider>
);

export default App;
