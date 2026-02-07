
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMemberRepository
{
    void Update(Member member);

    Task<bool> SaveAllAsync();

    Task<PaginatedResult<Member>> GetMembersAsync(PaginationParams paginationParams);

    Task<Member?> GetMemberByIdAsyc(string id);
    Task<Member?> GetMemberByIdForUpdate(string id);

    Task<IReadOnlyList<Photo>> GetPhotoForMemberAsync(string memberId);
}
