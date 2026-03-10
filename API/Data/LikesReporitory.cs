using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;
//Source member likes target member
public class LikesReporitory(AppDBContext context) : ILikesRepository
{


    public async Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId) //List of users whom current user liked
    {
        return await context.Likes.Where(x => x.SourceMemberId == memberId).Select(x => x.TargetMemberId).ToListAsync();
    }

    public async Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId)
    {
        return await context.Likes.FindAsync(sourceMemberId, targetMemberId);
    }

public async Task<PaginatedResult<Member>> GetMemberLikes(LikeParams likeParams)
{
    var query = context.Likes.AsQueryable();
    IQueryable<Member> result;

    switch (likeParams.Predicate)
    {
        case "liked":
            result = query
                .Where(like => like.SourceMemberId == likeParams.MemberId)
                .Select(like => like.TargetMember);
            break;

        case "likedBy":
            result = query
                .Where(like => like.TargetMemberId == likeParams.MemberId)
                .Select(like => like.SourceMember);
            break;

        default: // mutual likes
            var likeIds = await GetCurrentMemberLikeIds(likeParams.MemberId);

            result = query
                .Where(like =>
                    like.TargetMemberId == likeParams.MemberId &&
                    likeIds.Contains(like.SourceMemberId))
                .Select(like => like.SourceMember);
            break;
    }

    return await PaginationHelper<Member>.CreateAsync(
        result,
        likeParams.PageNumber,
        likeParams.PageSize
    );
}

    public async void AddLike(MemberLike like)
    {
        context.Likes.Add(like);
    }

    public async void DeleteLike(MemberLike like)
    {
        context.Likes.Remove(like);
    }

    public  async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync()>0;
    }
}
