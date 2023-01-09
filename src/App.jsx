import { useState, useEffect } from "react";
import Loader from "./components/Loader.jsx";
import NumberInput from "./components/NumberInput.jsx";
import "./App.css";

let timer;

function App() {
  const [outsideDiameter, setOutsideDiameter] = useState(0.0);
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
      Number(
        ((outsideDiameter * outsideDiameter * 2.67) / 12) *
          length *
          pieces *
          cost +
          externalCost
      )
    );
  const calcTotalPounds = () =>
    setTotalPounds(
      Number(
        (
          ((outsideDiameter * outsideDiameter * 2.67) / 12) *
          length *
          pieces
        ).toFixed(2)
      )
    );
  const calcTotalCharge = () =>
    setTotalCharge(
      Number((totalCost / (1 - grossPercentage / 100)).toFixed(2))
    );
  const calcCostPerInch = () =>
    setCostPerInch(Number((totalCharge / (length * pieces)).toFixed(2)));
  const calcCostPerPound = () =>
    setCostPerPound(Number((totalCharge / totalPounds).toFixed(2)));
  const calcCostPerPiece = () =>
    setCostPerPiece(Number((totalCharge / pieces).toFixed(2)));
  const calcGrossProfit = () =>
    setGrossProfit(Number((totalCharge - totalCost).toFixed(2)));

  useEffect(() => {
    calcTotalCosts();
  }, [outsideDiameter, length, pieces, cost, externalCost]);

  useEffect(() => {
    calcTotalPounds();
  }, [outsideDiameter, length, pieces]);

  useEffect(() => {
    calcTotalCharge();
  }, [totalCost, grossPercentage]);

  useEffect(() => {
    calcGrossProfit();
  }, [totalCharge, totalCost]);

  useEffect(() => {
    calcCostPerPound();
  }, [totalCharge, totalPounds]);

  useEffect(() => {
    calcCostPerInch();
  }, [totalCharge, length, pieces]);

  useEffect(() => {
    calcCostPerPiece();
  }, [totalCharge, pieces]);

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
    const newGrossPercentage = (netProfits / grossRevenue) * 100;
    setGrossPercentage(newGrossPercentage.toFixed(4));
  });

  const handleModifiedCostPerPound = debounce(() => {
    const grossRevenue = costPerPound * totalPounds;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = (netProfits / grossRevenue) * 100;
    setGrossPercentage(newGrossPercentage.toFixed(4));
  });

  const handleModifiedCostPerPiece = debounce(() => {
    const grossRevenue = costPerPiece * pieces;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = (netProfits / grossRevenue) * 100;
    setGrossPercentage(newGrossPercentage.toFixed(4));
  });

  const printValues = () => {
    console.log({
      outsideDiameter,
      length,
      pieces,
      cost,
      externalCost,
      grossPercentage,
      totalCost,
      totalPounds,
      costPerPound,
      costPerPiece,
      costPerInch,
      totalCharge,
      grossProfit,
      isLoading,
    });
  };

  function roundToTenths(num) {
    return Math.round(num * 10) / 10;
  }

  const handleFocus = (event) => {
    event.target.select();
  };

  return (
    <div className="bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900 min-h-screen lg:grid items-center justify-center">
      <div className="mx-auto max-w-7xl w-full p-4 bg-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-80 border border-gray-100">
        <div className="flex items-center justify-center gap-2 mb-4 relative">
          <h1 className="text-3xl ml-2 text-center relative">
            <div className="absolute top-2 -left-8">
              {isLoading && <Loader />}
            </div>
            Steel Calculator
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Inputs</h2>
            <label htmlFor="od">Outside Diameter (inches):</label>
            {/* <input
              type="text"
              id="od"
              name="od"
              min="0.001"
              step="0.001"
              className="input-material"
              value={outsideDiameter}
              onInput={(e) => {
                // Test the input value using a regular expression
                if (/^\d*\.?\d*$/.test(e.target.value)) {
                  // Update the outsideDiameter state
                  setOutsideDiameter(Number(e.target.value));
                }
              }}
              onChange={(e) => {
                // Test the input value using a regular expression
                if (/^\d*\.?\d*$/.test(e.target.value)) {
                  // Update the value of the input field
                  e.target.value = e.target.value;
                }
              }}
              onFocus={(e) => handleFocus(e)}
              inputMode="decimal"
            /> */}
            <NumberInput
              value={outsideDiameter}
              onChange={(event) => setOutsideDiameter(event.target.value)}
            />
            <label htmlFor="length">Length (inches):</label>
            {/* <input
              type="number"
              id="length"
              name="length"
              min="0.001"
              step="0.001"
              className="input-material"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
            <label htmlFor="pieces">Pieces:</label>
            {/* <input
              type="number"
              id="pieces"
              name="pieces"
              min="0"
              step="1"
              className="input-material"
              value={pieces}
              onChange={(e) => setPieces(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
            />
            <label htmlFor="cost">Cost per Pound:</label>
            {/* <input
              type="number"
              id="cost"
              name="cost"
              min="0.0"
              step="0.001"
              className="input-material"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <label htmlFor="cost">External Costs:</label>
            {/* <input
              type="number"
              id="external-cost"
              name="external-cost"
              min="0.0"
              step="0.01"
              className="input-material"
              value={externalCost}
              onChange={(e) => setExternalCost(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={externalCost}
              onChange={(e) => setExternalCost(e.target.value)}
            />
            <label htmlFor="gross-percentage">Margin</label>
            {/* <input
              type="number"
              id="gross-percentage"
              name="gross-percentage"
              min="00.0"
              step="0.1"
              max="100.0"
              className="input-material mb-4"
              value={roundToTenths(grossPercentage)}
              onChange={(e) => setGrossPercentage(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              // value={roundToTenths(grossPercentage)}
              value={roundToTenths(grossPercentage)}
              onChange={(e) => setGrossPercentage(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-4 ">
            <h2 className="text-center text-2xl">Outputs</h2>
            <label htmlFor="total-cost">Total Cost:</label>
            {/* <input
              type="number"
              id="total-cost"
              name="total-cost"
              min="0"
              className="input-material"
              value={totalCost}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={Number(totalCost).toFixed(2) || 0}
              onChange={(e) => setTotalCost(e.target.value)}
            />
            <label htmlFor="total-pounds">Total Pounds:</label>
            {/* <input
              type="number"
              id="total-pounds"
              name="total-pounds"
              min="0"
              className="input-material"
              value={totalPounds}
              onChange={(e) => setTotalPounds(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={totalPounds}
              onChange={(e) => setTotalPounds(e.target.value)}
            />
            <label htmlFor="gross-profit">Gross Profit:</label>
            {/* <input
              type="number"
              id="gross-profit"
              name="gross-profit"
              min="0"
              className="input-material"
              value={grossProfit}
              onChange={(e) => setGrossProfit(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            /> */}
            <NumberInput
              value={Number(grossProfit).toFixed(2) || 0}
              onChange={(e) => setGrossProfit(e.target.value)}
            />
            <label htmlFor="total-charge">Total Price:</label>
            {/* <input
              type="number"
              id="total-charge"
              name="total-charge"
              min="0"
              className="input-material"
              value={totalCharge}
              onChange={(e) => setTotalCharge(Number(e.target.value))}
              onFocus={(e) => handleFocus(e)}
            />*/}
            <NumberInput
              value={Number(totalCharge).toFixed(2) || 0}
              onChange={(e) => setTotalCharge(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Breakdown</h2>
            <label htmlFor="cost-per-inches">Price per Inch:</label>
            {/* <input
              type="number"
              id="cost-per-inches"
              name="cost-per-inches"
              min="0"
              step="0.01"
              className="input-material"
              value={costPerInch}
              onFocus={(e) => handleFocus(e)}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  Number(e.target.value),
                  "cost-by-inches"
                )
              }
            /> */}
            <NumberInput
              value={costPerInch || 0}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  e.target.value,
                  "cost-by-inches"
                )
              }
            />
            <label htmlFor="cost-per-pieces">Price per Piece:</label>
            {/* <input
              type="number"
              id="cost-per-pieces"
              name="cost-per-pieces"
              min="0"
              step="0.01"
              className="input-material"
              value={costPerPiece}
              onFocus={(e) => handleFocus(e)}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  Number(e.target.value),
                  "cost-by-pieces"
                )
              }
            /> */}
            <NumberInput
              value={costPerPiece || 0}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  e.target.value,
                  "cost-by-pieces"
                )
              }
            />
            <label htmlFor="cost-per-pound">Price per Pound:</label>
            {/* <input
              type="number"
              id="cost-per-pounds"
              name="cost-per-pounds"
              min="0"
              step="0.01"
              className="input-material"
              value={costPerPound}
              onFocus={(e) => handleFocus(e)}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  Number(e.target.value),
                  "cost-by-pounds"
                )
              }
            /> */}
            <NumberInput
              value={costPerPound || 0}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  e.target.value,
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
