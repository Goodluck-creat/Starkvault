import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import NFTDetails from "../../../components/NFTDetails";

export default function DocumentPage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Document Details</h1>
        <NFTDetails documentId={id} />
      </main>
    </div>
  );
}
