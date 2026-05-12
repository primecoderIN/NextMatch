using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MemberRepository(AppDBContext context) : IMemberRepository
{
  public async Task<Member?> GetMemberByIdAsyc(string id) //Just to get a single member by id
  {
    return await context.Members.FindAsync(id); //FindAsync is a method provided by EF Core that retrieves an entity by its primary key. It returns null if no entity is found with the given id.
    //FindAsync is more efficient than SingleOrDefaultAsync for primary key lookups because it can take advantage of EF Core's first-level cache and doesn't require a database query if the entity is already tracked in memory.
  }

  public async Task<Member?> GetMemberByIdForUpdate(string id)
  {
    return await context.Members.Include(x => x.User).Include(x => x.Photos).SingleOrDefaultAsync(x => x.Id == id);
  }

  public async Task<PaginatedResult<Member>> GetMembersAsync(MemberParams memberParams)
  {
    var query = context.Members.AsQueryable();

    query = query.Where(x => x.Id != memberParams.CurrentMemberId);

    if (memberParams.Gender != null)
    {
      var gender = memberParams.Gender.ToLower();
      query = query.Where(x => x.Gender.ToLower() == gender);
    }

    var minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MaxAge - 1));
    var maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MinAge));

    query = query.Where(x => x.DateOfBirth >= minDob && x.DateOfBirth <= maxDob);

    query = memberParams.OrderBy switch
    {
      "createdAt" => query.OrderByDescending(x => x.CreatedAt),
      _ => query.OrderByDescending(x => x.LastActive)
    };

    return await PaginationHelper<Member>.CreateAsync(query, memberParams.PageNumber, memberParams.PageSize);
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
