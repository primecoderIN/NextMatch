

namespace API.Helpers;

public class MemberParams : PaginationParams //Inherit pagination params and add additional member params for filter
{

    public string? Gender { get; set; }

    public string? CurrentMemberId { get; set; }

    public int MinAge {get;set;}

    public int MaxAge {get;set;}

    public string OrderBy {get;set;}="lastActive";

}
