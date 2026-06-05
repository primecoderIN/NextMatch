using API.Controllers;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class AdminController(UserManager<AppUser> userManager) : BaseController
    {
        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
             var users = await userManager.Users.ToListAsync();
             var usersWithRoles = new List<object>();
             foreach(var user in users)
             {
                 var roles = await userManager.GetRolesAsync(user);
                    usersWithRoles.Add(new
                    {
                        user.Id,
                        user.UserName,
                        Roles = roles
                    });
        }
            return Ok(usersWithRoles);
        }


        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("edit-roles/{userId}")]
        public async Task<ActionResult<IList<string>>> EditRoles(string userId, [FromQuery] string roles)
        {
            if(string.IsNullOrEmpty(roles)) return BadRequest("You must select at least one role");
            
            var selectedRoles = roles.Split(",").ToArray();

            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Could not find user");

            var userRoles = await userManager.GetRolesAsync(user);

            // Adds roles that exist in selectedRoles but not in userRoles:
            var result = await userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
            if (!result.Succeeded) return BadRequest("Failed to add to roles");
                // Removes roles that exist in userRoles but not in selectedRoles:
            result = await userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
            if (!result.Succeeded) return BadRequest("Failed to remove from roles");

            return Ok(await userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public async Task<ActionResult> GetPhotosToModerate()
        {
            return Ok("Admins or moderators can see this message!");
        }
    }