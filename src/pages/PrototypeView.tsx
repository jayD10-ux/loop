
import { useParams } from "react-router-dom";
import { PrototypeViewer } from "@/components/prototype/PrototypeViewer";

const PrototypeView = () => {
  const { id = "1" } = useParams();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <PrototypeViewer id={id} />
    </div>
  );
};

export default PrototypeView;
