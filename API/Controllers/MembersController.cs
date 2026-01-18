using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace API.Controllers
{
     [Authorize] //All endpoints in this controller require authentication unless overridden at method level
    public class MembersController(AppDBContext DbContext) : BaseController
    {   
        // [Authorize] //This is optional here as we have added at class level
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers()
        {
            //We return 200 status code with data type list always
            var members = await DbContext.Users
                .AsNoTracking() //improves performance as we are only reading data no need to track changes
                .ToListAsync(); //executes the query and returns the result as a list, for no records it returns empty list

            return Ok(members);
        }

        //  [AllowAnonymous] //Overrides the [Authorize] at class level
        [HttpGet("{id}")]  //localhost:5001/api/member/123
        public async Task<ActionResult<AppUser>> GetMemberById([FromRoute] string id)
        {
            var member = await DbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == id); // SingleOrDefaultAsync returns a single element or a default value if no such element is found.

            // You can use FindAsync() OR AsNoTracking() — but never both together.

            if (member == null)
            {
                return NotFound();
            }
            return member;
        }
    }
}


// | Scenario                 | Recommendation   |
// | ------------------------ | ---------------- |
// | Simple CRUD app          | `FindAsync()`    |
// | High traffic / read-only | `AsNoTracking()` |
// | Followed by update       | `FindAsync()`    |
// | Microservice API         | `AsNoTracking()` |
