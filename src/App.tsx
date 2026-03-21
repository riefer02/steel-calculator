import { useState, useEffect } from "react";
import Loader from "./components/Loader";
import NumberInput from "./components/NumberInput";
import { NumericFormat } from "react-number-format";

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
    setTotalCharge(Number(totalCost / (1 - grossPercentage / 100)));
  const calcCostPerInch = () =>
    setCostPerInch(Number(totalCharge / (length * pieces)));
  const calcCostPerPound = () =>
    setCostPerPound(Number(totalCharge / totalPounds));
  const calcCostPerPiece = () => setCostPerPiece(Number(totalCharge / pieces));
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
              id="od"
              value={outsideDiameter}
              onChange={(event) =>
                setOutsideDiameter(parseFloat(event.target.value) || 0)
              }
            />
            <label htmlFor="length">Length (inches):</label>
            <NumberInput
              id="length"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
            />
            <label htmlFor="pieces">Pieces:</label>
            <NumberInput
              id="pieces"
              value={pieces}
              onChange={(e) => setPieces(parseFloat(e.target.value) || 0)}
            />
            <label htmlFor="cost">Cost per Pound:</label>
            <NumberInput
              id="cost"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
            />
            <label htmlFor="external-cost">External Costs:</label>
            <NumberInput
              id="external-cost"
              value={externalCost}
              onChange={(e) => setExternalCost(parseFloat(e.target.value) || 0)}
              noDecimals={true}
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
            />
          </div>
          <div className="flex flex-col gap-y-4 ">
            <h2 className="text-center text-2xl">Outputs</h2>
            <label htmlFor="total-cost">Total Cost:</label>
            <NumericFormat
              id="total-cost"
              value={totalCost}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                setTotalCost(val.floatValue ?? 0);
              }}
              decimalScale={2}
            />
            <label htmlFor="total-pounds">Total Pounds:</label>
            <NumberInput
              id="total-pounds"
              value={totalPounds}
              onChange={(e) => setTotalPounds(parseFloat(e.target.value) || 0)}
            />
            <label htmlFor="gross-profit">Gross Profit:</label>
            <NumericFormat
              id="gross-profit"
              value={grossProfit}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                setGrossProfit(val.floatValue ?? 0);
              }}
              decimalScale={2}
            />
            <label htmlFor="total-charge">Total Price:</label>
            <NumericFormat
              id="total-charge"
              value={totalCharge}
              displayType={"input"}
              thousandSeparator={true}
              prefix={"$"}
              className="input-material"
              onValueChange={(val) => {
                setTotalCharge(val.floatValue ?? 0);
              }}
              decimalScale={2}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <h2 className="text-center text-2xl">Breakdown</h2>
            <label htmlFor="cost-per-inches">Price per Inch:</label>
            <NumericFormat
              id="cost-per-inches"
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
            <label htmlFor="cost-per-pieces">Price per Piece:</label>
            <NumericFormat
              id="cost-per-pieces"
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
            <label htmlFor="cost-per-pound">Price per Pound:</label>
            <NumericFormat
              id="cost-per-pound"
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
