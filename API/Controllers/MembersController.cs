
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;



namespace API.Controllers
{
     [Authorize] //All endpoints in this controller require authentication unless overridden at method level
    public class MembersController(IMemberRepository memberRepository) : BaseController
    {   
        // [Authorize] //This is optional here as we have added at class level
        // [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers()
        {
           return Ok(await memberRepository.GetMembersAsync()); 
        }


        // [Authorize]
        [HttpGet("{id}")]  //localhost:5001/api/member/123
        public async Task<ActionResult<Member>> GetMemberById([FromRoute] string id)
        {
            var member = await memberRepository.GetMemberByIdAsyc(id);

            if (member == null)
            {
                return NotFound();
            }
            return member;
        }

        // [Authorize]
        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos([FromRoute] string id)
        {
            return Ok(await memberRepository.GetPhotoForMemberAsync(id));
            
        }
    }
}



