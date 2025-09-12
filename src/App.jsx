import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import CategorySelect from "./pages/CategorySelect";
import AddAsset from "./pages/AddAsset";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/categories" element={<CategorySelect />} />
        <Route path="/add-asset/:category" element={<AddAsset />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
