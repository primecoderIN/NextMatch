
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class LikesController(ILikesRepository likesRepository) : BaseController
{
    [HttpPost("{targetMemberId}")]
    public async Task<ActionResult> ToggleLike(string targetMemberId)
    {
        var sourceMemberId = User.GetMemberId();

        if (sourceMemberId == null) return NotFound(); //User being liked does not exist

        if (sourceMemberId == targetMemberId) return BadRequest(); //a user can not like himself

        var existingLike = await likesRepository.GetMemberLike(sourceMemberId, targetMemberId);

        if (existingLike == null)
        {
            var like = new MemberLike
            {
                SourceMemberId = sourceMemberId,
                TargetMemberId = targetMemberId

            };

            likesRepository.AddLike(like);
        }
        else
        {
            likesRepository.DeleteLike(existingLike);
        }

        if (await likesRepository.SaveAllChanges()) return Ok();

        return BadRequest("Failed to update like");

    }

    [HttpGet("list")]

    public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
    {
        var memberId = User.GetMemberId();

        if (memberId == null)
        {
            return Unauthorized();
        }
        return Ok(await likesRepository.GetCurrentMemberLikeIds(memberId));
    }


    [HttpGet]

    public async Task<ActionResult<PaginatedResult<Member>>> GetMemberLikes([FromQuery] LikeParams likeParams)
    {
        var currentMemberId = User.GetMemberId();

        if (currentMemberId == null) return Unauthorized();

        var members = await likesRepository.GetMemberLikes(likeParams);

        return Ok(members);
    }

}
