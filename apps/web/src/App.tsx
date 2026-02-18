import { useEffect } from "react";
import Home from "./pages/Home";
import { Toaster } from "sonner";

function App() {
  useEffect(() => {
    fetch("http://localhost:3000/api/session", {
      credentials: "include",
    }).catch(() => {});
  }, []);

  return (
    <>
      <Home />
      <Toaster position="top-right" richColors expand />
    </>
  );
}

export default App;
