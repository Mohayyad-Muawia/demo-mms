import React from "react";
import LastDevices from "./components/home/LastDevices";
import Statistics from "./components/home/Statistics";

export default async function Home() {
  return (
    <div className="home page">
      <Statistics />
      <LastDevices />
    </div>
  );
}
