import { Badge } from "./components/ui/badge";

function App() {
  return (
    <>
      <div className="w-screen h-screen flex items-center gap-4 justify-center">
        <Badge variant={"success"}>success</Badge>
        <Badge variant={"pending"}>pending</Badge>
        <Badge variant={"failed"}>failed</Badge>
      </div>
    </>
  );
}

export default App;
