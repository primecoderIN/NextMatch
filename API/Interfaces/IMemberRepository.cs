
using API.Entities;

namespace API.Interfaces;

public interface IMemberRepository
{
    void Update(Member member);

    Task<bool> SaveAllAsync();

    Task<IReadOnlyList<Member>> GetMembersAsync();

    Task<Member?> GetMemberByIdAsyc(string id);
    Task<Member?> GetMemberByIdForUpdate(string id);

    Task<IReadOnlyList<Photo>> GetPhotoForMemberAsync(string memberId);
}
