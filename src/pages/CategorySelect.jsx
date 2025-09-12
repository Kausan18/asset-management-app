import { useNavigate } from "react-router-dom";


function CategorySelect() {
  const navigate = useNavigate();
  const categories = ["Gold", "Property", "Stocks", "Crypto"];

  return (
    <div>
      <h1>Select Asset Category</h1>
      {categories.map((cat) => (
        <div key={cat}>
          <button onClick={() => navigate(`/add-asset/${cat}`)}>
            {cat}
          </button>
        </div>
      ))}

      <button onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </button>
      <button onClick={() => navigate("/")}>
        Logout
      </button>
    </div>
  );
}

export default CategorySelect;
