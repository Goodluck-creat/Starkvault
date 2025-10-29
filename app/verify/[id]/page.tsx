import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import QRVerification from "../../../components/QRVerification";

export default function VerifyPage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Verify Document</h1>
        <QRVerification documentId={id} />
      </main>
    </div>
  );
}
