import { useState, useEffect } from "react";
import Loader from "./components/Loader";
import { NumericFormat } from "react-number-format";
import { safeDivide } from "./utils";

import "./App.css";

type CostField = "cost-by-inches" | "cost-by-pieces" | "cost-by-pounds";

let timer: ReturnType<typeof setTimeout> | undefined;

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

  function debounce(func: () => void, timeout = 1000) {
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func();
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
    setTotalCharge(safeDivide(totalCost, 1 - grossPercentage / 100));
  const calcCostPerInch = () =>
    setCostPerInch(safeDivide(totalCharge, length * pieces));
  const calcCostPerPound = () =>
    setCostPerPound(safeDivide(totalCharge, totalPounds));
  const calcCostPerPiece = () =>
    setCostPerPiece(safeDivide(totalCharge, pieces));
  const calcGrossProfit = () => setGrossProfit(Number(totalCharge - totalCost));

  useEffect(() => {
    calcTotalCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outsideDiameter, length, pieces, cost, externalCost]);

  useEffect(() => {
    calcTotalPounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outsideDiameter, length, pieces]);

  useEffect(() => {
    calcTotalCharge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCost, grossPercentage]);

  useEffect(() => {
    calcGrossProfit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCharge, totalCost]);

  useEffect(() => {
    calcCostPerPound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCharge, totalPounds]);

  useEffect(() => {
    calcCostPerInch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCharge, length, pieces]);

  useEffect(() => {
    calcCostPerPiece();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCharge, pieces]);

  useEffect(() => {
    if (!isLoading) return;
    handleModifiedCostPerInch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costPerInch]);

  useEffect(() => {
    if (!isLoading) return;
    handleModifiedCostPerPound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costPerPound]);

  useEffect(() => {
    if (!isLoading) return;
    handleModifiedCostPerPiece();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costPerPiece]);

  useEffect(() => {
    if (isLoading) setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossPercentage]);

  const handleRecalculateGrossPercentage = (
    value: number | undefined,
    field: CostField
  ) => {
    setLoading(true);
    if (field === "cost-by-inches") {
      setCostPerInch(value ?? 0);
    } else if (field === "cost-by-pieces") {
      setCostPerPiece(value ?? 0);
    } else if (field === "cost-by-pounds") {
      setCostPerPound(value ?? 0);
    }
  };

  const handleModifiedCostPerInch = debounce(() => {
    const grossRevenue = costPerInch * length * pieces;
    const netProfits = grossRevenue - totalCost;
    setGrossPercentage(safeDivide(netProfits, grossRevenue) * 100);
  });

  const handleModifiedCostPerPound = debounce(() => {
    const grossRevenue = costPerPound * totalPounds;
    const netProfits = grossRevenue - totalCost;
    setGrossPercentage(safeDivide(netProfits, grossRevenue) * 100);
  });

  const handleModifiedCostPerPiece = debounce(() => {
    const grossRevenue = costPerPiece * pieces;
    const netProfits = grossRevenue - totalCost;
    setGrossPercentage(safeDivide(netProfits, grossRevenue) * 100);
  });

  const handleReset = () => {
    setOutsideDiameter(0);
    setLength(0);
    setPieces(0);
    setCost(0);
    setExternalCost(0);
    setGrossPercentage(0);
  };

  const warnings: string[] = [];
  if (grossPercentage >= 100) warnings.push("Margin cannot be 100% or higher.");
  if (grossPercentage < 0) warnings.push("Margin cannot be negative.");

  return (
    <div className="bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900 min-h-screen lg:grid items-center justify-center">
      <div className="mx-auto max-w-7xl w-full p-4 bg-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-80 border border-gray-100">
        <div className="flex items-center justify-center gap-4 mb-4 relative">
          <h1 className="text-3xl text-center">Steel Calculator</h1>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Inputs</h2>
            <label htmlFor="od">Outside Diameter (inches):</label>
            <NumericFormat
              id="od"
              value={outsideDiameter}
              displayType={"input"}
              className="input-material"
              placeholder="inches"
              onValueChange={(val) => setOutsideDiameter(val.floatValue ?? 0)}
              decimalScale={4}
              allowNegative={false}
            />
            <label htmlFor="length">Length (inches):</label>
            <NumericFormat
              id="length"
              value={length}
              displayType={"input"}
              className="input-material"
              placeholder="inches"
              onValueChange={(val) => setLength(val.floatValue ?? 0)}
              decimalScale={4}
              allowNegative={false}
            />
            <label htmlFor="pieces">Pieces:</label>
            <NumericFormat
              id="pieces"
              value={pieces}
              displayType={"input"}
              className="input-material"
              placeholder="qty"
              onValueChange={(val) => setPieces(val.floatValue ?? 0)}
              decimalScale={0}
              allowNegative={false}
            />
            <label htmlFor="cost">Cost per Pound:</label>
            <NumericFormat
              id="cost"
              value={cost}
              displayType={"input"}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => setCost(val.floatValue ?? 0)}
              decimalScale={4}
              allowNegative={false}
            />
            <label htmlFor="external-cost">External Costs:</label>
            <NumericFormat
              id="external-cost"
              value={externalCost}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => setExternalCost(val.floatValue ?? 0)}
              decimalScale={2}
              allowNegative={false}
            />
            <label htmlFor="gross-percentage">Margin</label>
            <NumericFormat
              id="gross-percentage"
              value={grossPercentage}
              suffix="%"
              displayType={"input"}
              className="input-material"
              onValueChange={(val) => {
                setGrossPercentage(val.floatValue ?? 0);
              }}
              decimalScale={2}
              allowNegative={false}
              isAllowed={(values) => (values.floatValue ?? 0) < 100}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Outputs</h2>
            <p className="text-sm font-medium text-gray-700">Total Cost:</p>
            <div className="output-readonly">
              <NumericFormat
                value={totalCost}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"$"}
                decimalScale={2}
              />
            </div>
            <p className="text-sm font-medium text-gray-700">Total Pounds:</p>
            <div className="output-readonly">
              <NumericFormat
                value={totalPounds}
                displayType={"text"}
                thousandSeparator={true}
                decimalScale={2}
              />
            </div>
            <p className="text-sm font-medium text-gray-700">Gross Profit:</p>
            <div className="output-readonly">
              <NumericFormat
                value={grossProfit}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"$"}
                decimalScale={2}
              />
            </div>
            <p className="text-sm font-medium text-gray-700">Total Price:</p>
            <div className="output-readonly">
              <NumericFormat
                value={totalCharge}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"$"}
                decimalScale={2}
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Breakdown</h2>
            <p className="text-center text-xs text-gray-500 h-5">
              {isLoading ? (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Loader /> Recalculating...
                </span>
              ) : (
                "Edit to recalculate margin"
              )}
            </p>
            <label htmlFor="cost-per-inches">Price per Inch:</label>
            <NumericFormat
              id="cost-per-inches"
              value={costPerInch || 0}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-breakdown"
              onValueChange={(val) => {
                handleRecalculateGrossPercentage(
                  val.floatValue,
                  "cost-by-inches"
                );
              }}
              decimalScale={2}
            />
            <label htmlFor="cost-per-pieces">Price per Piece:</label>
            <NumericFormat
              id="cost-per-pieces"
              value={costPerPiece || 0}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-breakdown"
              onValueChange={(val) => {
                handleRecalculateGrossPercentage(
                  val.floatValue,
                  "cost-by-pieces"
                );
              }}
              decimalScale={2}
            />
            <label htmlFor="cost-per-pound">Price per Pound:</label>
            <NumericFormat
              id="cost-per-pound"
              value={costPerPound || 0}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-breakdown"
              onValueChange={(val) => {
                handleRecalculateGrossPercentage(
                  val.floatValue,
                  "cost-by-pounds"
                );
              }}
              decimalScale={2}
            />
          </div>
          {warnings.length > 0 && (
            <div className="col-span-1 lg:col-span-3 mt-2">
              {warnings.map((w, i) => (
                <p key={i} className="text-sm text-red-600">
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
