using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using API.DTOs;
using API.Interfaces;
using API.Extensions; //To use AsUserDTO extension method

namespace API.Controllers
{

    public class AccountController(AppDBContext DbContext, ITokenService tokenService) : BaseController
    {
        [HttpPost("register")] // localhost:5001/api/account/register

        //When we mention string the controller will look it into query params by default RegisterUser(string userName,  string email,string password) so not using here
        public async Task<ActionResult<UserDTO>> RegisterUser([FromBody] RegisterDTO registerDTO) //Task is used with async await to wait for the task to be completed
        {

            if (await UserExists(registerDTO.UserName))
            {
                return BadRequest("Username is already taken");
            }
            if (await EmailExists(registerDTO.Email))
            {
                return BadRequest("Email is already registered");
            }
            using var hmac = new HMACSHA512(); //using removes the object after use to free up memory, it dos not wait for garbage collection

            //DBCOntext and token service are automatically freed up by the framework as they are registered in the dependency injection container, so we don't need to worry about disposing them. However, for the HMACSHA512 instance, we need to ensure that it is properly disposed of after use to free up any resources it may be holding. By using the 'using' statement, we ensure that the HMACSHA512 instance is disposed of correctly once we are done with it, preventing any potential memory leaks or resource issues.
            //For hmac, we need to dispose it after use because it implements the IDisposable interface, which means it may be holding onto unmanaged resources that need to be released explicitly. By using the 'using' statement, we ensure that the Dispose method is called on the HMACSHA512 instance when we are finished with it, allowing it to clean up any resources it may be using.

            var newUser = new AppUser
            {
                UserName = registerDTO.UserName,
                Email = registerDTO.Email,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
                PasswordSalt = hmac.Key,
                Member = new Member
                {
                    UserName = registerDTO.UserName,
                    DateOfBirth = registerDTO.DateOfBirth,
                    Gender = registerDTO.Gender,
                    City = registerDTO.City,
                    Country = registerDTO.Country
                }
            };

            DbContext.Users.Add(newUser);
            await DbContext.SaveChangesAsync();
            return newUser.AsUserDTO(tokenService);
        }

        private async Task<bool> UserExists(string userName)
        {
            return await DbContext.Users.AnyAsync(u => u.UserName.ToLower() == userName.ToLower());
        }

        private async Task<bool> EmailExists(string email)
        {
            return await DbContext.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        [HttpPost("login")]  //localhost:5001/api/member/login
        public async Task<ActionResult<UserDTO>> LoginUser([FromBody] LoginDTO loginDTO)
        {
            var user = await DbContext.Users.SingleOrDefaultAsync(u => u.Email.ToLower() == loginDTO.Email.ToLower());

            if (user == null)
            {
                return Unauthorized("User does not exist");
            }

            using var hmac = new HMACSHA512(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTO.Password));

            //Becase hash is a byte array we need to compare each byte of the computed hash with the stored password hash, if any byte does not match, we return unauthorized

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                {
                    return Unauthorized("Invalid Password");
                }
            }

            return user.AsUserDTO(tokenService);
        }
    }
}
