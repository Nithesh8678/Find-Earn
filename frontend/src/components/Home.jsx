import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const Home = ({ account, onDisconnect }) => {
  if (!account) return null;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/homebg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-20">
          <Navbar onDisconnect={onDisconnect} />

          {/* Main Content */}
          <main className="relative mt-20 flex min-h-[600px] items-start">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl font-iceberg">
                Lost or Found? We've got you covered.
              </h1>
              <p className="mt-6 text-xl text-white/90">
                Connect with finders and recover your lost items quickly and
                securely
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row wallet-connect">
                <Link to="/report-lost">
                  <button className="bg-purple-600 hover:bg-purple-700 mt-10 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
                    Report lost
                  </button>
                </Link>
                <Link to="/submit-found">
                  <button className="bg-purple-600 hover:bg-purple-700 mt-10 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
                    Submit found
                  </button>
                </Link>
              </div>
              <Link
                to="/recent-lost-items"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Recent Lost Items
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
