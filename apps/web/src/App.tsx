import { useEffect } from "react";
import Home from "./pages/Home";

function App() {
  useEffect(() => {
    fetch("http://localhost:3000/api/session", {
      credentials: "include",
    }).catch(() => {});
  }, []);

  return (
    // <div className="flex min-h-svh flex-col items-center justify-center">
    //   <Button>Click me</Button>
    // </div>
    <Home />
  );
}

export default App;
