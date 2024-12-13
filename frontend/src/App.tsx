import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Menu from "./components/menu";
import { Home, Datasets, DatasetDetails } from "./pages";

export default function App() {
  return (
    <Router>
      <main className="relative h-screen overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <div className="flex items-start justify-between">
          <Menu />
          <div className="flex flex-col w-full pl-0 md:p-4 md:space-y-4">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/datasets/:datasetId" element={<DatasetDetails />} />
                </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </Router>
  );
}
