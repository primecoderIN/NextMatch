
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using System.Security.Claims;



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


        [HttpPut]  //localhost:5001/api/member
        public async Task<ActionResult> UpdateMember([FromBody] MemberUpdateDTO memberUpdateDTO)
        {
            var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier); //“Give me the logged-in user’s unique ID from the JWT token.”

            if (memberId == null) return BadRequest("Invalid member id");
            var member = await memberRepository.GetMemberByIdAsyc(memberId);

            if (member == null) return NotFound();

            member.UserName = memberUpdateDTO.UserName ?? member.UserName;
            member.Description = memberUpdateDTO.Description ?? member.Description;
            member.City = memberUpdateDTO.City ?? member.City;
            member.Country = memberUpdateDTO.Country ?? member.Country;

            memberRepository.Update(member); //Marks the entity as modified in the context
            if (await memberRepository.SaveAllAsync())
            {
                return NoContent(); //204 status code
            }

            return BadRequest("Failed to update member");
        }
    }


}



