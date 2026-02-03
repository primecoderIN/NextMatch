using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MemberRepository(AppDBContext context) : IMemberRepository
{
  public async Task<Member?> GetMemberByIdAsyc(string id) //Just to get a single member by id
  {
    return await context.Members.FindAsync(id);
  }

  public async Task<Member?> GetMemberByIdForUpdate(string id)
  {
    return await context.Members.Include(x => x.User).Include(x => x.Photos).SingleOrDefaultAsync(x => x.Id == id);
  }

  public async Task<IReadOnlyList<Member>> GetMembersAsync()
  {
    return await context.Members.ToListAsync();
  }

  public async Task<IReadOnlyList<Photo>> GetPhotoForMemberAsync(string memberId)
  {
    return await context.Members
    .Where(x => x.Id == memberId)
    .SelectMany(x => x.Photos)
    .ToListAsync();
  }

  public async Task<bool> SaveAllAsync()
  {
    return await context.SaveChangesAsync() > 0; //1 or more items saved into database
  }

  public void Update(Member member)
  {
    context.Entry(member).State = EntityState.Modified;
  }
}
