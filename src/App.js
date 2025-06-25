import React from "react";
import { BrowserRouter } from "react-router-dom";
import Homepage from "./Homepage";

const App = () => {
  return (
    <BrowserRouter>
      <Homepage />
    </BrowserRouter>
  );
};

export default App;
