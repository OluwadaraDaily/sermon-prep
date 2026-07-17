import { BrowserRouter, Route, Routes } from "react-router-dom";

import { LandingPage } from "../pages/LandingPage";
import { WorkspacePage } from "../pages/WorkspacePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<WorkspacePage />} path="/workspace" />
        <Route element={<LandingPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
