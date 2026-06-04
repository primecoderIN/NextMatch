using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using API.DTOs;
using API.Interfaces;
using API.Extensions; //To use AsUserDTO extension method

namespace API.Controllers
{

    public class AccountController(ITokenService tokenService, UserManager<AppUser> userManager) : BaseController
    {
        [HttpPost("register")] // localhost:5001/api/account/register

        //When we mention string the controller will look it into query params by default RegisterUser(string userName,  string email,string password) so not using here
        public async Task<ActionResult<UserDTO>> RegisterUser([FromBody] RegisterDTO registerDTO) //Task is used with async await to wait for the task to be completed
        {

            var newUser = new AppUser
            {
                UserName = registerDTO.UserName,
                Email = registerDTO.Email,
                Member = new Member
                {
                    UserName = registerDTO.UserName,
                    DateOfBirth = registerDTO.DateOfBirth,
                    Gender = registerDTO.Gender,
                    City = registerDTO.City,
                    Country = registerDTO.Country
                }
            };

            // Use Identity's UserManager to hash the password and save the user
            var result = await userManager.CreateAsync(newUser, registerDTO.Password);

            if (!result.Succeeded)
            {
                // Return errors from Identity
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Registration failed: {errors}");

                //Another way to return errors

                // foreach (var error in result.Errors)
                // {
                //     ModelState.AddModelError(error.Code, error.Description);
                // }

                // return ValidationProblem();
            }

            return newUser.AsUserDTO(tokenService);
        }

      

        [HttpPost("login")]  //localhost:5001/api/member/login
        public async Task<ActionResult<UserDTO>> LoginUser([FromBody] LoginDTO loginDTO)
        {
            var user = await userManager.FindByEmailAsync(loginDTO.Email);

            if (user == null)
            {
                return Unauthorized("User does not exist");
            }

            // Use Identity's built-in password verification
            var isPasswordValid = await userManager.CheckPasswordAsync(user, loginDTO.Password);

            if (!isPasswordValid)
            {
                return Unauthorized("Invalid Password");
            }

            return user.AsUserDTO(tokenService);
        }
    }
}
