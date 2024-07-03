import { RootState } from "@/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Input } from "./ui/input";
import axios from "axios";

const UpdateProfile = () => {

  const user = useSelector((state: RootState) => state.user);

  const [hover, setHover] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const host = import.meta.env.VITE_SOME_HOST;

  let token = localStorage.getItem("authToken");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async (e: any) => {
    e.preventDefault();
    console.log(selectedFile);
    const formData: any = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.put(`${host}/updateProfileImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'auth-token': token
        }
      });
      if (response.data.message === "Profile Updated") {
        closeModal();
      }

    } catch (error: any) {
      console.log(error);
    }

  };

  return (
    <div className="h-full">
      <div className="h-1/2 flex items-center justify-center">
        {
          hover ?

            <div className="relative rounded-full w-full h-full" onClick={openModal} onMouseLeave={() => setHover(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="cursor-pointer absolute left-44 top-44 w-6 h-6 z-10" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <img
                className="absolute left-24 top-24 rounded-full w-1/2 h-1/2 cursor-pointer opacity-30"
                src={`http://localhost:5000/${user.logo}`}
                alt="icon"
              />
            </div>
            :
            <img
              onMouseEnter={() => setHover(true)}
              className="rounded-full w-1/2 h-1/2 mt-2 cursor-pointer"
              src={`http://localhost:5000/${user.logo}`}
              alt="icon"
            />
        }
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg">
            <button onClick={closeModal} className="absolute top-0 right-0 p-2 m-2 text-my-bg hover:text-gray-800">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Update Profile</h2>
              <p className="mb-4">Select a file:</p>
              {/* <input type="file" onChange={handleFileChange} className="mb-4" /> */}
              <Input className='bg-mg-bg cursor-pointer mb-4 shadow appearance-none border-my-bg rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline' type="file" accept="image/*" onChange={handleFileChange} />
              <button onClick={handleFileUpload} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">Upload profile</button>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

export default UpdateProfile