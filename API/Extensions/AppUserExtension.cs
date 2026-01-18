using API.DTOs;
using API.Entities;
using API.Interfaces;
namespace API.Extensions
{
    public static class AppUserExtensions //We can not do dependency injection in static classes so passing ITokenService as parameter
    {
        public static UserDTO AsUserDTO(this AppUser user, ITokenService tokenService)
        {
            return new UserDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Token = tokenService.CreateToken(user)
            };
        }
    }
}