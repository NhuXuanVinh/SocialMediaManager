	const cloudinary = require('../config/cloudinary');
	const fs = require('fs');

	const uploadFilesToCloudinary = async (files, options = {}) => {
	if (!files || files.length === 0) return [];

	const uploads = [];

	for (const file of files) {
		const result = await cloudinary.uploader.upload(file.path, {
		folder: options.folder || 'posts',
		resource_type: 'image', // or 'auto'
		});

		uploads.push({
		url: result.secure_url,
		publicId: result.public_id,
		width: result.width,
		height: result.height,
		format: result.format,
		});

		// cleanup temp file
		fs.unlinkSync(file.path);
	}

	return uploads;
	};

	module.exports = { uploadFilesToCloudinary };
