
using API.Entities;

namespace API.Interfaces;

public interface ILikesRepository
{
    Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId);

    Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId); //Based on predicate returns different responses

    Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId); //List of users that current user liked

    void DeleteLike(MemberLike like);

    void AddLike(MemberLike like);

    Task<bool> SaveAllChanges();
}
