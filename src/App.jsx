import { useState, useEffect, useMemo } from "react";
import Loader from "./components/Loader.jsx";
import "./App.css";

let timer;

function App() {
  const [outsideDiameter, setOutsideDiameter] = useState(0);
  const [length, setLength] = useState(0);
  const [pieces, setPieces] = useState(0);
  const [cost, setCost] = useState(0);
  const [externalCost, setExternalCost] = useState(0);
  const [grossPercentage, setGrossPercentage] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalPounds, setTotalPounds] = useState(0);
  const [costPerPound, setCostPerPound] = useState(0);
  const [costPerPiece, setCostPerPiece] = useState(0);
  const [costPerInch, setCostPerInch] = useState(0);
  const [totalCharge, setTotalCharge] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [isLoading, setLoading] = useState(false);

  function debounce(func, timeout = 1000) {
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
        setLoading(false);
      }, timeout);
    };
  }

  const calcTotalCosts = () =>
    setTotalCost(
      (
        parseFloat(
          ((outsideDiameter * outsideDiameter * 2.67) / 12) *
            length *
            pieces *
            cost
        ) + externalCost
      ).toFixed(2)
    );
  const calcTotalPounds = () =>
    setTotalPounds(
      parseFloat(
        ((outsideDiameter * outsideDiameter * 2.67) / 12) * length * pieces
      ).toFixed(2)
    );
  const calcTotalCharge = () =>
    setTotalCharge(parseFloat(totalCost / (1 - grossPercentage)).toFixed(2));
  const calcCostPerInch = () =>
    setCostPerInch(parseFloat(totalCharge / (length * pieces)).toFixed(2));
  const calcCostPerPound = () =>
    setCostPerPound(parseFloat(totalCharge / totalPounds).toFixed(2));
  const calcCostPerPiece = () =>
    setCostPerPiece(parseFloat(totalCharge / pieces).toFixed(2));
  const calcGrossProfit = () =>
    setGrossProfit(parseFloat(totalCharge - totalCost).toFixed(2));

  useEffect(() => {
    calcTotalCosts();
    calcTotalPounds();
    calcTotalCharge();
  }, [outsideDiameter, length, pieces, cost, grossPercentage, externalCost]);

  useEffect(() => {
    calcCostPerPound();
    calcCostPerInch();
    calcCostPerPiece();
    calcGrossProfit();
  }, [totalCharge, totalCost]);

  useEffect(() => {
    if (!isLoading) return;
    handleModifiedCostPerInch();
  }, [costPerInch]);

  useEffect(() => {
    if (!isLoading) return;
    handleModifiedCostPerPound();
  }, [costPerPound]);

  useEffect(() => {
    if (!isLoading) return;
    handleModifiedCostPerPiece();
  }, [costPerPiece]);

  useEffect(() => {
    if (isLoading) setLoading(false);
  }, [grossPercentage]);

  const handleRecalculateGrossPercentage = (value, field) => {
    setLoading(true);
    if (field === "cost-by-inches") {
      setCostPerInch(value);
    } else if (field === "cost-by-pieces") {
      setCostPerPiece(value);
    } else if (field === "cost-by-pounds") {
      setCostPerPound(value);
    }
  };

  const handleModifiedCostPerInch = debounce(() => {
    const grossRevenue = costPerInch * length * pieces;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = ((netProfits / grossRevenue) * 1).toFixed(2);
    setGrossPercentage(newGrossPercentage);
  });

  const handleModifiedCostPerPound = debounce(() => {
    const grossRevenue = costPerPound * totalPounds;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = ((netProfits / grossRevenue) * 1).toFixed(2);
    setGrossPercentage(newGrossPercentage);
  });

  const handleModifiedCostPerPiece = debounce(() => {
    const grossRevenue = costPerPiece * pieces;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = ((netProfits / grossRevenue) * 1).toFixed(2);
    setGrossPercentage(newGrossPercentage);
  });

  return (
    <div className="bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900 min-h-screen grid items-center justify-center">
      <div className="mx-auto max-w-7xl w-full p-4 bg-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-80 border border-gray-100">
        <div className="flex items-center justify-center gap-2 mb-4 relative">
          <h1 className="text-3xl ml-2 text-center relative">
            <div className="absolute top-2 -left-8">
              {isLoading && <Loader />}
            </div>
            Steel Calculator
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-x-8">
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Inputs</h2>
            <label htmlFor="od">Outside Diameter (inches):</label>
            <input
              type="number"
              id="od"
              name="od"
              min="0"
              step="0.001"
              className="input-material"
              value={outsideDiameter}
              onChange={(e) => setOutsideDiameter(e.target.value)}
            />
            <label htmlFor="length">Length (inches):</label>
            <input
              type="number"
              id="length"
              name="length"
              min="0"
              step="0.001"
              className="input-material"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
            <label htmlFor="pieces">Pieces of Steel:</label>
            <input
              type="number"
              id="pieces"
              name="pieces"
              min="0"
              step="1"
              className="input-material"
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
            />
            <label htmlFor="cost">Cost of Metal Per Pound:</label>
            <input
              type="number"
              id="cost"
              name="cost"
              min="0"
              step="0.001"
              className="input-material"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <label htmlFor="cost">External Costs:</label>
            <input
              type="number"
              id="external-cost"
              name="external-cost"
              min="0"
              step="0.01"
              className="input-material"
              value={externalCost}
              onChange={(e) => setExternalCost(parseFloat(e.target.value))}
            />
            <label htmlFor="gross-percentage">Gross Percentage:</label>
            <input
              type="number"
              id="gross-percentage"
              name="gross-percentage"
              min="0.01"
              step="0.01"
              max="1"
              className="input-material mb-4"
              value={grossPercentage}
              onChange={(e) => setGrossPercentage(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-y-4 ">
            <h2 className="text-center text-2xl">Outputs</h2>
            <label htmlFor="total-cost">Total Cost:</label>
            <input
              type="number"
              id="total-cost"
              name="total-cost"
              min="0"
              className="input-material"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
            <label htmlFor="total-pounds">Total Pounds:</label>
            <input
              type="number"
              id="total-pounds"
              name="total-pounds"
              min="0"
              className="input-material"
              value={totalPounds}
              onChange={(e) => setTotalPounds(e.target.value)}
            />

            <label htmlFor="total-charge">Total Charge (Gross Revenue):</label>
            <input
              type="number"
              id="total-charge"
              name="total-charge"
              min="0"
              className="input-material"
              value={totalCharge}
              onChange={(e) => setTotalCharge(e.target.value)}
            />
            <label htmlFor="gross-profit">Net Profit:</label>
            <input
              type="number"
              id="gross-profit"
              name="gross-profit"
              min="0"
              className="input-material"
              value={grossProfit}
              onChange={(e) => setGrossProfit(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Breakdown</h2>
            <label htmlFor="cost-per-inches">Cost By Inch:</label>
            <input
              type="number"
              id="cost-per-inches"
              name="cost-per-inches"
              min="0"
              step="0.01"
              className="input-material"
              value={costPerInch}
              // onChange={(e) => setCostPerInch(e.target.value)}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  parseFloat(e.target.value),
                  "cost-by-inches"
                )
              }
            />
            <label htmlFor="cost-per-pieces">Cost By Piece:</label>
            <input
              type="number"
              id="cost-per-pieces"
              name="cost-per-pieces"
              min="0"
              step="0.01"
              className="input-material"
              value={costPerPiece}
              // onChange={(e) => setCostPerPiece(e.target.value)}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  parseFloat(e.target.value),
                  "cost-by-pieces"
                )
              }
            />
            <label htmlFor="cost-per-pound">Cost By Pound:</label>
            <input
              type="number"
              id="cost-per-pounds"
              name="cost-per-pounds"
              min="0"
              step="0.01"
              className="input-material"
              value={costPerPound}
              // onChange={(e) => setCostPerPound(e.target.value)}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  parseFloat(e.target.value),
                  "cost-by-pounds"
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
