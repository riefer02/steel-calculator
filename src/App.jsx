import { useState, useEffect } from "react";
import Loader from "./components/Loader.jsx";
import NumberInput from "./components/NumberInput.jsx";
import { NumericFormat } from "react-number-format";

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
          Number(externalCost)
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
    setTotalCharge(Number(totalCost / (1 - grossPercentage / 100)));
  const calcCostPerInch = () =>
    setCostPerInch(Number(totalCharge / (length * pieces)));
  const calcCostPerPound = () =>
    setCostPerPound(Number(totalCharge / totalPounds));
  const calcCostPerPiece = () => setCostPerPiece(Number(totalCharge / pieces));
  const calcGrossProfit = () => setGrossProfit(Number(totalCharge - totalCost));

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
    setGrossPercentage(newGrossPercentage);
  });

  const handleModifiedCostPerPound = debounce(() => {
    const grossRevenue = costPerPound * totalPounds;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = (netProfits / grossRevenue) * 100;
    setGrossPercentage(newGrossPercentage);
  });

  const handleModifiedCostPerPiece = debounce(() => {
    const grossRevenue = costPerPiece * pieces;
    const netProfits = grossRevenue - totalCost;
    const newGrossPercentage = (netProfits / grossRevenue) * 100;
    setGrossPercentage(newGrossPercentage);
  });

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
            <NumberInput
              value={outsideDiameter}
              onChange={(event) => setOutsideDiameter(event.target.value)}
            />
            <label htmlFor="length">Length (inches):</label>
            <NumberInput
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
            <label htmlFor="pieces">Pieces:</label>
            <NumberInput
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
            />
            <label htmlFor="cost">Cost per Pound:</label>
            <NumberInput
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <label htmlFor="cost">External Costs:</label>
            <NumberInput
              value={externalCost}
              onChange={(e) => setExternalCost(e.target.value)}
              noDecimals={true}
            />
            <label htmlFor="gross-percentage">Margin</label>
            <NumericFormat
              value={grossPercentage}
              suffix="%"
              displayType={"input"}
              className="input-material"
              onValueChange={(val) => {
                setGrossPercentage(val.floatValue);
              }}
              decimalScale={2}
            />
          </div>
          <div className="flex flex-col gap-y-4 ">
            <h2 className="text-center text-2xl">Outputs</h2>
            <label htmlFor="total-cost">Total Cost:</label>
            <NumericFormat
              value={totalCost}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                setTotalCost(val.floatValue);
              }}
              decimalScale={2}
            />
            <label htmlFor="total-pounds">Total Pounds:</label>
            <NumberInput
              value={totalPounds}
              onChange={(e) => setTotalPounds(e.target.value)}
            />
            <label htmlFor="gross-profit">Gross Profit:</label>
            <NumericFormat
              value={grossProfit}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                setGrossProfit(val.floatValue);
              }}
              decimalScale={2}
            />
            <label htmlFor="total-charge">Total Price:</label>
            <NumericFormat
              value={totalCharge}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                setTotalCharge(val.floatValue);
              }}
              decimalScale={2}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Breakdown</h2>
            <label htmlFor="cost-per-inches">Price per Inch:</label>
            <NumericFormat
              value={costPerInch || 0}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                handleRecalculateGrossPercentage(
                  val.floatValue,
                  "cost-by-inches"
                );
              }}
              decimalScale={2}
            />
            {/* <NumberInput
              value={usdFormat.format(costPerInch) || 0}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  e.target.value,
                  "cost-by-inches"
                )
              }
            /> */}
            {/* <USDNumberFormat
              className="number-input"
              value={costPerInch}
              onValueChange={(val) => {
                setLoading(true);
                debounce(() => setCostPerInch(val.floatValue));
              }}
              decimalScale={2}
              thousandSeparator={true}
              prefix={"$"}
            /> */}
            <label htmlFor="cost-per-pieces">Price per Piece:</label>
            <NumericFormat
              value={costPerPiece || 0}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                handleRecalculateGrossPercentage(
                  val.floatValue,
                  "cost-by-pieces"
                );
              }}
              decimalScale={2}
            />
            {/* <NumberInput
              value={usdFormat.format(costPerPiece) || 0}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  e.target.value,
                  "cost-by-pieces"
                )
              }
            /> */}
            <label htmlFor="cost-per-pound">Price per Pound:</label>
            <NumericFormat
              value={costPerPound || 0}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                handleRecalculateGrossPercentage(
                  val.floatValue,
                  "cost-by-pounds"
                );
              }}
              decimalScale={2}
            />
            {/* <NumberInput
              value={usdFormat.format(costPerPound) || 0}
              onChange={(e) =>
                handleRecalculateGrossPercentage(
                  e.target.value,
                  "cost-by-pounds"
                )
              }
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
