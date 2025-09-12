import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";



function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/assets")
      .then((r) => r.json())
      .then((data) => setAssets(data || []))
      .catch((err) => console.error("Error fetching assets:", err));
  }, []);

  const removeAssetLocally = (id) =>
    setAssets((prev) => prev.filter((a) => a.id !== id));

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/assets/${id}`, { method: "DELETE" })
      .then(() => removeAssetLocally(id))
      .catch((err) => console.error("Error deleting:", err));
  };

  // grouping
  const grouped = assets.reduce((acc, a) => {
    const cat = a.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  // safe number conversion helper
  const num = (val) => {
    // Accept various field names and strings
    const v =
      val ??
      0; /* if val is undefined or null, treat as zero */
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // get numeric value for an asset: prefer currentValue, fallback to value or purchaseValue
  const assetValue = (asset) =>
    num(asset.currentValue ?? asset.current_value ?? asset.value ?? asset.purchaseValue ?? asset.purchase_value);

  // totals
  const totalPortfolio = Object.values(grouped).flat().reduce((s, a) => s + assetValue(a), 0);

  // chart data
  const chartData = Object.keys(grouped).map((cat) => {
    const catTotal = grouped[cat].reduce((s, a) => s + assetValue(a), 0);
    return { name: cat, value: catTotal };
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2", "#D65DB1"];

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <h2>Total Portfolio Value: ₹{totalPortfolio}</h2>

      {/* Category tiles */}
      {!selectedCategory && (
        <>
          {Object.keys(grouped).length === 0 ? (
            <p>No assets yet — add some from Categories.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 16,
              }}
            >
              {Object.keys(grouped).map((cat) => {
                const catTotal = grouped[cat].reduce((s, a) => s + assetValue(a), 0);
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      flex: "1 1 220px",
                      minWidth: 200,
                      border: "1px solid #ddd",
                      borderRadius: 10,
                      padding: 16,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      background: "#fff",
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px 0" }}>{cat}</h3>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>₹{catTotal}</div>
                    <div style={{ color: "#666", marginTop: 8 }}>{grouped[cat].length} items</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* selected category view */}
      {selectedCategory && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setSelectedCategory(null)}>← Back to Main Dashboard</button>
          <h2 style={{ marginTop: 12 }}>{selectedCategory} Assets</h2>

          {grouped[selectedCategory] && grouped[selectedCategory].length > 0 ? (
            <ul style={{ marginTop: 12 }}>
              {grouped[selectedCategory].map((a) => (
                <li key={a.id} style={{ marginBottom: 12 }}>
                  <strong>{a.name}</strong>
                  <div style={{ fontSize: 13, color: "#333" }}>
                    Purchased: ₹{a.purchaseValue ?? a.purchase_value ?? "—"} on {a.purchaseDate ?? "—"}
                    {" • "} Current: ₹{a.currentValue ?? a.current_value ?? a.value ?? "—"}
                    {a.location && <> • Location: {a.location}</>}
                    {a.size && <> • Size: {a.size}</>}
                    {a.type && <> • Type: {a.type}</>}
                    {a.weight && <> • Weight: {a.weight}</>}
                    {a.purity && <> • Purity: {a.purity}</>}
                    {a.ticker && <> • Ticker: {a.ticker}</>}
                    {a.shares !== undefined && <> • Shares: {a.shares}</>}
                    {a.coin && <> • Coin: {a.coin}</>}
                    {a.quantity !== undefined && <> • Quantity: {a.quantity}</>}
                    {a.fundName && <> • Fund: {a.fundName}</>}
                    {a.units !== undefined && <> • Units: {a.units}</>}
                    {a.nav !== undefined && <> • NAV: {a.nav}</>}
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => handleDelete(a.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No assets in this category.</p>
          )}
        </div>
      )}

      {/* Charts (overall) */}
      {chartData.length > 0 && (
        <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
          <div style={{ flex: 1, minHeight: 260 }}>
            <h4>Asset distribution</h4>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" label outerRadius={80}>
                  {chartData.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1, minHeight: 260 }}>
            <h4>Category values</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* bottom navigation */}
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <button onClick={() => navigate("/categories")}>Back to Categories Page</button>
        <button onClick={() => navigate("/")}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;
