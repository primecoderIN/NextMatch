using API.Entities;
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

    public async Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId)
    {
        var query = context.Likes.AsQueryable();

        switch (predicate)
        {
            case "liked":
                return await query.Where(x => x.SourceMemberId == memberId)
                .Select(x => x.TargetMember)
                .ToListAsync();
            case "likedBy":
                return await query
                .Where(x => x.TargetMemberId == memberId)
                .Select(x => x.SourceMember)
                .ToListAsync();
            default: //mutual likes
                var likeIds = await GetCurrentMemberLikeIds(memberId);
                return await query
                .Where(x => x.TargetMemberId == memberId && likeIds.Contains(x.SourceMemberId))
                .Select(x => x.SourceMember).ToListAsync();

        }
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
