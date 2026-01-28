import axios from 'axios';

export const uploadToCloudinary = async (file) => {
	try{const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', 'Social');

  const res = await axios.post(
    process.env.REACT_APP_CLOUDINARY_CLOUD_URL,
    formData
  );

  return {
    url: res.data.secure_url,
    publicId: res.data.public_id,
    width: res.data.width,
    height: res.data.height,
    format: res.data.format,
  };
}
  catch(err){
	console.error('Cloudinary upload error:', err.response?.data || err.message);
	throw new Error('Cloudinary upload failed');
  }
  
};
