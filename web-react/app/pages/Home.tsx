import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="Welcome">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
        <p className="text-gray-600">
          This is the protected home page that is only accessible after logging in.
        </p>
      </div>
    </Layout>
  );
} 