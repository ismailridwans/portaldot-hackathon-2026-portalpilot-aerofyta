import { useEffect, useState } from "react";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

function currentRoute() {
  return window.location.hash.includes("app") ? "app" : "home";
}

export default function App() {
  const [route, setRoute] = useState<string>(currentRoute());

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const launch = () => {
    window.location.hash = "#/app";
    setRoute("app");
    window.scrollTo(0, 0);
  };
  const home = () => {
    window.location.hash = "#/";
    setRoute("home");
    window.scrollTo(0, 0);
  };

  return route === "app" ? <Dashboard onHome={home} /> : <Landing onLaunch={launch} />;
}
