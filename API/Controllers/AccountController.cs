using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using API.DTOs;
using API.Interfaces;

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
            using var hmac = new HMACSHA512(); //using removes the object after use to free up memory

            var newUser = new AppUser
            {
                UserName = registerDTO.UserName,
                Email = registerDTO.Email,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
                PasswordSalt = hmac.Key
            };

            DbContext.Users.Add(newUser);
            await DbContext.SaveChangesAsync();
            return new UserDTO
            {
                Id = newUser.Id,
                UserName = newUser.UserName,
                Email = newUser.Email,
                Token = tokenService.CreateToken(newUser)
            };
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

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                {
                    return Unauthorized("Invalid Password");
                }
            }

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
