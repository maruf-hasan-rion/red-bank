import axios from "axios";

const Upload = async (file) => {
  if (!file) {
    throw new Error('An image file is required');
  }

  const dataFile = new FormData();
  dataFile.append("file", file);
  dataFile.append("upload_preset", `${import.meta.env.VITE_CLOUDINARY_PRESET}`);
  dataFile.append(
    "cloud_name",
    `${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}`
  );

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/image/upload`,
    dataFile,
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
  );

  if (!data?.secure_url) {
    throw new Error('Image upload did not return a URL');
  }

  return data;
};

export default Upload;
