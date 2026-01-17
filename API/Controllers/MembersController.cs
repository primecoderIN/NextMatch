using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Controllers;

namespace API.Controllers
{

    public class MembersController(AppDBContext DbContext) : BaseController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers() //Task is used with async await to wait for the task to be completed
        {
            var members = await DbContext.Users.ToListAsync();
            return members;
        }

        [HttpGet("{Id}")]  //localhost:5001/api/member/123
        public async Task<ActionResult<AppUser>> GetMemberById([FromRoute] string Id)
        {
            var member = await DbContext.Users.FindAsync(Id);

            if (member == null)
            {
                return NotFound();
            }
            return member;
        }
    }
}
