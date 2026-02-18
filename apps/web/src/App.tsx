import { useEffect } from "react";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import { API_BASE_URL } from "@/lib/env";

function App() {
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/session`, {
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
