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
    .Where(x => x.Id == memberId) //Find the member with the specified memberId
    .SelectMany(x => x.Photos) //Get photos for that member ,SelectMany is used to flatten the collection of photos for the member into a single sequence of photos.
    .ToListAsync(); //Execute the query and return the result as a list of photos. ToListAsync is an asynchronous version of ToList that executes the query and returns the results as a List<T>.
  }

  public async Task<bool> SaveAllAsync()
  {
    return await context.SaveChangesAsync() > 0; //If it is greater than 0, it means that one or more changes were successfully saved to the database, and we return true. If it is 0, it means that no changes were made to the database, and we return false.
  }

  public void Update(Member member) //This method is used to mark an entity as modified in the context, which means that when SaveChangesAsync is called, EF Core will generate an UPDATE statement for that entity in the database. By calling this method, we can ensure that any changes made to the member entity are properly tracked and persisted to the database when SaveChangesAsync is called.
  {
    context.Entry(member).State = EntityState.Modified; //This line of code is used to mark the state of the member entity as modified in the Entity Framework Core (EF Core) context. By setting the state to EntityState.Modified, we are indicating to EF Core that the member entity has been changed and should be updated in the database when SaveChangesAsync is called. This is necessary because EF Core uses change tracking to determine which entities have been modified and need to be persisted to the database. By marking the entity as modified, we ensure that any changes made to the member entity will be properly saved to the database when SaveChangesAsync is called.
  }
}
