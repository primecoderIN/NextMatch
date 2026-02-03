
using API.Interfaces;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using API.Helpers;
using CloudinaryDotNet;

namespace API.Services;

public class PhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;
    public PhotoService(IOptions<CloudinarySettings> config) //Injecting configuration settings
    {
        //Account and Cloudinary class we get from CloudinaryDotNet package
        _cloudinary = new Cloudinary(new Account(
            config.Value.CloudName,
            config.Value.ApiKey,
            config.Value.ApiSecret
        ));
    }
    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        return await _cloudinary.DestroyAsync(deleteParams);
    }

    public async Task<ImageUploadResult> UploadPhotoAsync(IFormFile file)
    {

        var uploadResult = new ImageUploadResult();

        if (file.Length > 0)
        {
            using var stream = file.OpenReadStream(); //To avoid loading entire file into memory at once
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "dating-app",
                Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face")
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }

        return uploadResult;

    }

}
