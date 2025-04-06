
import { Header } from "@/components/layout/Header";
import { AddPrototypeForm } from "@/components/add-prototype/AddPrototypeForm";

const AddPrototype = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 bg-muted/30">
        <AddPrototypeForm />
      </main>
    </div>
  );
};

export default AddPrototype;
