
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { PrototypeViewer } from "@/components/prototype/PrototypeViewer";

const PrototypeView = () => {
  const { id = "1" } = useParams();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 bg-muted/30">
        <PrototypeViewer id={id} />
      </main>
    </div>
  );
};

export default PrototypeView;
