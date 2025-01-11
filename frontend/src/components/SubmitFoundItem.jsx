import { ArrowLeft } from "lucide-react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const SubmitFoundItem = () => {
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
      <div className="container mx-auto px-4 pt-20">
        <Navbar />

        {/* Form Section */}
        <div className="mt-8 relative">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/home">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-5xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Report a Found item
            </h1>
          </div>

          <form className="max-w-2xl space-y-6 relative z-10">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white text-lg font-medium">
                    What was found?
                  </label>
                  <Input
                    placeholder="Item name"
                    className="h-12 bg-white/10 border-0 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white text-lg font-medium">
                    Image of the found item
                  </label>
                  <Input
                    type="file"
                    placeholder="Upload image"
                    className="h-12 bg-white/10 border-0 text-white placeholder:text-white/50 file:bg-transparent file:border-0 file:text-white/70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white text-lg font-medium">
                  Category
                </label>
                <select className="w-full h-12 bg-white/10 border-0 text-white rounded-md p-2">
                  <option value="" className="bg-gray-800">
                    Select
                  </option>
                  <option value="electronics" className="bg-gray-800">
                    Electronics
                  </option>
                  <option value="jewelry" className="bg-gray-800">
                    Jewelry
                  </option>
                  <option value="documents" className="bg-gray-800">
                    Documents
                  </option>
                  <option value="other" className="bg-gray-800">
                    Other
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white text-lg font-medium">
                  Location
                </label>
                <Input
                  placeholder="Where found"
                  className="h-12 bg-white/10 border-0 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white text-lg font-medium">
                  Date of discovery
                </label>
                <Input
                  placeholder="DD/MM/YYYY"
                  type="date"
                  className="h-12 bg-white/10 border-0 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="wallet-connect">
              <button className="bg-purple-600 w-40 hover:bg-purple-700 my-6 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitFoundItem;
