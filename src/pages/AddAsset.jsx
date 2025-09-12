import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function AddAsset() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    name: "",
    purchaseValue: "",
    purchaseDate: "",
    currentValue: "",
    // category-specific fields will appear here (weight, location, etc.)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch assets for this category
    fetch("http://localhost:5000/assets")
      .then((r) => r.json())
      .then((data) => setAssets(data.filter((a) => a.category === category)))
      .catch((err) => console.error("Error fetching category assets:", err));
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toNumber = (v) => {
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : 0;
  };

  const resetForm = () =>
    setForm({
      name: "",
      purchaseValue: "",
      purchaseDate: "",
      currentValue: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // base asset object with numeric conversions
    const newAsset = {
      category,
      name: (form.name || "").trim(),
      purchaseValue: toNumber(form.purchaseValue),
      purchaseDate: form.purchaseDate || "",
      currentValue: toNumber(form.currentValue),
    };

    // add category-specific fields if provided
    const maybeAdd = (key, asNumber = false) => {
      if (form[key] !== undefined && String(form[key]).trim() !== "") {
        newAsset[key] = asNumber ? toNumber(form[key]) : String(form[key]).trim();
      }
    };

    // property
    maybeAdd("location");
    maybeAdd("size");
    maybeAdd("type");

    // gold
    maybeAdd("weight");
    maybeAdd("purity");

    // stocks
    maybeAdd("ticker");
    maybeAdd("shares", true);
    maybeAdd("purchasePrice", true);

    // crypto
    maybeAdd("coin");
    maybeAdd("quantity", true);
    maybeAdd("purchasePrice", true); // reuse key for per-coin purchase

    // mutual funds
    maybeAdd("fundName");
    maybeAdd("units", true);
    maybeAdd("nav", true);

    try {
      const res = await fetch("http://localhost:5000/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset),
      });
      const saved = await res.json();
      // update local list (so it appears immediately on this page)
      setAssets((prev) => [...prev, saved]);
      resetForm();
    } catch (err) {
      console.error("Error saving asset:", err);
      alert("Could not save asset. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add {category} Asset</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <input
          name="name"
          placeholder="Asset Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          name="purchaseValue"
          type="number"
          placeholder="Purchase Value (₹)"
          value={form.purchaseValue}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          name="purchaseDate"
          type="date"
          value={form.purchaseDate}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        <input
          name="currentValue"
          type="number"
          placeholder="Current Value (₹)"
          value={form.currentValue}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />

        {/* Category-specific fields */}
        {category === "property" && (
          <>
            <input
              name="location"
              placeholder="Location"
              value={form.location || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="size"
              placeholder="Size (e.g. 1200 sq.ft)"
              value={form.size || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="type"
              placeholder="Type (Apartment, Land, ...)"
              value={form.type || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
          </>
        )}

        {category === "gold" && (
          <>
            <input
              name="weight"
              placeholder="Weight (grams)"
              value={form.weight || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="purity"
              placeholder="Purity (e.g. 24K)"
              value={form.purity || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
          </>
        )}

        {category === "stocks" && (
          <>
            <input
              name="ticker"
              placeholder="Ticker (e.g. AAPL)"
              value={form.ticker || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="shares"
              type="number"
              placeholder="Number of shares"
              value={form.shares || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="purchasePrice"
              type="number"
              placeholder="Purchase price per share"
              value={form.purchasePrice || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
          </>
        )}

        {category === "crypto" && (
          <>
            <input
              name="coin"
              placeholder="Coin symbol (e.g. BTC)"
              value={form.coin || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="purchasePrice"
              type="number"
              placeholder="Purchase price per coin"
              value={form.purchasePrice || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
          </>
        )}

        {category === "mutualfunds" && (
          <>
            <input
              name="fundName"
              placeholder="Fund name"
              value={form.fundName || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="units"
              type="number"
              placeholder="Units"
              value={form.units || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              name="nav"
              type="number"
              placeholder="NAV at purchase"
              value={form.nav || ""}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: 8 }}
            />
          </>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Asset"}
          </button>
          <button type="button" onClick={() => navigate("/categories")}>
            Back to Categories
          </button>
        </div>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h3>Your {category} assets</h3>
      {assets.length === 0 ? (
        <p>No assets in this category yet.</p>
      ) : (
        <ul>
          {assets.map((a) => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              <strong>{a.name}</strong> — Purchased ₹{a.purchaseValue} on{" "}
              {a.purchaseDate} — Current ₹{a.currentValue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddAsset;
