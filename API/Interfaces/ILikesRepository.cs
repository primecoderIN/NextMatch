
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface ILikesRepository
{
    Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId);

    Task<PaginatedResult<Member>> GetMemberLikes(LikeParams likeParams); //Based on predicate returns different responses

    Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId); //List of users that current user liked

    void DeleteLike(MemberLike like);

    void AddLike(MemberLike like);

    Task<bool> SaveAllChanges();
}
