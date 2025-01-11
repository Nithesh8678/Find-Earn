import { useState } from "react";
import {
  testContractConnection,
  testReportLostItem,
  testGetUserItems,
} from "../utils/contract";

const ContractTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      // Test 1: Contract Connection
      const connectionResult = await testContractConnection();
      setTestResults((prev) => ({
        ...prev,
        connection: connectionResult ? "✅ Success" : "❌ Failed",
      }));

      // Test 2: Report Lost Item
      const reportResult = await testReportLostItem();
      setTestResults((prev) => ({
        ...prev,
        reportLost: reportResult ? "✅ Success" : "❌ Failed",
      }));

      // Test 3: Get User Items
      const items = await testGetUserItems();
      setTestResults((prev) => ({
        ...prev,
        userItems: items.length > 0 ? "✅ Success" : "❌ No items found",
      }));
    } catch (error) {
      console.error("Test suite failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        Smart Contract Integration Tests
      </h2>

      <button
        onClick={runTests}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
      >
        {loading ? "Running Tests..." : "Run Tests"}
      </button>

      {Object.entries(testResults).length > 0 && (
        <div className="mt-4 space-y-2 text-white">
          <h3 className="font-semibold">Test Results:</h3>
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="flex items-center gap-2">
              <span className="font-medium">{test}:</span>
              <span>{result}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractTest;
