
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using API.Extensions;




namespace API.Controllers
{
    [Authorize] //All endpoints in this controller require authentication unless overridden at method level
    public class MembersController(IMemberRepository memberRepository, IPhotoService photoService) : BaseController
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
            // var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier); //“Give me the logged-in user’s unique ID from the JWT token.”

            var memberId = User.GetMemberId();
            if (memberId == null) return Unauthorized();

            var member = await memberRepository.GetMemberByIdForUpdate(memberId);

            if (member == null) return NotFound();

            member.UserName = memberUpdateDTO.UserName ?? member.UserName;
            member.Description = memberUpdateDTO.Description ?? member.Description;
            member.City = memberUpdateDTO.City ?? member.City;
            member.Country = memberUpdateDTO.Country ?? member.Country;

            member.User.UserName = memberUpdateDTO.UserName ?? member.User.UserName; //Sync the username in AppUser entity

            memberRepository.Update(member); //Marks the entity as modified in the context
            if (await memberRepository.SaveAllAsync())
            {
                return NoContent(); //204 status code
            }

            return BadRequest("Failed to update member");
        }


        [HttpPost("upload-photo")]
        public async Task<ActionResult<Photo>> UploadProfilePicture([FromForm] IFormFile file)
        {
            var memberId = User.GetMemberId();
            if (memberId == null) return Unauthorized();

            var member = await memberRepository.GetMemberByIdForUpdate(memberId);
            if (member == null) return NotFound();

            var result = await photoService.UploadPhotoAsync(file);

            if (result.Error != null)
            {
                return BadRequest(result.Error.Message);
            }

            var photo = new Photo()
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                MemberId = memberId
            };

            if (member.ImageUrl == null)
            {
                member.ImageUrl = photo.Url;
                member.User.ImageUrl = photo.Url;
            }

            member.Photos.Add(photo);

            if (await memberRepository.SaveAllAsync())
            {
                return photo;
            }


            return BadRequest("Problem saving photo");
        }


        [HttpPut("set-default-photo/{photoId}")]  //localhost:5001/api/member/set-default-photo?photoId=123

        public async Task<ActionResult> SetDefaultPhoto(int photoId)
        {
            var memberId = User.GetMemberId();
            if (memberId == null) return Unauthorized();

            var member = await memberRepository.GetMemberByIdForUpdate(memberId);
            if (member == null) return NotFound();

            var photo = member.Photos.SingleOrDefault(p => p.Id == photoId);
            if (photo == null || member.ImageUrl == photo.Url) return BadRequest();

            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;

            if (await memberRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest("Failed to set default photo");

        }
    }

}



