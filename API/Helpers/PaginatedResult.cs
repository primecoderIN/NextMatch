using Microsoft.EntityFrameworkCore;

// ...existing code...
namespace API.Helpers;

public class PaginatedResult<T>
{

    public PaginationMetaData MetaData { get; set; } = default!; // Initialize MetaData to avoid null reference issues
    public List<T> Items { get; set; } = new List<T>(); // Initialize Items to an empty list to avoid null reference issues
}
// ...existing code...
public class PaginationMetaData
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
};
// ...existing code...

public class PaginationHelper<T>
{
    public static async Task<PaginatedResult<T>> CreateAsync(IQueryable<T> query, int pageNumber, int pageSize)
    {
        var count = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var meta = new PaginationMetaData
        {
            CurrentPage = pageNumber,
            TotalPages = (int)Math.Ceiling(count / (double)pageSize),
            PageSize = pageSize,
            TotalCount = count
        };

        return new PaginatedResult<T>
        {
            MetaData = meta,
            Items = items
        };
    }
}