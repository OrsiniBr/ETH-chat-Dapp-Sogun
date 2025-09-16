import { useState } from "react";
import { useAccount } from "wagmi";
import { useChat } from "../hooks/useChat";
import { uploadImageForENS } from "../utils/pinata";
import { ArrowLeft, Upload, User, Image } from "lucide-react";

const RegisterPage = ({ onNavigate }) => {
  const { address } = useAccount();
  const { registerUser, domain, registrationFee } = useChat();
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const uploadResult = await uploadImageForENS(
        formData.image,
        formData.name
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }
      await registerUser(formData.name, uploadResult.ipfsHash);
      onNavigate("users");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Create Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              {formData.name && domain && (
                <p className="text-xs text-gray-500 mt-1">
                  Your ENS: {formData.name}.{domain}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full mx-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("imageInput").click()
                      }
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("imageInput").click()
                      }
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Upload Image
                    </button>
                  </div>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {registrationFee > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  Registration Fee:{" "}
                  {(Number(registrationFee) / 1e18).toFixed(4)} ETH
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.image}
              className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
