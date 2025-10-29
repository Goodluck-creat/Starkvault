import Navbar from "../../components/Navbar";
import UploadForm from "../../components/UploadForm";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Upload Document</h1>
        <UploadForm />
      </main>
    </div>
  );
}
