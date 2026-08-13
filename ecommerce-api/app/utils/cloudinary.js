const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadToCloudinary = (fileBuffer, folder = "images") =>
{
    return new Promise((resolve, reject) =>
    {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) =>
            {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );
        uploadStream.end(fileBuffer);
    });
};


const deleteFromCloudinary = async (publicId) =>
{
    if (!publicId) return;
    try
    {
        await cloudinary.uploader.destroy(publicId);
    } catch (error)
    {
        console.error(`Failed to delete Cloudinary asset [${publicId}]:`, error.message);
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};